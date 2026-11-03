'use client';

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';

import { toast } from '@/app/shared/hooks/useToast';
import { useAuthDialog } from '@/context/AuthDialogContext';
import { useHostingPlan } from '@/context/HostingPlanContext';
import { useLocation } from '@/context/LocationContext';
import { sendTukaiMessage } from '@/services/tukai';
import {
  addTukaiMessage,
  deleteTukaiChat,
  removeTukaiMessage,
  setTukaiPlanRenewal,
  startTukaiChat,
} from '@/slices/tukaiSlice';
import type { RootState } from '@/store/store';
import type { TukaiAccess, TukaiChat, TukaiMessage, TukaiPaywallReason } from '@/types/tukai';
import {
  TUKAI_FREE_CHATS,
  TUKAI_FREE_MESSAGES,
  buildTukaiHistory,
  chatTitleFrom,
  countUserMessages,
} from '@/utils/tukai';

export const TUKAI_ROUTE = '/ai';

export type TukaiView = 'chat' | 'paywall' | 'pay' | 'paid';
export type TukaiPayMethod = 'mpesa' | 'card';

/**
 * Payments for the TukAI plan have no API yet. With this set to `demo` the
 * Pay step confirms after 1.6 seconds, as the prototype does, so the paid
 * experience can be tried; otherwise Pay says it is not open yet.
 */
const DEMO_PAYMENTS = process.env.NEXT_PUBLIC_TUKAI_PAYMENTS === 'demo';
const ERROR_TEXT = 'TukAI could not answer just now. Check your connection and try again.';

const newId = (prefix: string) =>
  `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const todayLine = () =>
  new Date()
    .toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    .replace(',', '');

type TukaiContextValue = {
  isSignedIn: boolean;
  firstName: string;
  access: TukaiAccess;
  /** Unlimited chats, writing helpers and Create with TukAI. */
  isUnlocked: boolean;
  freeChatsLeft: number;
  /** "2 free chats left", "TukAI plan", "Included in your Business plan". */
  statusLine: string;

  chats: TukaiChat[];
  currentChat: TukaiChat | null;
  view: TukaiView;
  paywallReason: TukaiPaywallReason | null;
  busy: boolean;
  input: string;
  setInput: (value: string) => void;
  /** Set when the composer should take focus on its next render. */
  focusRequest: number;

  /** Opens TukAI, asking the person to sign in first when they need to. */
  openTukai: () => void;
  ask: (text: string) => void;
  retry: (messageId: string) => void;
  newChat: () => void;
  openChat: (chatId: string) => void;
  deleteChat: (chatId: string) => void;

  /** Composer locked at 10 messages, or no free chats left with nothing open. */
  isCapped: boolean;
  hasNoFreeChats: boolean;

  showPaywall: (reason: TukaiPaywallReason) => void;
  goToPay: () => void;
  backFromPaywall: () => void;
  payMethod: TukaiPayMethod;
  setPayMethod: (method: TukaiPayMethod) => void;
  phone: string;
  setPhone: (value: string) => void;
  isPaying: boolean;
  pay: () => void;
  continueAfterPaid: () => void;

  /** The upgrade drawer, opened by writing helpers for someone without TukAI. */
  isUpgradeOpen: boolean;
  closeUpgrade: () => void;

  isHistoryOpen: boolean;
  setHistoryOpen: (open: boolean) => void;
  /** The reply whose places the map shows; null picks the latest one with places. */
  mapMessageId: string | null;
  isMapSheetOpen: boolean;
  showOnMap: (messageId: string | null) => void;
  setMapSheetOpen: (open: boolean) => void;
  selectedPinId: string | null;
  selectPin: (id: string | null) => void;
};

const TukaiContext = createContext<TukaiContextValue | null>(null);

/**
 * TukAI for the whole app: the page at /ai, the Ask TukAI button and the
 * account menu all read the same chats and allowance from here.
 *
 * Chats live in Redux (slices/tukaiSlice.ts) so they persist; everything
 * about the screen - which view, what is typed, the map - is held here.
 */
export const TukaiProvider = ({ children }: { children: ReactNode }) => {
  const { data: session } = useSession();
  const { needAuth } = useAuthDialog();
  const hostingPlan = useHostingPlan();
  const location = useLocation();
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();

  const userId: string | null = (session?.user as any)?.id ?? null;
  const stored = useSelector((state: RootState) => state.tukaiReducer);
  // Another account's chats are never shown, even before the slice resets
  const mine = Boolean(userId) && stored?.ownerId === userId;
  const chats = useMemo(() => (mine ? stored.chats : []), [mine, stored?.chats]);
  const freeChatsUsed = mine ? stored.freeChatsUsed : 0;
  const planRenewsAt = mine ? stored.planRenewsAt : null;

  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [view, setView] = useState<TukaiView>('chat');
  const [paywallReason, setPaywallReason] = useState<TukaiPaywallReason | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [input, setInputState] = useState('');
  const [focusRequest, setFocusRequest] = useState(0);
  const [payMethod, setPayMethod] = useState<TukaiPayMethod>('mpesa');
  const [phone, setPhone] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isHistoryOpen, setHistoryOpen] = useState(false);
  const [mapMessageId, setMapMessageId] = useState<string | null>(null);
  const [isMapSheetOpen, setMapSheetOpen] = useState(false);
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  // Read synchronously, so a double press cannot send twice before the
  // `busy` state lands
  const busyRef = useRef(false);
  // The latest `ask`, for the message that waited on payment: the one in
  // scope when Pay was pressed still thinks the account is free
  const askRef = useRef<(text: string) => void>(() => {});

  const businessPlan =
    Boolean(hostingPlan?.hasActivePlan) &&
    /business/i.test(
      hostingPlan?.plans.find((p) => p.id === hostingPlan.currentPlan.planId)?.name ??
        String(hostingPlan?.currentPlan.planId ?? ''),
    );
  const hasTukaiPlan = Boolean(planRenewsAt && new Date(planRenewsAt).getTime() > Date.now());

  const access: TukaiAccess = {
    plan: hasTukaiPlan ? 'tukai' : businessPlan ? 'business' : 'free',
    freeChatsUsed,
    renewsAt: hasTukaiPlan ? planRenewsAt! : undefined,
  };
  const isUnlocked = access.plan !== 'free';
  const freeChatsLeft = isUnlocked
    ? TUKAI_FREE_CHATS
    : Math.max(0, TUKAI_FREE_CHATS - freeChatsUsed);
  const statusLine = isUnlocked
    ? access.plan === 'business'
      ? 'Included in your Business plan'
      : 'TukAI plan'
    : freeChatsLeft === 2
      ? '2 free chats left'
      : freeChatsLeft === 1
        ? '1 free chat left'
        : 'No free chats left';

  const currentChat = chats.find((c) => c.id === currentChatId) ?? null;
  const isCapped =
    !isUnlocked &&
    Boolean(currentChat) &&
    countUserMessages(currentChat!.messages) >= TUKAI_FREE_MESSAGES;
  const hasNoFreeChats = !isUnlocked && !currentChat && freeChatsLeft <= 0;

  const setInput = useCallback((value: string) => setInputState(value.slice(0, 2000)), []);

  const openTukai = useCallback(() => {
    const go = () => router.push(TUKAI_ROUTE);
    if (needAuth('tukai', go)) return;
    go();
  }, [needAuth, router]);

  const run = useCallback(
    async (chatId: string, messages: TukaiMessage[]) => {
      busyRef.current = true;
      setBusy(true);
      const question = [...messages].reverse().find((m) => m.role === 'user')?.text ?? '';
      const result = await sendTukaiMessage({
        messages: buildTukaiHistory(messages),
        question,
        city: location.city || location.homeCity || 'Nairobi',
        lat: location.lat,
        lng: location.lng,
        today: todayLine(),
      });
      const reply = result.data;
      const message: TukaiMessage =
        result.success && reply
          ? {
              id: newId('m'),
              role: 'ai',
              createdAt: new Date().toISOString(),
              text: reply.text,
              error: reply.error,
              cards: reply.cards,
              plan: reply.plan ?? undefined,
              draft: reply.draft ?? undefined,
              writing: reply.writing ?? undefined,
              suggestions: reply.suggestions,
              items: reply.items,
            }
          : {
              id: newId('m'),
              role: 'ai',
              createdAt: new Date().toISOString(),
              text: ERROR_TEXT,
              error: true,
            };
      dispatch(addTukaiMessage({ chatId, message }));
      // A new reply takes the map, unless the person picked an older one
      setMapMessageId(null);
      setSelectedPinId(null);
      busyRef.current = false;
      setBusy(false);
    },
    [dispatch, location.city, location.homeCity, location.lat, location.lng],
  );

  const ask = useCallback(
    (raw: string) => {
      const text = String(raw || '').trim();
      if (!text || busyRef.current || !userId) return;

      let chat = currentChat;
      if (!chat) {
        if (!isUnlocked && freeChatsUsed >= TUKAI_FREE_CHATS) {
          // The message waits for payment and goes once TukAI is unlocked
          setPending(text);
          setPaywallReason('chats');
          setView('paywall');
          if (pathname !== TUKAI_ROUTE) router.push(TUKAI_ROUTE);
          return;
        }
        chat = {
          id: newId('ch'),
          title: chatTitleFrom(text),
          createdAt: new Date().toISOString(),
          messages: [],
        };
        dispatch(startTukaiChat({ ownerId: userId, chat, countsAsFree: !isUnlocked }));
        setCurrentChatId(chat.id);
      }
      if (!isUnlocked && countUserMessages(chat.messages) >= TUKAI_FREE_MESSAGES) return;

      const message: TukaiMessage = {
        id: newId('m'),
        role: 'user',
        text,
        createdAt: new Date().toISOString(),
      };
      dispatch(addTukaiMessage({ chatId: chat.id, message }));
      setInputState('');
      setView('chat');
      if (pathname !== TUKAI_ROUTE) router.push(TUKAI_ROUTE);
      run(chat.id, [...chat.messages, message]);
    },
    [currentChat, dispatch, freeChatsUsed, isUnlocked, pathname, router, run, userId],
  );
  askRef.current = ask;

  const retry = useCallback(
    (messageId: string) => {
      if (busyRef.current || !currentChat) return;
      dispatch(removeTukaiMessage({ chatId: currentChat.id, messageId }));
      run(
        currentChat.id,
        currentChat.messages.filter((m) => m.id !== messageId),
      );
    },
    [currentChat, dispatch, run],
  );

  const showPaywall = useCallback((reason: TukaiPaywallReason) => {
    setPaywallReason(reason);
    setView('paywall');
    if (reason === 'helper') setIsUpgradeOpen(true);
  }, []);

  const newChat = useCallback(() => {
    if (!isUnlocked && freeChatsUsed >= TUKAI_FREE_CHATS) {
      showPaywall('chats');
      return;
    }
    setCurrentChatId(null);
    setView('chat');
    setInputState('');
    setMapMessageId(null);
    setMapSheetOpen(false);
    setSelectedPinId(null);
    setFocusRequest((n) => n + 1);
  }, [freeChatsUsed, isUnlocked, showPaywall]);

  const openChat = useCallback((chatId: string) => {
    setCurrentChatId(chatId);
    setView('chat');
    setMapMessageId(null);
    setMapSheetOpen(false);
    setSelectedPinId(null);
  }, []);

  const deleteChat = useCallback(
    (chatId: string) => {
      dispatch(deleteTukaiChat(chatId));
      if (chatId === currentChatId) {
        setCurrentChatId(null);
        setMapMessageId(null);
        setMapSheetOpen(false);
      }
      toast({ description: 'Chat deleted.' });
    },
    [currentChatId, dispatch],
  );

  const backFromPaywall = useCallback(() => {
    if (view === 'pay') {
      setView('paywall');
      return;
    }
    if (paywallReason === 'helper') setIsUpgradeOpen(false);
    setView('chat');
    setPaywallReason(null);
  }, [paywallReason, view]);

  const pay = useCallback(() => {
    if (isPaying || !userId) return;
    if (payMethod === 'mpesa' && phone.replace(/\D/g, '').length < 9) {
      toast({ description: 'Add the M-Pesa number to pay from.' });
      return;
    }
    if (!DEMO_PAYMENTS) {
      toast({ description: 'Payments for TukAI open soon. Nothing was charged.' });
      return;
    }
    setIsPaying(true);
    window.setTimeout(() => {
      const renews = new Date();
      renews.setMonth(renews.getMonth() + 1);
      dispatch(setTukaiPlanRenewal({ ownerId: userId, renewsAt: renews.toISOString() }));
      setIsPaying(false);
      setView('paid');
    }, 1600);
  }, [dispatch, isPaying, payMethod, phone, userId]);

  const continueAfterPaid = useCallback(() => {
    const waiting = pending;
    setView('chat');
    setPending(null);
    if (paywallReason === 'helper') setIsUpgradeOpen(false);
    setPaywallReason(null);
    // Unlocked on this render, so the waiting message goes on the next
    if (waiting) window.setTimeout(() => askRef.current(waiting), 0);
  }, [paywallReason, pending]);

  const showOnMap = useCallback((messageId: string | null) => {
    setMapMessageId(messageId);
    setSelectedPinId(null);
    setMapSheetOpen(true);
  }, []);

  const value = useMemo<TukaiContextValue>(
    () => ({
      isSignedIn: Boolean(userId),
      firstName: String(session?.user?.name || '').split(' ')[0],
      access,
      isUnlocked,
      freeChatsLeft,
      statusLine,
      chats,
      currentChat,
      view,
      paywallReason,
      busy,
      input,
      setInput,
      focusRequest,
      openTukai,
      ask,
      retry,
      newChat,
      openChat,
      deleteChat,
      isCapped,
      hasNoFreeChats,
      showPaywall,
      goToPay: () => setView('pay'),
      backFromPaywall,
      payMethod,
      setPayMethod,
      phone,
      setPhone: (v: string) => setPhone(v.slice(0, 20)),
      isPaying,
      pay,
      continueAfterPaid,
      isUpgradeOpen,
      closeUpgrade: () => setIsUpgradeOpen(false),
      isHistoryOpen,
      setHistoryOpen,
      mapMessageId,
      isMapSheetOpen,
      showOnMap,
      setMapSheetOpen,
      selectedPinId,
      selectPin: setSelectedPinId,
    }),
    // `access` is rebuilt every render from the values listed here
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      userId,
      session?.user?.name,
      access.plan,
      access.freeChatsUsed,
      access.renewsAt,
      isUnlocked,
      freeChatsLeft,
      statusLine,
      chats,
      currentChat,
      view,
      paywallReason,
      busy,
      input,
      setInput,
      focusRequest,
      openTukai,
      ask,
      retry,
      newChat,
      openChat,
      deleteChat,
      isCapped,
      hasNoFreeChats,
      showPaywall,
      backFromPaywall,
      payMethod,
      phone,
      isPaying,
      pay,
      continueAfterPaid,
      isUpgradeOpen,
      isHistoryOpen,
      mapMessageId,
      isMapSheetOpen,
      showOnMap,
      selectedPinId,
    ],
  );

  return <TukaiContext.Provider value={value}>{children}</TukaiContext.Provider>;
};

export const useTukai = (): TukaiContextValue => {
  const ctx = useContext(TukaiContext);
  if (!ctx) throw new Error('useTukai must be used inside TukaiProvider');
  return ctx;
};

/** For components that may render outside the provider, such as in tests. */
export const useOptionalTukai = (): TukaiContextValue | null => useContext(TukaiContext);
