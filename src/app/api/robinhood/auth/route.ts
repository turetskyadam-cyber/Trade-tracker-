import { NextRequest, NextResponse } from 'next/server';
import { RH_CLIENT_ID } from '@/lib/robinhood/auth';

const RH_TOKEN_URL = 'https://api.robinhood.com/oauth2/token/';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password, device_token, mfa_code, challenge_response_id } = body;

    if (!username || !password || !device_token) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const payload: Record<string, string> = {
      username,
      password,
      grant_type: 'password',
      client_id: RH_CLIENT_ID,
      device_token,
      scope: 'internal',
      challenge_type: 'sms',
    };

    if (mfa_code) payload.mfa_code = mfa_code;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (challenge_response_id) {
      headers['X-Robinhood-Challenge-Response-ID'] = challenge_response_id;
    }

    const res = await fetch(RH_TOKEN_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      // Challenge flow: HTTP 400 with challenge object
      if (data.challenge) {
        return NextResponse.json({
          challenge_required: true,
          challenge_id: data.challenge.id,
          challenge_type: data.challenge.type,
        });
      }
      return NextResponse.json(
        { error: data.detail || data.non_field_errors?.[0] || 'Authentication failed' },
        { status: res.status }
      );
    }

    // MFA required
    if (data.mfa_required) {
      return NextResponse.json({ mfa_required: true, mfa_type: data.mfa_type });
    }

    return NextResponse.json({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
    });
  } catch (err) {
    console.error('Auth route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  // Respond to SMS/email challenge
  try {
    const body = await req.json();
    const { challenge_id, code } = body;

    if (!challenge_id || !code) {
      return NextResponse.json({ error: 'Missing challenge_id or code' }, { status: 400 });
    }

    const res = await fetch(
      `https://api.robinhood.com/challenge/${challenge_id}/respond/`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: code }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.detail || 'Challenge response failed' },
        { status: res.status }
      );
    }

    return NextResponse.json({ success: true, challenge_id });
  } catch (err) {
    console.error('Challenge route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
