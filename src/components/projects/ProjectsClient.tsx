'use client'

import { useState } from 'react'
import { useProjects } from '@/hooks/useProjects'
import { useClients } from '@/hooks/useClients'
import { Plus, Search, Trash2, Pencil, FolderOpen } from 'lucide-react'
import { PROJECT_STATUSES } from '@/constants'
import type { ProjectStatus, Project } from '@/types'

export default function ProjectsClient() {
  const { projects, loading, deleteProject, addProject } = useProjects()
  const { clients } = useClients()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // Add modal
  const [showAddModal, setShowAddModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newStatus, setNewStatus] = useState<ProjectStatus>('active')
  const [newDeadline, setNewDeadline] = useState('')
  const [newClientId, setNewClientId] = useState('')
  const [adding, setAdding] = useState(false)

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false)
  const [editProject, setEditProject] = useState<Project | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editStatus, setEditStatus] = useState<ProjectStatus>('active')
  const [editDeadline, setEditDeadline] = useState('')
  const [editClientId, setEditClientId] = useState('')
  const [editing, setEditing] = useState(false)

  // Delete confirmation
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const filtered = projects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter ? p.status === statusFilter : true
    return matchesSearch && matchesStatus
  })

  async function handleAdd() {
    if (!newName.trim() || !newClientId) return
    setAdding(true)
    await addProject({
      name: newName,
      description: newDescription || undefined,
      status: newStatus,
      deadline: newDeadline || undefined,
      client_id: newClientId,
    })
    setNewName('')
    setNewDescription('')
    setNewStatus('active')
    setNewDeadline('')
    setNewClientId('')
    setAdding(false)
    setShowAddModal(false)
  }

  function openEdit(project: Project) {
    setEditProject(project)
    setEditName(project.name)
    setEditDescription(project.description ?? '')
    setEditStatus(project.status)
    setEditDeadline(project.deadline ?? '')
    setEditClientId(project.client_id)
    setShowEditModal(true)
  }

  async function handleEdit() {
    if (!editProject) return
    setEditing(true)
    const supabase = (await import('@/lib/supabase/client')).createClient()
    await supabase
      .from('projects')
      .update({
        name: editName,
        description: editDescription,
        status: editStatus,
        deadline: editDeadline || null,
        client_id: editClientId,
      })
      .eq('id', editProject.id)
    window.location.reload()
  }

  const getStatusBadge = (status: string) => {
    const s = PROJECT_STATUSES.find((s) => s.value === status)
    return s ? (
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.color}`}>
        {s.label}
      </span>
    ) : null
  }

  return (
    <div className="max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-neutral-900">Projects</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 h-9 px-4 bg-green-700 hover:bg-green-800 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus size={16} />
          New project
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
        >
          <option value="">All statuses</option>
          {PROJECT_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Projects grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-6 h-6 border-2 border-green-700 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-center bg-white border border-neutral-200 rounded-xl">
          <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <FolderOpen size={22} className="text-neutral-400" />
          </div>
          <p className="text-neutral-500 text-sm mb-1">
            {search || statusFilter ? 'No projects match your search' : 'No projects yet'}
          </p>
          {!search && !statusFilter && (
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-2 text-sm text-green-700 hover:underline"
            >
              Create your first project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project) => (
            <div
              key={project.id}
              className="bg-white border border-neutral-200 rounded-xl p-5 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-neutral-900 truncate">
                    {project.name}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {(project.client as { name: string } | null)?.name ?? '—'}
                  </p>
                </div>
                {getStatusBadge(project.status)}
              </div>
              {project.description && (
                <p className="text-xs text-neutral-500 mb-3 line-clamp-2">
                  {project.description}
                </p>
              )}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-100">
                <span className="text-xs text-neutral-400 font-mono">
                  {project.deadline
                    ? `Due ${new Date(project.deadline).toLocaleDateString()}`
                    : 'No deadline'}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(project)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setConfirmDelete(project.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add project modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">New project</h3>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700">Project name *</label>
                <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Website redesign" className="h-10 px-3 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700">Client *</label>
                <select value={newClientId} onChange={(e) => setNewClientId(e.target.value)} className="h-10 px-3 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent">
                  <option value="">Select a client</option>
                  {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700">Description</label>
                <textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Brief description..." rows={3} className="px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent resize-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700">Status</label>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value as ProjectStatus)} className="h-10 px-3 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent">
                  {PROJECT_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700">Deadline</label>
                <input type="date" value={newDeadline} onChange={(e) => setNewDeadline(e.target.value)} className="h-10 px-3 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="h-9 px-4 text-sm text-neutral-600 hover:text-neutral-900 transition-colors">Cancel</button>
              <button onClick={handleAdd} disabled={adding || !newName.trim() || !newClientId} className="h-9 px-4 bg-green-700 hover:bg-green-800 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {adding ? 'Creating...' : 'Create project'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit project modal */}
      {showEditModal && editProject && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowEditModal(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Edit project</h3>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700">Project name *</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="h-10 px-3 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700">Client</label>
                <select value={editClientId} onChange={(e) => setEditClientId(e.target.value)} className="h-10 px-3 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent">
                  {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700">Description</label>
                <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={3} className="px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent resize-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700">Status</label>
                <select value={editStatus} onChange={(e) => setEditStatus(e.target.value as ProjectStatus)} className="h-10 px-3 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent">
                  {PROJECT_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700">Deadline</label>
                <input type="date" value={editDeadline} onChange={(e) => setEditDeadline(e.target.value)} className="h-10 px-3 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setShowEditModal(false)} className="h-9 px-4 text-sm text-neutral-600 hover:text-neutral-900 transition-colors">Cancel</button>
              <button onClick={handleEdit} disabled={editing} className="h-9 px-4 bg-green-700 hover:bg-green-800 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
                {editing ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setConfirmDelete(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-neutral-900 mb-2">Delete project?</h3>
            <p className="text-sm text-neutral-500 mb-6">This will permanently delete the project and all its tasks. This cannot be undone.</p>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setConfirmDelete(null)} className="h-9 px-4 text-sm text-neutral-600 hover:text-neutral-900 transition-colors">Cancel</button>
              <button onClick={() => { deleteProject(confirmDelete); setConfirmDelete(null) }} className="h-9 px-4 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}