import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { createClient } from '@supabase/supabase-js'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // MP envía diferentes tipos de notificaciones — solo procesamos "payment"
    if (body.type !== 'payment') {
      return NextResponse.json({ ok: true })
    }

    const paymentId = body.data?.id
    if (!paymentId) return NextResponse.json({ ok: true })

    const mp = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! })
    const payment = await new Payment(mp).get({ id: paymentId })

    if (payment.status !== 'approved') {
      return NextResponse.json({ ok: true })
    }

    const externalRef = payment.external_reference
    if (!externalRef) return NextResponse.json({ ok: true })

    const [prodeId, plan] = externalRef.split(':')
    if (!prodeId || !['pro', 'business'].includes(plan)) {
      return NextResponse.json({ ok: true })
    }

    await adminClient
      .from('prodes')
      .update({ plan })
      .eq('id', prodeId)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('MP webhook error:', err)
    // Siempre devolver 200 para que MP no reintente indefinidamente
    return NextResponse.json({ ok: true })
  }
}
