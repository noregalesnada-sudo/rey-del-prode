'use server'

import { createClient as createAdmin } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

const adminClient = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function updateMemberArea(prodeId: string, userId: string, area: string) {
  await adminClient
    .from('prode_members')
    .update({ area: area || null })
    .eq('prode_id', prodeId)
    .eq('user_id', userId)
}

export async function removeMemberFromProde(prodeId: string, userId: string) {
  await adminClient
    .from('prode_members')
    .delete()
    .eq('prode_id', prodeId)
    .eq('user_id', userId)
}

export async function uploadCompanyAsset(
  formData: FormData,
  companySlug: string,
  type: 'logo' | 'banner'
) {
  const file = formData.get('file') as File
  if (!file || file.size === 0) return { error: 'No se seleccionó archivo' }
  if (file.size > 5 * 1024 * 1024) return { error: 'El archivo no puede superar 5MB' }
  if (!file.type.startsWith('image/')) return { error: 'Solo se permiten imágenes' }

  const ext = file.name.split('.').pop()
  const path = `companies/${companySlug}/${type}.${ext}`

  const { error: uploadError } = await adminClient.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type })

  if (uploadError) return { error: uploadError.message }

  const { data: { publicUrl } } = adminClient.storage.from('avatars').getPublicUrl(path)
  const url = `${publicUrl}?t=${Date.now()}`

  const field = type === 'logo' ? 'logo_url' : 'banner_url'
  const { error: updateError } = await adminClient
    .from('companies')
    .update({ [field]: url })
    .eq('slug', companySlug)

  if (updateError) return { error: updateError.message }

  revalidatePath('/', 'layout')
  return { success: true, url }
}

export async function updateCompanyConfig(
  companySlug: string,
  data: { prodeName: string; primaryColor: string; secondaryColor: string }
) {
  const { error } = await adminClient
    .from('companies')
    .update({
      prode_name: data.prodeName || null,
      primary_color: data.primaryColor || null,
      secondary_color: data.secondaryColor || null,
    })
    .eq('slug', companySlug)

  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
}
