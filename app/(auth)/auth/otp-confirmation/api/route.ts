import { post as serverPost } from '@/lib/serverApi';

export async function POST(req: Request) {
  try {
    const { email, token } = await req.json();

    await serverPost('/v1/accounts/token-verification/', {
      token,
      email,
      category: 'account_verification',
    });

    return Response.json(
      {
        message: 'Account activated successfully',
        status: 200,
      },
      { status: 200 },
    );
  } catch (err: any) {
    console.error('OTP Confirmation Error:', err?.response?.data ?? err);
    return Response.json(
      {
        message: err?.response?.data?.errors?.[0]?.detail || 'Invalid credentials',
      },
      {
        status: 400,
      },
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { email } = await req.json();

    await serverPost('/v1/accounts/token/', { email, category: 'account_verification' });

    return Response.json(
      {
        message: 'OTP sent successfully',
        status: 200,
      },
      { status: 200 },
    );
  } catch (err: any) {
    console.error('Resend OTP Error:', err?.response ?? err);
    return Response.json(
      {
        message: err?.response?.data?.errors?.[0]?.detail || 'Invalid credentials',
      },
      {
        status: 400,
      },
    );
  }
}
