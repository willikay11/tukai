export async function POST(req: Request) {
  try {
    const { firstName, lastName, email, password, interests } = await req.json();

    const response = await fetch('https://api.oltukai.co/v1/accounts/users/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        interests,
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
      data: {
        id: res.id,
        firstName: res.first_name,
        lastName: res?.last_name,
        email: res?.email,
      },
      message: 'Account created successfully',
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

export async function GET() {
  const response = await fetch('https://api.oltukai.co/v1/accounts/interests?page_size=1000', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const res = await response.json();

  return Response.json({
    interests: res?.results,
    status: 200,
  });
}
