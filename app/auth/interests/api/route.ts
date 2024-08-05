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

    console.log(response);

    return Response.json({
      status: 200,
      message: 'Account created successfully',
    });
  } catch (e) {}
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
