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
import { deleteTukaiConversation, fetchTukaiConversation } from '@/services/tukaiConversations';
import {
  confirmTukaiSubscription,
  fetchTukaiAllowance,
  fetchTukaiPlan,
  fetchTukaiSubscription,
  startTukaiCheckout,
} from '@/services/tukaiPlan';
import {
  addTukaiMessage,
  deleteTukaiChat,
  loadTukaiChat,
  patchTukaiMessage,
  removeTukaiMessage,
  startTukaiChat,
} from '@/slices/tukaiSlice';
import type { RootState } from '@/store/store';
import type { ApiResponse } from '@/types/apiResponse';
import type {
  TukaiAccess,
  TukaiChat,
  TukaiConversation,
  TukaiMessage,
  TukaiPaywallReason,
  TukaiReply,
} from '@/types/tukai';
import { TUKAI_PRICE_LABEL, chatTitleFrom, freeMessagesText } from '@/utils/tukai';
import { savedChatToTukaiChat } from '@/utils/tukai-saved-chats';

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
  /**
   * Free messages left this month, from the server (DEV-374). Null when
   * TukAI is unlimited, or before the count has loaded.
   */
  freeMessagesLeft: number | null;
  /** When the free messages come back: the start of next month. */
  freeMessagesResetAt: string | null;
  /** "18 free messages left this month", "TukAI plan", "Included in your Business plan". */
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
  /**
   * Opens a chat from the server's list (DEV-474): from this browser's copy
   * when it has one, else loaded from the server - a chat from another
   * device, say. Resolves true once it's open.
   */
  openSavedChat: (conversation: TukaiConversation) => Promise<boolean>;
  /** The saved chat being loaded, by its server id */
  openingChatId: string | null;
  /** Forgets a chat here and on the server */
  deleteChat: (chatId: string, conversationId?: string) => void;

  /** No free messages left this month and no TukAI plan: the composer locks. */
  isCapped: boolean;

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
  // This month's free messages, counted by the server on every device
  const { data: allowance } = useQuery({
    queryKey: ['tukai-allowance', userId],
    queryFn: fetchTukaiAllowance,
    enabled: Boolean(userId),
  });
  const refreshAllowance = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ['tukai-allowance'] }),
    [queryClient],
  );
  // The server's chats list: a reply adds to it, so it is read again after one
  const refreshConversations = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ['tukai-conversations'] }),
    [queryClient],
  );
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
  const [openingChatId, setOpeningChatId] = useState<string | null>(null);
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
    freeMessagesUsed: allowance?.used ?? 0,
    renewsAt: hasTukaiPlan ? planRenewsAt! : undefined,
  };
  // A live TukAI subscription also shows as an unlimited allowance
  const isUnlocked = access.plan !== 'free' || Boolean(allowance?.unlimited);
  const freeMessagesLeft = isUnlocked ? null : (allowance?.remaining ?? null);
  const freeMessagesResetAt = allowance?.resetsAt ?? null;
  const statusLine = isUnlocked
    ? access.plan === 'business'
      ? 'Included in your Business plan'
      : 'TukAI plan'
    : freeMessagesText(freeMessagesLeft);

  const currentChat = chats.find((c) => c.id === currentChatId) ?? null;
  // Locked only once the server says none are left, never on a guess
  const isCapped = !isUnlocked && freeMessagesLeft === 0;

  const setInput = useCallback((value: string) => setInputState(value.slice(0, 2000)), []);

  const openTukai = useCallback(() => {
    const go = () => router.push(TUKAI_ROUTE);
    if (needAuth('tukai', go)) return;
    go();
  }, [needAuth, router]);

  /** Waits on one call to TukAI and adds its reply to the chat. */
  const reply = useCallback(
    async (
      chatId: string,
      call: () => Promise<ApiResponse<TukaiReply>>,
      onAllowanceUsedUp?: () => void,
    ) => {
      busyRef.current = true;
      setBusy(true);
      const result = await call();
      // Every reply may have used one of the month's free messages, and the
      // server has saved the chat's new messages
      void refreshAllowance();
      void refreshConversations();
      if (result.status === 402 && onAllowanceUsedUp) {
        busyRef.current = false;
        setBusy(false);
        onAllowanceUsedUp();
        return null;
      }
      const message = toAiMessage(result);
      dispatch(addTukaiMessage({ chatId, message }));
      // A new reply takes the map, unless the person picked an older one
      setMapMessageId(null);
      setSelectedPinId(null);
      busyRef.current = false;
      setBusy(false);
      return message;
    },
    [dispatch, refreshAllowance, refreshConversations],
  );

  /**
   * The server refused a message: this month's free messages are used up.
   * It wasn't recorded, so it comes back out of the chat and waits; the
   * paywall opens, and once TukAI is paid the message goes.
   */
  const holdForPayment = useCallback(
    (chatId: string, messageId: string, text: string) => {
      dispatch(removeTukaiMessage({ chatId, messageId }));
      setPending(text);
      setPaywallReason('allowance');
      setView('paywall');
      if (pathname !== TUKAI_ROUTE) router.push(TUKAI_ROUTE);
    },
    [dispatch, pathname, router],
  );

  /**
   * Sends the latest message. The chat's id is the agent's session id, and
   * the agent keeps the history, so only the new message goes.
   */
  const run = useCallback(
    (chatId: string, messages: TukaiMessage[]) => {
      const last = [...messages].reverse().find((m) => m.role === 'user');
      const message = last?.text ?? '';
      return reply(
        chatId,
        () => sendTukaiMessage({ sessionId: chatId, message }),
        last ? () => holdForPayment(chatId, last.id, message) : undefined,
      );
    },
    [holdForPayment, reply],
  );

  const ask = useCallback(
    (raw: string) => {
      const text = String(raw || '').trim();
      if (!text || busyRef.current || !userId) return;

      if (isCapped) {
        // No free messages left this month: it waits for payment and goes
        // once TukAI is unlocked
        setPending(text);
        setPaywallReason('allowance');
        setView('paywall');
        if (pathname !== TUKAI_ROUTE) router.push(TUKAI_ROUTE);
        return;
      }

      let chat = currentChat;
      if (!chat) {
        chat = {
          id: newId('ch'),
          title: chatTitleFrom(text),
          createdAt: new Date().toISOString(),
          messages: [],
        };
        dispatch(startTukaiChat({ ownerId: userId, chat, countsAsFree: false }));
        setCurrentChatId(chat.id);
      }

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
    [currentChat, dispatch, isCapped, pathname, router, run, userId],
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
      // Failed: the question stays open so the person can answer again.
      // (No allowance handler here, so a reply always comes back.)
      if (message?.error) {
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
    if (isCapped) {
      showPaywall('allowance');
      return;
    }
    setCurrentChatId(null);
    setView('chat');
    setInputState('');
    setMapMessageId(null);
    setMapSheetOpen(false);
    setSelectedPinId(null);
    setFocusRequest((n) => n + 1);
  }, [isCapped, showPaywall]);

  const openChat = useCallback((chatId: string) => {
    setCurrentChatId(chatId);
    setView('chat');
    setMapMessageId(null);
    setMapSheetOpen(false);
    setSelectedPinId(null);
  }, []);

  const openSavedChat = useCallback(
    async (conversation: TukaiConversation): Promise<boolean> => {
      // This browser's copy is the fuller one: it keeps plans and drafts
      if (chats.some((chat) => chat.id === conversation.sessionId)) {
        openChat(conversation.sessionId);
        return true;
      }
      if (!userId) return false;
      setOpeningChatId(conversation.id);
      try {
        const detail = await fetchTukaiConversation(conversation.id);
        dispatch(loadTukaiChat({ ownerId: userId, chat: savedChatToTukaiChat(detail) }));
        openChat(detail.sessionId);
        return true;
      } catch (error) {
        console.error('TukAI open chat:', error);
        toast({ description: 'That chat could not be opened. Try again.' });
        return false;
      } finally {
        setOpeningChatId(null);
      }
    },
    [chats, dispatch, openChat, userId],
  );

  const deleteChat = useCallback(
    (chatId: string, conversationId?: string) => {
      dispatch(deleteTukaiChat(chatId));
      // Forgotten on the server too, so it leaves the list on every device
      if (conversationId) {
        deleteTukaiConversation(conversationId)
          .catch((error) => console.error('TukAI delete chat:', error))
          .finally(() => void refreshConversations());
      }
      // Ends the agent's session too; the chat is gone here either way
      deleteTukaiSession(chatId);
      if (chatId === currentChatId) {
        setCurrentChatId(null);
        setMapMessageId(null);
        setMapSheetOpen(false);
      }
      toast({ description: 'Chat deleted.' });
    },
    [currentChatId, dispatch, refreshConversations],
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
      freeMessagesLeft,
      freeMessagesResetAt,
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
      openSavedChat,
      openingChatId,
      deleteChat,
      isCapped,
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
      access.freeMessagesUsed,
      access.renewsAt,
      isUnlocked,
      freeMessagesLeft,
      freeMessagesResetAt,
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
      openSavedChat,
      openingChatId,
      deleteChat,
      isCapped,
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
