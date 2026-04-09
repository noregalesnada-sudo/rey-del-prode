'use server'

import { createClient as createAdmin } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const adminClient = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function savePrizes(
  prodeId: string,
  prizes: { position: number; description: string }[]
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  // Verificar que es admin
  const { data: membership } = await adminClient
    .from('prode_members')
    .select('role')
    .eq('prode_id', prodeId)
    .eq('user_id', user.id)
    .single()

  if (membership?.role !== 'admin') return { error: 'Solo el admin puede editar premios' }

  // Borrar premios existentes y reemplazar
  await adminClient.from('prode_prizes').delete().eq('prode_id', prodeId)

  const validPrizes = prizes.filter((p) => p.description.trim() !== '')
  if (validPrizes.length === 0) {
    revalidatePath(`/prode`)
    return { success: true }
  }

  const { error } = await adminClient.from('prode_prizes').insert(
    validPrizes.map((p) => ({ prode_id: prodeId, position: p.position, description: p.description.trim() }))
  )

  if (error) return { error: error.message }
  revalidatePath(`/prode`)
  return { success: true }
}
