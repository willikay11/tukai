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
      return new Response('Invalid credentials', {
        status: 401,
      });
    }

    return new Response('Login successful', {
      status: 200,
    });
  } catch (error) {
    return new Response('Invalid credentials', {
      status: 401,
    });
  }
}
