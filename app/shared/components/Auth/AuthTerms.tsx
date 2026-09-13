import Link from 'next/link';

/** The one line of small print both auth surfaces carry. */
export const AuthTerms = () => (
  <p className="text-sm text-gray-500">
    By continuing to use Tukai, you agree to our{' '}
    <Link href="/terms" className="text-blue-600 hover:underline">
      Terms of Use
    </Link>{' '}
    and{' '}
    <Link href="/privacy" className="text-blue-600 hover:underline">
      Privacy Policy
    </Link>
  </p>
);
