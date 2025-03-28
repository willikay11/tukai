
export async function POST(req: Request) {
  try {
    const { userId, token } = await req.json();

    const response = await fetch('https://api.tukai.co/v1/accounts/verify-account/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId, token }),
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

    const res = await response.json();

    // await storeToken(res.access, res.refresh);

    return Response.json({
      message: 'Account activated successfully',
      status: 200,
    });
  } catch (error) {
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
