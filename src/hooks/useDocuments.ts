import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface Document {
  id: string
  workspace_id: string
  client_id?: string
  project_id?: string
  name: string
  storage_path: string
  file_type?: string
  file_size?: number
  is_indexed: boolean
  uploaded_by: string
  created_at: string
}

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) console.error(error)
      else setDocuments(data ?? [])
      setLoading(false)
    }

    load()
  }, [])

  async function uploadDocument(
    file: File,
    metadata: { client_id?: string; project_id?: string }
  ) {
    const supabase = createClient()

    const { data: userData } = await supabase
      .from('users')
      .select('workspace_id')
      .single()

    if (!userData) return

    const { data: authData } = await supabase.auth.getUser()
    if (!authData.user) return

    const filePath = `${userData.workspace_id}/${Date.now()}_${file.name}`

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file)

    if (uploadError) {
      console.error(uploadError)
      return
    }

    const fileType = file.name.split('.').pop()?.toLowerCase()

    const { data, error } = await supabase
      .from('documents')
      .insert({
        workspace_id: userData.workspace_id,
        client_id: metadata.client_id || null,
        project_id: metadata.project_id || null,
        name: file.name,
        storage_path: filePath,
        file_type: fileType,
        file_size: file.size,
        is_indexed: false,
        uploaded_by: authData.user.id,
      })
      .select()
      .single()

    if (error) {
      console.error(error)
      return
    }

        setDocuments((prev) => [data, ...prev])

    // Send to RAG backend for indexing
    // Only index file types the backend supports
    const indexableTypes = ['pdf', 'docx', 'doc', 'txt']
    if (fileType && indexableTypes.includes(fileType)) {
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('document_id', data.id)
        formData.append('workspace_id', userData.workspace_id)
        if (metadata.client_id) formData.append('client_id', metadata.client_id)
        if (metadata.project_id) formData.append('project_id', metadata.project_id)

        const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
        const res = await fetch(`${apiUrl}/upload`, {
          method: 'POST',
          body: formData,
        })

        if (res.ok) {
          // Mark as indexed in local state
          setDocuments((prev) =>
            prev.map((d) => (d.id === data.id ? { ...d, is_indexed: true } : d))
          )
        } else {
          console.error('RAG indexing failed:', await res.text())
        }
      } catch (err) {
        console.error('RAG backend unreachable:', err)
      }
    }

  }

  async function deleteDocument(id: string, storagePath: string) {
    const supabase = createClient()

    // Remove chunks from RAG backend
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
      await fetch(`${apiUrl}/document`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document_id: id }),
      })
    } catch (err) {
      console.error('Failed to delete RAG chunks:', err)
    }

    await supabase.storage.from('documents').remove([storagePath])
    await supabase.from('documents').delete().eq('id', id)
    setDocuments((prev) => prev.filter((d) => d.id !== id))
  }

  return { documents, loading, uploadDocument, deleteDocument }
}