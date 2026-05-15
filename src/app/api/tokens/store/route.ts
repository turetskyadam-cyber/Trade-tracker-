import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { encrypt } from '@/lib/crypto/tokens';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { access_token, refresh_token, expires_in, device_token } = body;

    if (!access_token || !refresh_token || !device_token) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const expires_at = new Date(Date.now() + expires_in * 1000).toISOString();

    const service = await createServiceClient();
    const { error } = await service.from('robinhood_tokens').upsert({
      user_id: user.id,
      encrypted_access_token: encrypt(access_token),
      encrypted_refresh_token: encrypt(refresh_token),
      encrypted_device_token: encrypt(device_token),
      expires_at,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    if (error) {
      console.error('Token store error:', error);
      return NextResponse.json({ error: 'Failed to store token' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Store token route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
