import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Resolves a Google place id to coordinates and address components. The create
// flow stores only a place id for the experience location, but the detail view
// renders a map — this fills that gap for the preview step.
export async function GET(request: NextRequest) {
  try {
    const placeId = request.nextUrl.searchParams.get('placeId');

    if (!placeId) {
      return NextResponse.json(
        { success: false, message: 'placeId parameter is required' },
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
      `https://maps.googleapis.com/maps/api/geocode/json?place_id=${encodeURIComponent(
        placeId,
      )}&key=${GOOGLE_MAPS_API_KEY}`,
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.error_message || 'Failed to geocode place' },
        { status: response.status },
      );
    }

    return NextResponse.json({
      success: true,
      data: data.results?.[0] ?? null,
      status: data.status,
    });
  } catch (error: any) {
    console.error('Google Maps Geocode API Error:', error.message);

    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred' },
      { status: 500 },
    );
  }
}
