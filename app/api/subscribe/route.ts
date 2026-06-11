import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Validación de email simple pero razonable
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  let email = '';
  let source = 'homepage';

  try {
    const body = await request.json();
    email = (body?.email || '').toString().trim().toLowerCase();
    if (body?.source) source = body.source.toString().slice(0, 50);
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_body' }, { status: 400 });
  }

  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ ok: false, error: 'invalid_email' }, { status: 400 });
  }

  // Si Supabase no está configurado, no romper: avisar sin guardar.
  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: 'not_configured' },
      { status: 503 }
    );
  }

  const { error } = await supabase
    .from('subscribers')
    .insert({ email, source });

  if (error) {
    // 23505 = unique_violation → el email ya estaba suscripto
    if (error.code === '23505') {
      return NextResponse.json({ ok: true, already: true });
    }
    console.error('❌ Error guardando suscriptor:', error.message);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, already: false });
}
