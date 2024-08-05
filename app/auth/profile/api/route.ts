import { cookies } from 'next/headers';

export async function GET(req: Request) {
  try {
    const accessToken = cookies().get('accessToken');

    if (!accessToken) {
      return Response.json({
        message: 'Unauthenticated',
        status: 401,
      });
    }

    return Response.json({
      data: {
        firstName: 'William',
        lastName: 'kamau',
      },
      status: 200,
    });
  } catch (error) {
    return Response.json({
      message: 'Unauthenticated',
      status: 401,
    });
  }
}
