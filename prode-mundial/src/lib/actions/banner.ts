'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

const adminClient = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function uploadProdeBanner(formData: FormData, prodeId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  // Verificar que el usuario es admin del prode y el plan lo permite
  const { data: membership } = await adminClient
    .from('prode_members')
    .select('role')
    .eq('prode_id', prodeId)
    .eq('user_id', user.id)
    .single()

  if (!membership || membership.role !== 'admin') return { error: 'Sin permisos' }

  const { data: prode } = await adminClient
    .from('prodes')
    .select('plan')
    .eq('id', prodeId)
    .single()

  if (!prode || prode.plan === 'free') return { error: 'El banner requiere Plan Pro o Business' }

  const file = formData.get('banner') as File
  if (!file || file.size === 0) return { error: 'No se seleccionó archivo' }
  if (file.size > 5 * 1024 * 1024) return { error: 'El archivo no puede superar 5MB' }
  if (!file.type.startsWith('image/')) return { error: 'Solo se permiten imágenes' }

  const ext = file.name.split('.').pop()
  const path = `prodes/${prodeId}/banner.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type })

  if (uploadError) return { error: uploadError.message }

  const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)

  // Agregar cache-buster para forzar recarga de la imagen
  const urlWithCacheBuster = `${publicUrl}?t=${Date.now()}`

  const { error: updateError } = await adminClient
    .from('prodes')
    .update({ banner_url: urlWithCacheBuster })
    .eq('id', prodeId)

  if (updateError) return { error: updateError.message }

  revalidatePath('/')
  return { success: true, url: urlWithCacheBuster }
}
