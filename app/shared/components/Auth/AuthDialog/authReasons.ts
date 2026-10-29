/**
 * Why Create account opened, when an action needed a signed-in reader first.
 *
 * Copy from the design's "Reasons shown on Create account" table. `plans` is
 * dropped per AU-00 decision 9 - it names a Plans page that doesn't exist in
 * this app.
 */
export const AUTH_REASONS = {
  tukai: 'Chatting with TukAI needs an account, so your chats stay with you.',
  claim: 'Claiming a place needs an account.',
  reserve: 'Booking needs an account, so your bookings stay with you.',
  save: 'Saving needs an account, so your lists follow you.',
  join: 'Joining needs an account.',
  book: 'Booking needs an account, so your tickets stay with you.',
  plan: 'Planning needs an account.',
  host: 'Hosting needs an account.',
  moment: 'Sharing a moment needs an account.',
  lists: 'Your bucket lists live in your account.',
  profile: 'Your profile lives in your account.',
} as const;

export type AuthReason = keyof typeof AUTH_REASONS;
