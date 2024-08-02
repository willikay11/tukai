export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const res = await fetch('https://api.oltukai.co/v1/accounts/auth/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (res.status !== 200) {
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
      message: 'Login successful',
      status: 200,
    });
  } catch (error) {
    console.log(error);
    return new Response('Invalid credentials', {
      status: 401,
    });
  }
}
