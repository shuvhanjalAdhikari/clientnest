'use client'

import { useState, useRef } from 'react'
import { useDocuments } from '@/hooks/useDocuments'
import { useClients } from '@/hooks/useClients'
import { useProjects } from '@/hooks/useProjects'
import { Upload, Search, Trash2, FileText, File, FileImage, Loader2, Download  } from 'lucide-react'

function formatFileSize(bytes?: number) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileIcon(fileType?: string) {
  switch (fileType) {
    case 'pdf': return <FileText size={20} className="text-red-500" />
    case 'docx':
    case 'doc': return <FileText size={20} className="text-blue-500" />
    case 'png':
    case 'jpg':
    case 'jpeg': return <FileImage size={20} className="text-amber-500" />
    default: return <File size={20} className="text-neutral-400" />
  }
}

export default function DocumentsClient() {
  const { documents, loading, uploadDocument, deleteDocument } = useDocuments()
  const { clients } = useClients()
  const { projects } = useProjects()

  const [search, setSearch] = useState('')
  const [uploading, setUploading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; path: string } | null>(null)
  const [selectedClientId, setSelectedClientId] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filtered = documents.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  )

  async function handleUpload() {
    if (!selectedFile) return
    setUploading(true)
    await uploadDocument(selectedFile, {
      client_id: selectedClientId || undefined,
      project_id: selectedProjectId || undefined,
    })
    setSelectedFile(null)
    setSelectedClientId('')
    setSelectedProjectId('')
    setUploading(false)
    setShowUploadModal(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      setSelectedFile(file)
      setShowUploadModal(true)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-neutral-900">Documents</h2>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 h-9 px-4 bg-green-700 hover:bg-green-800 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Upload size={16} />
          Upload
        </button>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-6 text-center mb-6 transition-colors ${
          isDragging
            ? 'border-green-500 bg-green-50'
            : 'border-neutral-200 hover:border-neutral-300'
        }`}
      >
        <Upload size={20} className="text-neutral-400 mx-auto mb-2" />
        <p className="text-sm text-neutral-500">
          Drop files here or{' '}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-green-700 hover:underline"
          >
            browse
          </button>
        </p>
        <p className="text-xs text-neutral-400 mt-1">PDF, Word, images up to 10MB</p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              setSelectedFile(file)
              setShowUploadModal(true)
            }
          }}
        />
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          placeholder="Search documents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-9 pr-3 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
        />
      </div>

      {/* Documents list */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-6 h-6 border-2 border-green-700 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-center bg-white border border-neutral-200 rounded-xl">
          <File size={24} className="text-neutral-300 mb-3" />
          <p className="text-neutral-400 text-sm">
            {search ? 'No documents match your search' : 'No documents yet'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          {filtered.map((doc, index) => (
            <div
              key={doc.id}
              className={`flex items-center gap-4 px-5 py-4 hover:bg-neutral-50 transition-colors ${
                index < filtered.length - 1 ? 'border-b border-neutral-100' : ''
              }`}
            >
              {/* File icon */}
              <div className="w-9 h-9 bg-neutral-100 rounded-lg flex items-center justify-center flex-shrink-0">
                {getFileIcon(doc.file_type)}
              </div>

              {/* File info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">{doc.name}</p>
                <p className="text-xs text-neutral-400 font-mono mt-0.5">
                  {formatFileSize(doc.file_size)} · {new Date(doc.created_at).toLocaleDateString()}
                </p>
              </div>

              {/* Indexed badge */}
              <div className="hidden sm:block">
                {doc.is_indexed ? (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                    Indexed
                  </span>
                ) : (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500">
                    Not indexed
                  </span>
                )}
              </div>

              {/* Delete */}
              {/* Actions */}
<div className="flex items-center gap-1">
  <button
    onClick={async () => {
      const supabase = (await import('@/lib/supabase/client')).createClient()
      const { data } = await supabase.storage
        .from('documents')
        .createSignedUrl(doc.storage_path, 60)
      if (data?.signedUrl) window.open(data.signedUrl, '_blank')
    }}
    className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-green-600 hover:bg-green-50 transition-colors flex-shrink-0"
  >
    <Download size={15} />
  </button>
  <button
    onClick={() => setConfirmDelete({ id: doc.id, path: doc.storage_path })}
    className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0"
  >
    <Trash2 size={15} />
  </button>
</div>
            </div>
          ))}
        </div>
      )}

      {/* Upload modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => { setShowUploadModal(false); setSelectedFile(null) }}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Upload document</h3>

            {/* File selection */}
            {!selectedFile ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-neutral-200 rounded-lg p-8 text-center cursor-pointer hover:border-green-500 transition-colors mb-4"
              >
                <Upload size={24} className="text-neutral-400 mx-auto mb-2" />
                <p className="text-sm text-neutral-500">Click to select a file</p>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg mb-4">
                {getFileIcon(selectedFile.name.split('.').pop())}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">{selectedFile.name}</p>
                  <p className="text-xs text-neutral-400">{formatFileSize(selectedFile.size)}</p>
                </div>
                <button onClick={() => setSelectedFile(null)} className="text-neutral-400 hover:text-neutral-600 text-xs">Remove</button>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700">Link to client (optional)</label>
                <select value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)} className="h-10 px-3 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent">
                  <option value="">No client</option>
                  {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700">Link to project (optional)</label>
                <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} className="h-10 px-3 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent">
                  <option value="">No project</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => { setShowUploadModal(false); setSelectedFile(null) }} className="h-9 px-4 text-sm text-neutral-600 hover:text-neutral-900 transition-colors">Cancel</button>
              <button
                onClick={handleUpload}
                disabled={uploading || !selectedFile}
                className="h-9 px-4 bg-green-700 hover:bg-green-800 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {uploading && <Loader2 size={14} className="animate-spin" />}
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setConfirmDelete(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-neutral-900 mb-2">Delete document?</h3>
            <p className="text-sm text-neutral-500 mb-6">This will permanently delete the file. This cannot be undone.</p>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setConfirmDelete(null)} className="h-9 px-4 text-sm text-neutral-600 hover:text-neutral-900 transition-colors">Cancel</button>
              <button
                onClick={() => {
                  deleteDocument(confirmDelete.id, confirmDelete.path)
                  setConfirmDelete(null)
                }}
                className="h-9 px-4 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}