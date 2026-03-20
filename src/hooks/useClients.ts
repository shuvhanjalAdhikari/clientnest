import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Client } from '@/types'

export function useClients() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) console.error(error)
      else setClients(data ?? [])

      setLoading(false)
    }

    load()
  }, [])

  async function deleteClient(id: string) {
    const supabase = createClient()
    await supabase.from('clients').delete().eq('id', id)
    setClients((prev) => prev.filter((c) => c.id !== id))
  }

  async function addClient(client: Omit<Client, 'id' | 'created_at' | 'workspace_id'>) {
    const supabase = createClient()

    const { data: userData } = await supabase
      .from('users')
      .select('workspace_id')
      .single()

    if (!userData) return

    const { data, error } = await supabase
      .from('clients')
      .insert({ ...client, workspace_id: userData.workspace_id })
      .select()
      .single()

    if (error) console.error(error)
    else setClients((prev) => [data, ...prev])
  }

  return { clients, loading, deleteClient, addClient }
}