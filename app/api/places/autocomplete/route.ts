import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const input = searchParams.get('input');

    if (!input) {
      return NextResponse.json(
        { success: false, message: 'Input parameter is required' },
        { status: 400 },
      );
    }

    const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!GOOGLE_MAPS_API_KEY) {
      return NextResponse.json(
        { success: false, message: 'Google Maps API key not configured' },
        { status: 500 },
      );
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        input,
      )}&key=${GOOGLE_MAPS_API_KEY}`,
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.error_message || 'Failed to fetch autocomplete results' },
        { status: response.status },
      );
    }

    return NextResponse.json({
      success: true,
      data: data.predictions || [],
      status: data.status,
    });
  } catch (error: any) {
    console.error('Google Maps Autocomplete API Error:', error.message);

    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred' },
      { status: 500 },
    );
  }
}
