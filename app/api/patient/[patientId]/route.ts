import { NextRequest, NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ patientId: string }> }
) {
  const { patientId } = await context.params;
  const FHIR_SERVER_URL = process.env.NEXT_PUBLIC_FHIR_SERVER;
  const accessToken = request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!FHIR_SERVER_URL) {
    return NextResponse.json({ error: 'FHIR server URL not configured' }, { status: 500 });
  }

  try {
    const response = await axios.get(`${FHIR_SERVER_URL}/Patient/${patientId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });

    return NextResponse.json(response.data, { status: 200 });
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    console.error('Error fetching patient data:', axiosError.response?.data || axiosError.message);
    const status = axiosError.response?.status || 500;
    return NextResponse.json(
      { error: 'Failed to fetch patient data', details: axiosError.response?.data },
      { status }
    );
  }
}
