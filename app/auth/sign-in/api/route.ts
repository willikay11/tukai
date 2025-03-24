import { storeToken } from '@/lib/actions';
import api from '@/services/apiService';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const response = await api.post('/v1/accounts/login/', { email, password });

    if (response.status !== 200) {
      return Response.json(
        {
          message: 'Invalid credentials',
        },
        {
          status: 401,
        },
      );
    }

    const res = response.data;

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
