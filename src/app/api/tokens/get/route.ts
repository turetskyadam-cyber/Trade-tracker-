import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { decrypt } from '@/lib/crypto/tokens';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const service = await createServiceClient();
    const { data, error } = await service
      .from('robinhood_tokens')
      .select('encrypted_access_token, encrypted_refresh_token, encrypted_device_token, expires_at')
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      return NextResponse.json({ connected: false });
    }

    const expiresAt = new Date(data.expires_at).getTime();
    const needsRefresh = expiresAt < Date.now() + 10 * 60 * 1000; // 10-min buffer

    if (needsRefresh) {
      return NextResponse.json({ connected: true, needs_refresh: true });
    }

    const access_token = decrypt(data.encrypted_access_token);
    return NextResponse.json({ connected: true, access_token, expires_at: expiresAt });
  } catch (err) {
    console.error('Get token route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
