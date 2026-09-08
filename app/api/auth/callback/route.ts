import axios, { AxiosError } from 'axios';
import qs from 'qs';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Missing authorization code' }, { status: 400 });
  }

  const tokenEndpoint = process.env.NEXT_PUBLIC_FHIR_SERVER_A;
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;

  let origin = process.env.NEXT_PUBLIC_APP_URL;
  if (!origin) {
    const currentOrigin = request.nextUrl.origin;
    if (currentOrigin.includes('localhost')) {
      origin = currentOrigin;
    } else {
      origin = currentOrigin;
    }
  }

  const redirectUri = `${origin}/api/auth/callback`;
  const state = searchParams.get('state') || '1234';

  try {
    const tokenResponse = await axios.post(
      `${tokenEndpoint}/token`,
      qs.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        state,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token, patient } = tokenResponse.data;

    // If SMART launch/patient returned a selected patient, navigate directly to that patient
    if (patient) {
      return NextResponse.redirect(
        `${origin}/patient/${patient}?accessToken=${access_token}`
      );
    }

    // Fallback if no patient selected in OAuth flow: return to homepage with token
    return NextResponse.redirect(
      `${origin}/?accessToken=${access_token}`
    );
  } catch (error) {
    const axiosError = error as AxiosError;
    const statusCode = axiosError.response?.status || 500;
    const errorMessage = axiosError.response?.data || 'Internal server error';

    console.error('Error exchanging authorization code for access token:', errorMessage);
    return NextResponse.json({ error: 'Failed to fetch token', details: errorMessage }, { status: statusCode });
  }
}
