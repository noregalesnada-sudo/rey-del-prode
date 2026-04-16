'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  prodeId: string
}

export default function RealtimeRefresh({ prodeId }: Props) {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`prode-realtime-${prodeId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'picks', filter: `prode_id=eq.${prodeId}` },
        () => { router.refresh() }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'matches' },
        () => { router.refresh() }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [prodeId, router])

  return null
}
