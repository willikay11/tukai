
export async function POST(req: Request) {
  try {
    const { email, token } = await req.json();

    const response = await fetch('https://api.tukai.co/v1/accounts/token-verification/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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

    const response = await fetch('https://api.tukai.co/v1/accounts/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, category: 'account_verification' }),
    });

    console.log(response);
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
