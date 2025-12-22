import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { email, token } = await req.json();

    // get session server-side and prefer its access token
    const session: any = await getServerSession(authOptions as any);
    const accessToken = session?.user?.accessToken;

        // read CSRF token from cookies (fallback to env if provided)
    const cookieStore = cookies();
    const csrfFromCookie = cookieStore.get('csrftoken')?.value ?? cookieStore.get('csrf')?.value;
    const csrfToken = csrfFromCookie;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      accept: 'application/json',
    };
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
    if (csrfToken) headers['X-CSRFTOKEN'] = csrfToken;

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/accounts/token-verification/`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ token, email, category: 'account_verification' }),
    });

    if (!response.ok) {
      return Response.json(
        {
          message: 'Invalid credentials',
        },
        {
          status: 401,
        },
      );
    }

    return Response.json({
      message: 'Account activated successfully',
      status: 200,
    });
  } catch (error) {
    console.error('OTP Confirmation Error:', error);
    return Response.json(
      {
        message: 'Invalid OTP',
      },
      {
        status: 401,
      },
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { email } = await req.json();

    // include server session token if present (optional)
    const session: any = await getServerSession(authOptions as any);
    const accessToken = session?.user?.accessToken;

    // read CSRF token from cookies (fallback to env if provided)
    const cookieStore = cookies();
    const csrfFromCookie = cookieStore.get('csrftoken')?.value ?? cookieStore.get('csrf')?.value;
    const csrfToken = csrfFromCookie;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      accept: 'application/json',
    };
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
    if (csrfToken) headers['X-CSRFTOKEN'] = csrfToken;

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/accounts/token`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email, category: 'account_verification' }),
    });

    console.error('Resend OTP Error:', response);

    if (!response.ok) {
      return Response.json(
        {
          message: 'Invalid credentials',
        },
        {
          status: 401,
        },
      );
    }

    return Response.json({
      message: 'OTP sent successfully',
      status: 200,
    });
  } catch (error) {
    return Response.json(
      {
        message: 'Invalid email',
      },
      {
        status: 401,
      },
    );
  }
}
