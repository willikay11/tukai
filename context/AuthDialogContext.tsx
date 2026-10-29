'use client';

import { ReactNode, createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

import { getSession, signIn, useSession } from 'next-auth/react';

import { AuthFlowDialog } from '@/app/shared/components/Auth/AuthDialog/AuthFlowDialog';
import { AUTH_REASONS as AUTH_REASON_TEXT, AuthReason } from '@/app/shared/components/Auth/AuthDialog/authReasons';
import { SignInNudge } from '@/app/shared/components/Auth/AuthDialog/SignInNudge';
import { toast } from '@/app/shared/hooks/useToast';

export type AuthView = 'register' | 'signin' | 'expired' | 'interests' | 'forgot' | null;
export type AuthStep = 'email' | 'code' | null;
export type AuthProvider = 'google' | 'apple' | 'email' | null;
export type IntsMode = 'onboard' | 'edit' | null;
export type ForgotStep = 'email' | 'code' | 'password' | null;

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

  // Forgot/reset password (AU-08) - its own step axis since it isn't part of
  // the register/sign-in email+code flow, just reachable from it
  forgotStep: ForgotStep;
  forgotEmail: string;
  forgotEmailErr: string;
  forgotSendBusy: boolean;
  forgotCode: string;
  forgotCodeErr: string;
  forgotResendSecondsLeft: number;
  forgotPassword: string;
  forgotConfirmPassword: string;
  forgotPwShow: boolean;
  forgotSubmitErr: string;
  forgotSubmitBusy: boolean;
  openForgotPassword: () => void;
  backFromForgotStep: () => void;
  setForgotEmail: (v: string) => void;
  submitForgotEmail: () => Promise<void>;
  setForgotCode: (v: string) => void;
  continueFromForgotCode: () => void;
  resendForgotCode: () => Promise<void>;
  setForgotPassword: (v: string) => void;
  setForgotConfirmPassword: (v: string) => void;
  toggleForgotPwShow: () => void;
  submitNewPassword: () => Promise<void>;
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

  const [forgotStep, setForgotStep] = useState<ForgotStep>(null);
  const [forgotEmail, setForgotEmailState] = useState('');
  const [forgotEmailErr, setForgotEmailErr] = useState('');
  const [forgotSendBusy, setForgotSendBusy] = useState(false);
  const [forgotCode, setForgotCodeState] = useState('');
  const [forgotCodeErr, setForgotCodeErr] = useState('');
  const [forgotSentAt, setForgotSentAt] = useState<number | null>(null);
  const [forgotResendSecondsLeft, setForgotResendSecondsLeft] = useState(0);
  const [forgotPassword, setForgotPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotPwShow, setForgotPwShow] = useState(false);
  const [forgotSubmitErr, setForgotSubmitErr] = useState('');
  const [forgotSubmitBusy, setForgotSubmitBusy] = useState(false);

  const pendingThenRef = useRef<(() => void) | null>(null);
  const otpTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const forgotTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
    if (!(view && step === 'code')) {
      if (otpTimerRef.current) clearInterval(otpTimerRef.current);
      return;
    }

    // No known send time (e.g. landing here without a resend actually having
    // gone out) reads as "ready to resend" rather than carrying over
    // whatever the countdown happened to be at the end of a previous visit.
    if (!otpSentAt) {
      setResendSecondsLeft(0);
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

  // --- Forgot-password resend countdown -------------------------------------
  useEffect(() => {
    if (!(view === 'forgot' && forgotStep === 'code')) {
      if (forgotTimerRef.current) clearInterval(forgotTimerRef.current);
      return;
    }

    if (!forgotSentAt) {
      setForgotResendSecondsLeft(0);
      if (forgotTimerRef.current) clearInterval(forgotTimerRef.current);
      return;
    }

    const tick = () => {
      const left = Math.max(0, OTP_RESEND_SECONDS - Math.floor((Date.now() - forgotSentAt) / 1000));
      setForgotResendSecondsLeft(left);
      if (left === 0 && forgotTimerRef.current) {
        clearInterval(forgotTimerRef.current);
        forgotTimerRef.current = null;
      }
    };

    tick();
    forgotTimerRef.current = setInterval(tick, 1000);
    return () => {
      if (forgotTimerRef.current) clearInterval(forgotTimerRef.current);
    };
  }, [view, forgotStep, forgotSentAt]);

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
    setResendSecondsLeft(0);
    setIntsMode(null);
    setIntsDraft([]);
    setIntsBusy(false);
    setForgotStep(null);
    setForgotEmailState('');
    setForgotEmailErr('');
    setForgotSendBusy(false);
    setForgotCodeState('');
    setForgotCodeErr('');
    setForgotSentAt(null);
    setForgotResendSecondsLeft(0);
    setForgotPassword('');
    setForgotConfirmPassword('');
    setForgotPwShow(false);
    setForgotSubmitErr('');
    setForgotSubmitBusy(false);
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

  // --- Forgot/reset password (AU-08) -----------------------------------------
  const openForgotPassword = useCallback(() => {
    // Pre-fill with whatever was already typed on the sign-in form - it's
    // almost always the account they mean to reset.
    setForgotEmailState(email.trim());
    setForgotEmailErr('');
    setForgotSendBusy(false);
    setForgotStep('email');
    setForgotCodeState('');
    setForgotCodeErr('');
    setForgotSentAt(null);
    setForgotPassword('');
    setForgotConfirmPassword('');
    setForgotPwShow(false);
    setForgotSubmitErr('');
    setView('forgot');
  }, [email]);

  const backFromForgotStep = useCallback(() => {
    if (forgotStep === 'password') {
      setForgotStep('code');
      return;
    }
    if (forgotStep === 'code') {
      setForgotStep('email');
      return;
    }
    // Back from forgot's own email step returns to sign-in's, not Welcome -
    // that's where "Forgot password?" is reachable from.
    setView('signin');
    setStep('email');
    setForgotStep(null);
  }, [forgotStep]);

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

  // Requests a real code from the backend and only advances the countdown on
  // an actual success - shared by the explicit "Resend code" button and the
  // sign-in flow's pending-verification recovery, neither of which should
  // ever claim a code went out that didn't.
  const requestVerificationCode = useCallback(async (targetEmail: string) => {
    try {
      const response = await fetch('/auth/otp-confirmation/api', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail }),
      });

      if (!response.ok) {
        const res = await response.json();
        toast({ description: res?.message || 'Could not send a code.', variant: 'destructive' });
        return false;
      }

      setOtpSentAt(Date.now());
      return true;
    } catch {
      toast({ description: 'Could not send a code.', variant: 'destructive' });
      return false;
    }
  }, []);

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
      // registration leaves off, without asking for the password again. A
      // real code is requested here rather than just restarting the
      // countdown: there's no way to know whether the original one is still
      // sitting in their inbox or has already expired, so claiming a fresh
      // 120s wait without actually sending anything would be misleading.
      setAuthProv('email');
      setStep('code');
      setOtp('');
      setOtpErr('');
      setOtpSentAt(null);
      const sent = await requestVerificationCode(email.trim());
      if (sent) toast({ description: `We sent a new code to ${email.trim()}.` });
      return;
    }

    toast({ description: message, variant: 'destructive' });
  }, [email, password, sendBusy, finishAndClose, requestVerificationCode]);

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

    const sent = await requestVerificationCode(email);
    if (sent) toast({ description: `We sent a new code to ${email}.` });
  }, [email, resendSecondsLeft, requestVerificationCode]);

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

  const submitForgotEmail = useCallback(async () => {
    const trimmed = forgotEmail.trim();
    if (!trimmed || forgotSendBusy) return;

    if (!EMAIL_RE.test(trimmed)) {
      setForgotEmailErr('Enter a valid email address, like name@example.com.');
      return;
    }

    setForgotSendBusy(true);
    setForgotEmailErr('');

    try {
      const response = await fetch('/auth/forgot-password/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });
      const res = await response.json();
      setForgotSendBusy(false);

      if (!response.ok) {
        setForgotEmailErr(res?.message || 'Could not send a code. Check the email and try again.');
        return;
      }

      setForgotStep('code');
      setForgotCodeState('');
      setForgotCodeErr('');
      setForgotSentAt(Date.now());
      toast({ description: `We sent a code to ${trimmed}.` });
    } catch {
      setForgotSendBusy(false);
      setForgotEmailErr('Could not send a code. Check the email and try again.');
    }
  }, [forgotEmail, forgotSendBusy]);

  const continueFromForgotCode = useCallback(() => {
    if (forgotCode.length === 6) setForgotStep('password');
  }, [forgotCode]);

  const resendForgotCode = useCallback(async () => {
    if (forgotResendSecondsLeft > 0) return;

    setForgotCodeState('');
    setForgotCodeErr('');

    try {
      const response = await fetch('/auth/forgot-password/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });

      if (!response.ok) {
        const res = await response.json();
        toast({ description: res?.message || 'Could not resend the code.', variant: 'destructive' });
        return;
      }

      setForgotSentAt(Date.now());
      toast({ description: `We sent a new code to ${forgotEmail.trim()}.` });
    } catch {
      toast({ description: 'Could not resend the code.', variant: 'destructive' });
    }
  }, [forgotEmail, forgotResendSecondsLeft]);

  const toggleForgotPwShow = useCallback(() => setForgotPwShow((v) => !v), []);

  const submitNewPassword = useCallback(async () => {
    const pwOk = forgotPassword.length >= 8 && /\d/.test(forgotPassword);
    if (!pwOk || forgotSubmitBusy || forgotPassword !== forgotConfirmPassword) return;

    setForgotSubmitBusy(true);
    setForgotSubmitErr('');

    try {
      const response = await fetch('/auth/reset-password/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: forgotCode,
          password: forgotPassword,
          email: forgotEmail.trim(),
        }),
      });
      const res = await response.json();
      setForgotSubmitBusy(false);

      if (!response.ok) {
        if (res?.message?.includes('invalid or has expired')) {
          setForgotCodeState('');
          setForgotCodeErr("That code isn't right or has expired. Check the latest email and try again.");
          setForgotStep('code');
          return;
        }
        setForgotSubmitErr(res?.message || 'Could not reset your password. Try again.');
        return;
      }

      // Signed-in-ready rather than a dead-end success screen: land them on
      // Sign in with the email already filled in, so resetting flows
      // straight into using the new password.
      const resetEmail = forgotEmail.trim();
      setView('signin');
      setStep('email');
      setForgotStep(null);
      setEmail(resetEmail);
      setPassword('');
      toast({
        description: 'Your password was reset. Sign in with your new password.',
        variant: 'success',
      });
    } catch {
      setForgotSubmitBusy(false);
      setForgotSubmitErr('Could not reset your password. Try again.');
    }
  }, [forgotPassword, forgotConfirmPassword, forgotSubmitBusy, forgotCode, forgotEmail]);

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

        forgotStep,
        forgotEmail,
        forgotEmailErr,
        forgotSendBusy,
        forgotCode,
        forgotCodeErr,
        forgotResendSecondsLeft,
        forgotPassword,
        forgotConfirmPassword,
        forgotPwShow,
        forgotSubmitErr,
        forgotSubmitBusy,
        openForgotPassword,
        backFromForgotStep,
        setForgotEmail: (v) => {
          setForgotEmailState(v);
          setForgotEmailErr('');
        },
        submitForgotEmail,
        setForgotCode: (v) => {
          const digits = v.replace(/\D/g, '').slice(0, 6);
          setForgotCodeState(digits);
          setForgotCodeErr('');
          if (digits.length === 6) setForgotStep('password');
        },
        continueFromForgotCode,
        resendForgotCode,
        setForgotPassword,
        setForgotConfirmPassword,
        toggleForgotPwShow,
        submitNewPassword,
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
