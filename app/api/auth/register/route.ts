import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import https from 'https';

// Create HTTPS agent that ignores certificate errors for development
// WARNING: Only use this in development. For production, use proper SSL certificates.
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await axios.post('https://155.117.40.181:4020/api/v1/auth/register', body, {
      headers: {
        'Content-Type': 'application/json',
      },
      httpsAgent: httpsAgent,
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || error.response?.data?.detail || error.message || 'Network error occurred';
    
    return NextResponse.json(
      { success: false, message },
      { status }
    );
  }
}

