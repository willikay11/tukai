import { getServerSession } from 'next-auth';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { parseSnakeToCamel } from '@/utils/parseSnakeToCamel';

export async function POST(req: Request) {
  const data = await req.json();

  if (data.type === 'billingDetails') {
    return CreateBillingDetails(data);
  }

  if (data.type === 'subscription') {
    return CreateSubscription(data);
  }
}

export async function CreateBillingDetails(data: any) {
  try {
    const { paymentOption, countryCode, phoneNumber } = data;

    const session = await getServerSession(authOptions);
    const token = session?.user?.accessToken;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/payments/billing-details/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          billing_address: {
            user: session?.user?.id,
            country: countryCode,
            is_active: true,
          },
          payment_method: {
            user: session?.user?.id,
            payment_option: paymentOption,
            mobile_money_phone: phoneNumber,
            is_active: true,
          },
        }),
      },
    );

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
      message: 'Billing details created successfully!',
      data: parseSnakeToCamel(res),
    });
  } catch (e) {
    return Response.json(
      {
        message: 'Billing details creation failed',
      },
      {
        status: 400,
      },
    );
  }
}
export async function CreateSubscription(data: any) {
  try {
    const { plan } = data;

    const session = await getServerSession(authOptions);
    const token = session?.user?.accessToken;

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/subscriptions/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        user: session?.user?.id,
        plan: plan,
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
      message: 'Subscription successful!',
    });
  } catch (e) {
    return Response.json(
      {
        message: 'Subscription failed',
      },
      {
        status: 400,
      },
    );
  }
}
