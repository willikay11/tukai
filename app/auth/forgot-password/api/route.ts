export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const response = await fetch('https://api.tukai.co/v1/accounts/password-reset/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
      }),
    });

    const res = await response.json();

    if (!response.ok) {
      return Response.json(
        {
          message: res?.errors?.[0]?.detail,
        },
        {
          status: 400,
        },
      );
    }

    return Response.json({
      status: 200,
      message: 'A verification code was sent to your email.',
    });
  } catch (e) {
    return Response.json(
      {
        message: 'Account not created',
      },
      {
        status: 400,
      },
    );
  }
}
