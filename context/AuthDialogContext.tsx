'use client';

import { ReactNode, createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

import { getSession, signIn, useSession } from 'next-auth/react';

import { AuthFlowDialog } from '@/app/shared/components/Auth/AuthDialog/AuthFlowDialog';
import { AUTH_REASONS as AUTH_REASON_TEXT, AuthReason } from '@/app/shared/components/Auth/AuthDialog/authReasons';
import { SignInNudge } from '@/app/shared/components/Auth/AuthDialog/SignInNudge';
import { toast } from '@/app/shared/hooks/useToast';

export type AuthView = 'register' | 'signin' | 'expired' | 'interests' | null;
export type AuthStep = 'email' | 'code' | null;
export type AuthProvider = 'google' | 'apple' | 'email' | null;
export type IntsMode = 'onboard' | 'edit' | null;

const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;
const OTP_RESEND_SECONDS = 120; // AU-00 decision: keep the real app's 120s, not the design's 30s
// Set right before leaving for Google/Apple, consumed once the session lands
// back. Without this, *any* signed-in session that happens to have no
// interests yet (a perfectly normal, previously-dismissed account, not just a
// fresh one) would pop the onboarding step open on every load - and since
// closing is blocked during onboarding, that traps the reader in it.
const OAUTH_PENDING_KEY = 'tukai_auth_oauth_pending';

type FinishKind = 'signin' | 'register';

type AuthDialogType = {
  // Dialog shell
  view: AuthView;
  step: AuthStep;
  why: string;
  busy: AuthProvider;
  close: () => void;
  openSignIn: () => void;
  openRegister: () => void;
  openEditInterests: () => void;
  switchView: (view: 'register' | 'signin') => void;
  goToEmailStep: () => void;
  backFromEmailStep: () => void;
  /** Replaces `openSignInWithCallback`. Opens Create account with a reason pill, runs `then` once signed in. */
  needAuth: (why?: AuthReason, then?: () => void) => boolean;
  /** Deprecated alias kept for callers not yet migrated to a specific reason. */
  openSignInWithCallback: (then: () => void) => void;

  // Email form (register + sign-in share one set of fields)
  first: string;
  last: string;
  email: string;
  password: string;
  pwShow: boolean;
  emailErr: string;
  sendBusy: boolean;
  setFirst: (v: string) => void;
  setLast: (v: string) => void;
  setEmail: (v: string) => void;
  setPassword: (v: string) => void;
  togglePwShow: () => void;
  submitRegisterEmailForm: () => void;
  submitSignInEmailForm: () => Promise<void>;
  signInSocial: (provider: 'google' | 'apple') => Promise<void>;

  // Code (OTP)
  otp: string;
  otpErr: string;
  otpBusy: boolean;
  resendSecondsLeft: number;
  setOtp: (v: string) => void;
  verifyOtp: () => Promise<void>;
  resendOtp: () => void;

  // Interests
  intsMode: IntsMode;
  intsDraft: string[];
  intsBusy: boolean;
  toggleInterest: (id: string) => void;
  submitInterests: () => Promise<void>;
};

const AuthDialogContext = createContext<AuthDialogType | undefined>(undefined);

const getAuthErrorMessage = (res: Awaited<ReturnType<typeof signIn>>) => {
  const fallback =
    'Invalid credentials, please check your email and password or sign up if you do not have an account.';

  if (!res) return fallback;

  let message: string | undefined = res.error ?? undefined;

  if (!message && res.url) {
    try {
      message = new URL(res.url, window.location.origin).searchParams.get('error') || undefined;
    } catch {
      message = undefined;
    }
  }

  if (!message || message === 'CredentialsSignin') return fallback;

  try {
    return decodeURIComponent(message);
  } catch {
    return message;
  }
};

const PENDING_VERIFICATION =
  'User account is pending verification. Please check your email for a verification link.';

export const AuthDialogProvider = ({ children }: { children: ReactNode }) => {
  const { data: session, status, update: updateSession } = useSession();

  const [view, setView] = useState<AuthView>(null);
  const [step, setStep] = useState<AuthStep>(null);
  const [why, setWhy] = useState('');
  const [busy, setBusy] = useState<AuthProvider>(null);
  const [authProv, setAuthProv] = useState<AuthProvider>(null);

  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pwShow, setPwShow] = useState(false);
  const [emailErr, setEmailErr] = useState('');
  const [sendBusy, setSendBusy] = useState(false);

  const [otp, setOtp] = useState('');
  const [otpErr, setOtpErr] = useState('');
  const [otpBusy, setOtpBusy] = useState(false);
  const [otpSentAt, setOtpSentAt] = useState<number | null>(null);
  const [resendSecondsLeft, setResendSecondsLeft] = useState(0);

  const [intsMode, setIntsMode] = useState<IntsMode>(null);
  const [intsDraft, setIntsDraft] = useState<string[]>([]);
  const [intsBusy, setIntsBusy] = useState(false);

  const pendingThenRef = useRef<(() => void) | null>(null);
  const otpTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- Session-expired entry point (AU-00 decision 19) ---------------------
  // Nothing in the app previously watched this. A refresh failure sets
  // `session.error`, and that's the one real trigger for this welcome variant.
  useEffect(() => {
    if (session?.error === 'RefreshAccessTokenError' && view === null) {
      setView('expired');
      setStep(null);
      setBusy(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.error]);

  // --- Interests-after-social-sign-in (AU-00 decisions 13/14) --------------
  // Google/Apple sign-in is a full-page redirect out to the provider and
  // back, so there is no in-memory moment to branch on right after the call.
  // `signInSocial` sets OAUTH_PENDING_KEY right before leaving; this is what
  // the welcome screen, the nudge and a plain OAuth reload all land on. It's
  // consumed once, so an account that genuinely has no interests isn't asked
  // again on every later visit.
  useEffect(() => {
    if (status !== 'authenticated' || !session?.user) return;
    if (typeof window === 'undefined' || !sessionStorage.getItem(OAUTH_PENDING_KEY)) return;

    sessionStorage.removeItem(OAUTH_PENDING_KEY);
    if (session.user.hasInterests || view) return;

    setView('interests');
    setIntsMode('onboard');
    setIntsDraft([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session?.user?.hasInterests]);

  // --- OTP resend countdown -------------------------------------------------
  useEffect(() => {
    if (!(view && step === 'code') || !otpSentAt) {
      if (otpTimerRef.current) clearInterval(otpTimerRef.current);
      return;
    }

    const tick = () => {
      const left = Math.max(0, OTP_RESEND_SECONDS - Math.floor((Date.now() - otpSentAt) / 1000));
      setResendSecondsLeft(left);
      if (left === 0 && otpTimerRef.current) {
        clearInterval(otpTimerRef.current);
        otpTimerRef.current = null;
      }
    };

    tick();
    otpTimerRef.current = setInterval(tick, 1000);
    return () => {
      if (otpTimerRef.current) clearInterval(otpTimerRef.current);
    };
  }, [view, step, otpSentAt]);

  const resetDraft = useCallback(() => {
    setFirst('');
    setLast('');
    setEmail('');
    setPassword('');
    setPwShow(false);
    setEmailErr('');
    setSendBusy(false);
    setOtp('');
    setOtpErr('');
    setOtpBusy(false);
    setOtpSentAt(null);
    setIntsMode(null);
    setIntsDraft([]);
    setIntsBusy(false);
  }, []);

  const close = useCallback(() => {
    pendingThenRef.current = null;
    setView(null);
    setStep(null);
    setBusy(null);
    setWhy('');
    resetDraft();
  }, [resetDraft]);

  const runPendingThen = useCallback(() => {
    const then = pendingThenRef.current;
    pendingThenRef.current = null;
    // A beat so the dialog has finished closing before whatever was waiting
    // (opening a drawer, say) takes over the screen.
    if (then) setTimeout(then, 60);
  }, []);

  const openSignIn = useCallback(() => {
    setView('signin');
    setStep(null);
    setBusy(null);
  }, []);

  const openRegister = useCallback(() => {
    setView('register');
    setStep(null);
    setBusy(null);
    setWhy('');
  }, []);

  const openEditInterests = useCallback(() => {
    setIntsMode('edit');
    setIntsDraft((session?.user?.interests ?? []).map((i) => i.id));
    setView('interests');
  }, [session?.user?.interests]);

  const needAuth = useCallback(
    (why?: AuthReason, then?: () => void) => {
      if (session?.user) return false;

      pendingThenRef.current = then ?? null;
      setView('register');
      setStep(null);
      setBusy(null);
      setWhy(why ? AUTH_REASON_TEXT[why] : '');
      return true;
    },
    [session?.user],
  );

  const openSignInWithCallback = useCallback(
    (then: () => void) => {
      needAuth(undefined, then);
    },
    [needAuth],
  );

  const switchView = useCallback((v: 'register' | 'signin') => {
    setView(v);
    setStep(null);
    setBusy(null);
  }, []);

  const goToEmailStep = useCallback(() => {
    setStep('email');
    setBusy(null);
    setEmailErr('');
  }, []);

  const backFromEmailStep = useCallback(() => {
    setStep(null);
    setEmailErr('');
    setSendBusy(false);
  }, []);

  const togglePwShow = useCallback(() => setPwShow((v) => !v), []);

  // --- finishing ------------------------------------------------------------
  const finishToast = useCallback(async (kind: FinishKind, provider: AuthProvider) => {
    const via = provider === 'apple' ? 'with Apple' : provider === 'email' ? 'with your email' : 'with Google';

    if (kind === 'signin') {
      const fresh = await getSession();
      const name = fresh?.user?.name?.split(' ')[0];
      toast({
        description: `Signed in ${via}.${name ? ` Welcome back, ${name}.` : ''}`,
        variant: 'success',
      });
      return;
    }

    const firstName = provider === 'email' ? first.trim() : (await getSession())?.user?.name?.split(' ')[0];
    toast({
      description: `Welcome to Tukai${firstName ? `, ${firstName}` : ''}. Your interests are saved to your profile.`,
      variant: 'success',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [first]);

  const finishAndClose = useCallback(
    async (kind: FinishKind, provider: AuthProvider) => {
      await finishToast(kind, provider);
      setView(null);
      setStep(null);
      setBusy(null);
      setWhy('');
      resetDraft();
      runPendingThen();
    },
    [finishToast, resetDraft, runPendingThen],
  );

  // --- email form -------------------------------------------------------------
  const submitRegisterEmailForm = useCallback(() => {
    const pwOk = password.length >= 8 && /\d/.test(password);
    if (!first.trim() || !last.trim() || !email.trim() || !pwOk) return;

    if (!EMAIL_RE.test(email.trim())) {
      setEmailErr('Enter a valid email address, like name@example.com.');
      return;
    }

    setEmailErr('');
    // Nothing is sent yet: the account (and its verification code) is only
    // created once Interests submits - see AU-00 decision 3.
    setStep(null);
    setView('interests');
    setIntsMode('onboard');
    setIntsDraft([]);
  }, [first, last, email, password]);

  const submitSignInEmailForm = useCallback(async () => {
    if (!email.trim() || !password || sendBusy) return;

    if (!EMAIL_RE.test(email.trim())) {
      setEmailErr('Enter a valid email address, like name@example.com.');
      return;
    }

    setSendBusy(true);
    setEmailErr('');

    const res = await signIn('credentials', { email: email.trim(), password, redirect: false });

    if (res?.status === 200) {
      setAuthProv('email');
      setSendBusy(false);
      await finishAndClose('signin', 'email');
      return;
    }

    const message = getAuthErrorMessage(res);
    setSendBusy(false);

    if (message === PENDING_VERIFICATION) {
      // The account exists but was never verified - pick up exactly where
      // registration leaves off, without asking for the password again.
      setAuthProv('email');
      setStep('code');
      setOtpSentAt(Date.now());
      setOtp('');
      setOtpErr('');
      return;
    }

    toast({ description: message, variant: 'destructive' });
  }, [email, password, sendBusy, finishAndClose]);

  const signInSocial = useCallback(
    async (provider: 'google' | 'apple') => {
      if (busy) return;
      setBusy(provider);

      // OAuth is a full-page round trip to the provider and back - there is
      // no in-page continuation to await here. `callbackUrl` returns the
      // reader to the page they were on; the interests effect above picks up
      // from there once the new session lands, gated on this flag so it only
      // fires for a sign-in that actually just happened.
      sessionStorage.setItem(OAUTH_PENDING_KEY, '1');
      await signIn(provider, { callbackUrl: window.location.href });
    },
    [busy],
  );

  // --- OTP --------------------------------------------------------------------
  const verifyOtp = useCallback(async () => {
    if (otpBusy || otp.length !== 6) return;

    setOtpBusy(true);
    setOtpErr('');

    try {
      const response = await fetch('/auth/otp-confirmation/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token: otp }),
      });
      const res = await response.json();

      if (!response.ok) {
        setOtpBusy(false);
        setOtp('');
        setOtpErr(
          res?.message ||
            "That code isn't right. Check the latest email from Tukai and try again.",
        );
        return;
      }

      const signInRes = await signIn('credentials', { email, password, redirect: false });

      if (signInRes?.status !== 200) {
        setOtpBusy(false);
        toast({
          title: 'Sign in required',
          description: 'Account verified successfully. Please sign in to continue.',
        });
        setView('signin');
        setStep(null);
        return;
      }

      setAuthProv('email');
      setOtpBusy(false);
      await finishAndClose(view === 'signin' ? 'signin' : 'register', 'email');
    } catch {
      setOtpBusy(false);
      setOtp('');
      setOtpErr("That code isn't right. Check the latest email from Tukai and try again.");
    }
  }, [otp, otpBusy, email, password, view, finishAndClose]);

  const resendOtp = useCallback(async () => {
    if (resendSecondsLeft > 0) return;

    setOtp('');
    setOtpErr('');

    try {
      const response = await fetch('/auth/otp-confirmation/api', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const res = await response.json();
        toast({ description: res?.message || 'Could not resend the code.', variant: 'destructive' });
        return;
      }

      setOtpSentAt(Date.now());
      toast({ description: `We sent a new code to ${email}.` });
    } catch {
      toast({ description: 'Could not resend the code.', variant: 'destructive' });
    }
  }, [email, resendSecondsLeft]);

  // --- Interests ----------------------------------------------------------------
  const toggleInterest = useCallback((id: string) => {
    setIntsDraft((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  }, []);

  const submitInterests = useCallback(async () => {
    if (intsDraft.length === 0 || intsBusy) return;

    setIntsBusy(true);

    // Editing (from the profile) or onboarding someone who already has a
    // session (a Google/Apple sign-in that needed interests) both just PUT.
    if (intsMode === 'edit' || session?.user?.id) {
      const response = await fetch('/auth/interests/api', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: session?.user?.id, interests: intsDraft }),
      });
      const res = await response.json();
      setIntsBusy(false);

      if (!response.ok) {
        toast({ description: res?.message || 'Could not save your interests', variant: 'destructive' });
        return;
      }

      await updateSession?.();

      if (intsMode === 'edit') {
        setView(null);
        setIntsMode(null);
        toast({ description: 'Interests saved to your profile.', variant: 'success' });
        return;
      }

      await finishAndClose('register', authProv ?? 'google');
      return;
    }

    // Onboarding a brand-new email account: this is also what creates it
    // (AU-00 decision 3) - interests, name, email and password all go in
    // one request, and the backend sends the verification code as a result.
    const response = await fetch('/auth/interests/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: first,
        lastName: last,
        email,
        password,
        interests: intsDraft,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }),
    });
    const res = await response.json();
    setIntsBusy(false);

    if (!response.ok) {
      toast({ title: 'Interests not saved', description: res?.message, variant: 'destructive' });
      if (res?.message?.includes('already exists')) {
        setView('signin');
        setStep(null);
      }
      return;
    }

    setView('register');
    setStep('code');
    setOtp('');
    setOtpErr('');
    setOtpSentAt(Date.now());
  }, [intsDraft, intsBusy, intsMode, session?.user?.id, first, last, email, password, authProv, finishAndClose, updateSession]);

  return (
    <AuthDialogContext.Provider
      value={{
        view,
        step,
        why,
        busy,
        close,
        openSignIn,
        openRegister,
        openEditInterests,
        switchView,
        goToEmailStep,
        backFromEmailStep,
        needAuth,
        openSignInWithCallback,

        first,
        last,
        email,
        password,
        pwShow,
        emailErr,
        sendBusy,
        setFirst,
        setLast,
        setEmail: (v) => {
          setEmail(v);
          setEmailErr('');
        },
        setPassword,
        togglePwShow,
        submitRegisterEmailForm,
        submitSignInEmailForm,
        signInSocial,

        otp,
        otpErr,
        otpBusy,
        resendSecondsLeft,
        setOtp: (v) => {
          if (otpBusy) return;
          const digits = v.replace(/\D/g, '').slice(0, 6);
          setOtp(digits);
          setOtpErr('');
          if (digits.length === 6) {
            // fire and forget - verifyOtp manages its own busy state
            void verifyOtp();
          }
        },
        verifyOtp,
        resendOtp,

        intsMode,
        intsDraft,
        intsBusy,
        toggleInterest,
        submitInterests,
      }}
    >
      <AuthFlowDialog />
      <SignInNudge />
      {children}
    </AuthDialogContext.Provider>
  );
};

export const useAuthDialog = () => {
  const context = useContext(AuthDialogContext);
  if (!context) throw new Error('useAuthDialog must be used inside AuthDialogProvider');
  return context;
};
