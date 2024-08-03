import { cookies } from 'next/headers';

export async function GET(req: Request) {
  try {
    const accessToken = cookies().get('accessToken');

    return Response.json({
      data: {
        firstName: 'William',
        lastName: 'kamau',
      },
    });
  } catch (error) {
    return Response.json({
      message: 'Unauthenticated',
      status: 401,
    });
  }
}
