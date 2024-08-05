import { storeToken } from '@/app/lib/actions';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const response = await fetch('https://api.oltukai.co/v1/accounts/auth/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
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

    await storeToken(res.access, res.refresh);

    return Response.json({
      message: 'Login successful',
      data: {
        firstName: 'William',
        lastName: 'Kamau',
      },
      status: 200,
    });
  } catch (error) {
    return Response.json(
      {
        message: 'Invalid credentials',
      },
      {
        status: 401,
      },
    );
  }
}
