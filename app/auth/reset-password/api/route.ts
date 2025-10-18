export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/accounts/password-reset/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        password,
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
      message: 'Your password was successfully reset.',
    });
  } catch (e) {
    return Response.json(
      {
        message: 'Your password reset failed',
      },
      {
        status: 400,
      },
    );
  }
}
