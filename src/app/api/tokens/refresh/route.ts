import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { decrypt, encrypt } from '@/lib/crypto/tokens';
import { RH_CLIENT_ID } from '@/lib/robinhood/auth';

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const service = await createServiceClient();
    const { data, error } = await service
      .from('robinhood_tokens')
      .select('encrypted_refresh_token, encrypted_device_token')
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'No token found — reconnect Robinhood' }, { status: 404 });
    }

    const refresh_token = decrypt(data.encrypted_refresh_token);
    const device_token = decrypt(data.encrypted_device_token);

    const res = await fetch('https://api.robinhood.com/oauth2/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token,
        client_id: RH_CLIENT_ID,
        device_token,
        scope: 'internal',
      }),
    });

    const tokenData = await res.json();

    if (!res.ok || !tokenData.access_token) {
      // Refresh token is also expired — user must reconnect
      return NextResponse.json({ error: 'reconnect_required' }, { status: 401 });
    }

    const expires_at = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();

    await service.from('robinhood_tokens').update({
      encrypted_access_token: encrypt(tokenData.access_token),
      encrypted_refresh_token: encrypt(tokenData.refresh_token),
      expires_at,
      updated_at: new Date().toISOString(),
    }).eq('user_id', user.id);

    return NextResponse.json({
      access_token: tokenData.access_token,
      expires_at: new Date(expires_at).getTime(),
    });
  } catch (err) {
    console.error('Refresh token route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
