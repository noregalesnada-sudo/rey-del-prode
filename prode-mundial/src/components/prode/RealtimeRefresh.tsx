'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  prodeId: string
}

export default function RealtimeRefresh({ prodeId }: Props) {
  const router = useRouter()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounce: múltiples eventos seguidos producen un solo router.refresh()
  const scheduleRefresh = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => router.refresh(), 2000)
  }, [router])

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`prode-realtime-${prodeId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'picks', filter: `prode_id=eq.${prodeId}` },
        scheduleRefresh
      )
      .on(
        'postgres_changes',
        // Filtrado a partidos en vivo o finalizados para no fan-out en cada update del cron
        { event: 'UPDATE', schema: 'public', table: 'matches', filter: 'status=neq.scheduled' },
        scheduleRefresh
      )
      .subscribe()

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      supabase.removeChannel(channel)
    }
  }, [prodeId, scheduleRefresh])

  return null
}
