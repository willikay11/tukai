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

import { useQuery, useQueryClient } from '@tanstack/react-query';

import { toast } from '@/app/shared/hooks/useToast';
import { useAuthDialog } from '@/context/AuthDialogContext';
import { useHostingPlan } from '@/context/HostingPlanContext';
import { confirmTukaiAction, deleteTukaiSession, sendTukaiMessage } from '@/services/tukai';
import {
  confirmTukaiSubscription,
  fetchTukaiPlan,
  fetchTukaiSubscription,
  startTukaiCheckout,
} from '@/services/tukaiPlan';
import {
  addTukaiMessage,
  deleteTukaiChat,
  patchTukaiMessage,
  removeTukaiMessage,
  startTukaiChat,
} from '@/slices/tukaiSlice';
import type { RootState } from '@/store/store';
import type { ApiResponse } from '@/types/apiResponse';
import type {
  TukaiAccess,
  TukaiChat,
  TukaiMessage,
  TukaiPaywallReason,
  TukaiReply,
} from '@/types/tukai';
import {
  TUKAI_FREE_CHATS,
  TUKAI_FREE_MESSAGES,
  TUKAI_PRICE_LABEL,
  chatTitleFrom,
  countUserMessages,
} from '@/utils/tukai';

export const TUKAI_ROUTE = '/ai';

export type TukaiView = 'chat' | 'paywall' | 'pay' | 'paid';
const PAYMENT_FAILED =
  "The payment didn't go through, and nothing was charged. Try again, or use another method.";
const ERROR_TEXT = 'TukAI could not answer just now. Check your connection and try again.';

const newId = (prefix: string) =>
  `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/** A reply from the chat or confirm route as a chat message, or the error line. */
const toAiMessage = (result: ApiResponse<TukaiReply>): TukaiMessage => {
  const reply = result.data;
  if (!result.success || !reply) {
    return {
      id: newId('m'),
      role: 'ai',
      createdAt: new Date().toISOString(),
      text: ERROR_TEXT,
      error: true,
    };
  }
  return {
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
    requiresConfirmation: reply.requiresConfirmation || undefined,
    actions: reply.actions?.length ? reply.actions : undefined,
  };
};

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
  /** Answers a reply that asked for confirmation before TukAI acts. */
  confirm: (messageId: string, confirmed: boolean) => void;
  newChat: () => void;
  openChat: (chatId: string) => void;
  deleteChat: (chatId: string) => void;

  /** Composer locked at 10 messages, or no free chats left with nothing open. */
  isCapped: boolean;
  hasNoFreeChats: boolean;

  showPaywall: (reason: TukaiPaywallReason) => void;
  goToPay: () => void;
  backFromPaywall: () => void;
  /** The TukAI plan's price from the API, e.g. "$14.99". */
  priceLabel: string;
  /**
   * Paying (DEV-373): opening the Pay step starts a TukAI subscription and
   * loads its Paystack checkout here. The buyer picks M-Pesa or card there.
   */
  checkoutUrl: string | null;
  isStartingCheckout: boolean;
  /** Paystack reported a payment; reading the subscription back. */
  isConfirmingPayment: boolean;
  payError: string | null;
  /** Paystack's answer: true once paid, false when it failed or was cancelled. */
  onPaymentResult: (paid: boolean) => void;
  /** Starts a fresh checkout, after a failure. */
  retryCheckout: () => void;
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
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();

  const userId: string | null = (session?.user as any)?.id ?? null;
  const stored = useSelector((state: RootState) => state.tukaiReducer);
  // Another account's chats are never shown, even before the slice resets
  const mine = Boolean(userId) && stored?.ownerId === userId;
  const chats = useMemo(() => (mine ? stored.chats : []), [mine, stored?.chats]);
  const freeChatsUsed = mine ? stored.freeChatsUsed : 0;

  // The TukAI plan and the account's live TukAI subscription, from the API.
  // Access follows the subscription, so it's the same on every device.
  const queryClient = useQueryClient();
  const { data: tukaiPlan } = useQuery({
    queryKey: ['tukai-plan'],
    queryFn: fetchTukaiPlan,
    enabled: Boolean(userId),
    staleTime: 60 * 60 * 1000,
  });
  const { data: tukaiSubscription } = useQuery({
    queryKey: ['tukai-subscription', userId],
    queryFn: fetchTukaiSubscription,
    enabled: Boolean(userId),
  });
  const planRenewsAt = tukaiSubscription?.renewsAt ?? null;
  const priceLabel = tukaiPlan?.priceLabel ?? TUKAI_PRICE_LABEL;

  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [view, setView] = useState<TukaiView>('chat');
  const [paywallReason, setPaywallReason] = useState<TukaiPaywallReason | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [input, setInputState] = useState('');
  const [focusRequest, setFocusRequest] = useState(0);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [pendingSubscriptionId, setPendingSubscriptionId] = useState<string | null>(null);
  const [isStartingCheckout, setIsStartingCheckout] = useState(false);
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
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
  const hasTukaiPlan = Boolean(tukaiSubscription);

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

  /** Waits on one call to TukAI and adds its reply to the chat. */
  const reply = useCallback(
    async (chatId: string, call: () => Promise<ApiResponse<TukaiReply>>) => {
      busyRef.current = true;
      setBusy(true);
      const message = toAiMessage(await call());
      dispatch(addTukaiMessage({ chatId, message }));
      // A new reply takes the map, unless the person picked an older one
      setMapMessageId(null);
      setSelectedPinId(null);
      busyRef.current = false;
      setBusy(false);
      return message;
    },
    [dispatch],
  );

  /**
   * Sends the latest message. The chat's id is the agent's session id, and
   * the agent keeps the history, so only the new message goes.
   */
  const run = useCallback(
    (chatId: string, messages: TukaiMessage[]) => {
      const message = [...messages].reverse().find((m) => m.role === 'user')?.text ?? '';
      return reply(chatId, () => sendTukaiMessage({ sessionId: chatId, message }));
    },
    [reply],
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

  const confirm = useCallback(
    async (messageId: string, confirmed: boolean) => {
      if (busyRef.current || !currentChat) return;
      const chatId = currentChat.id;
      const confirmation = confirmed ? 'confirmed' : 'declined';
      dispatch(patchTukaiMessage({ chatId, messageId, patch: { confirmation } }));
      const message = await reply(chatId, () =>
        confirmTukaiAction({ sessionId: chatId, confirmed }),
      );
      // Failed: the question stays open so the person can answer again
      if (message.error) {
        dispatch(removeTukaiMessage({ chatId, messageId: message.id }));
        dispatch(patchTukaiMessage({ chatId, messageId, patch: { confirmation: undefined } }));
        toast({ description: ERROR_TEXT });
      }
    },
    [currentChat, dispatch, reply],
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
      // Ends the agent's session too; the chat is gone here either way
      deleteTukaiSession(chatId);
      if (chatId === currentChatId) {
        setCurrentChatId(null);
        setMapMessageId(null);
        setMapSheetOpen(false);
      }
      toast({ description: 'Chat deleted.' });
    },
    [currentChatId, dispatch],
  );

  const clearCheckout = useCallback(() => {
    setCheckoutUrl(null);
    setPendingSubscriptionId(null);
    setPayError(null);
  }, []);

  const backFromPaywall = useCallback(() => {
    if (view === 'pay') {
      // Nothing is charged until Paystack confirms; leaving drops the checkout
      clearCheckout();
      setView('paywall');
      return;
    }
    if (paywallReason === 'helper') setIsUpgradeOpen(false);
    setView('chat');
    setPaywallReason(null);
  }, [clearCheckout, paywallReason, view]);

  // Starts the TukAI subscription and loads its Paystack checkout
  const startCheckout = useCallback(async () => {
    if (isStartingCheckout || !userId) return;
    if (!tukaiPlan) {
      setPayError("TukAI can't be bought just now. Nothing was charged. Try again later.");
      return;
    }
    clearCheckout();
    setIsStartingCheckout(true);
    try {
      const checkout = await startTukaiCheckout(tukaiPlan.id);
      if (!checkout.authorizationUrl) throw new Error('Could not open the payment.');
      setPendingSubscriptionId(checkout.subscriptionId);
      setCheckoutUrl(checkout.authorizationUrl);
    } catch (error: any) {
      setPayError(error?.message ?? 'Could not open the payment. Try again.');
    } finally {
      setIsStartingCheckout(false);
    }
  }, [clearCheckout, isStartingCheckout, tukaiPlan, userId]);

  const goToPay = useCallback(() => {
    setView('pay');
    void startCheckout();
  }, [startCheckout]);

  const onPaymentResult = useCallback(
    async (paid: boolean) => {
      if (!paid) {
        setPayError(PAYMENT_FAILED);
        return;
      }
      setPayError(null);
      setIsConfirmingPayment(true);
      try {
        const live = pendingSubscriptionId
          ? await confirmTukaiSubscription(pendingSubscriptionId)
          : null;
        await queryClient.invalidateQueries({ queryKey: ['tukai-subscription'] });
        if (live) {
          queryClient.setQueryData(['tukai-subscription', userId], live);
          clearCheckout();
          setView('paid');
        } else {
          setPayError(
            'Paystack has your payment and we are still confirming it. Give it a minute, then open TukAI again.',
          );
        }
      } catch {
        setPayError(
          'Your payment went through, but we could not confirm it yet. Try again in a minute.',
        );
      } finally {
        setIsConfirmingPayment(false);
      }
    },
    [clearCheckout, pendingSubscriptionId, queryClient, userId],
  );

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
      confirm,
      newChat,
      openChat,
      deleteChat,
      isCapped,
      hasNoFreeChats,
      showPaywall,
      goToPay,
      backFromPaywall,
      priceLabel,
      checkoutUrl,
      isStartingCheckout,
      isConfirmingPayment,
      payError,
      onPaymentResult,
      retryCheckout: () => void startCheckout(),
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
      confirm,
      newChat,
      openChat,
      deleteChat,
      isCapped,
      hasNoFreeChats,
      showPaywall,
      goToPay,
      backFromPaywall,
      priceLabel,
      checkoutUrl,
      isStartingCheckout,
      isConfirmingPayment,
      payError,
      onPaymentResult,
      startCheckout,
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
