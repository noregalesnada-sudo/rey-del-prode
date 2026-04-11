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
