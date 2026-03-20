'use client'

import { useState } from 'react'
import { useClients } from '@/hooks/useClients'
import { Plus, Search, Trash2, Pencil, Mail } from 'lucide-react'
import { CLIENT_STATUSES } from '@/constants'
import type { ClientStatus, Client } from '@/types'

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

function getAvatarColor(name: string) {
  const colors = [
    'bg-blue-100 text-blue-700',
    'bg-green-100 text-green-700',
    'bg-purple-100 text-purple-700',
    'bg-amber-100 text-amber-700',
    'bg-red-100 text-red-700',
    'bg-teal-100 text-teal-700',
  ]
  return colors[name.charCodeAt(0) % colors.length]
}

export default function ClientsClient() {
  const { clients, loading, deleteClient, addClient } = useClients()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // Add modal
  const [showAddModal, setShowAddModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [newContact, setNewContact] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newStatus, setNewStatus] = useState<ClientStatus>('active')
  const [adding, setAdding] = useState(false)

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false)
  const [editClient, setEditClient] = useState<Client | null>(null)
  const [editName, setEditName] = useState('')
  const [editContact, setEditContact] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editStatus, setEditStatus] = useState<ClientStatus>('active')
  const [editing, setEditing] = useState(false)

  // Delete confirmation
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const filtered = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.contact_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter ? c.status === statusFilter : true
    return matchesSearch && matchesStatus
  })

  async function handleAdd() {
    if (!newName.trim()) return
    setAdding(true)
    await addClient({
      name: newName,
      contact_name: newContact || undefined,
      email: newEmail || undefined,
      phone: newPhone || undefined,
      status: newStatus,
      notes: undefined,
    })
    setNewName('')
    setNewContact('')
    setNewEmail('')
    setNewPhone('')
    setNewStatus('active')
    setAdding(false)
    setShowAddModal(false)
  }

  function openEdit(client: Client) {
    setEditClient(client)
    setEditName(client.name)
    setEditContact(client.contact_name ?? '')
    setEditEmail(client.email ?? '')
    setEditPhone(client.phone ?? '')
    setEditStatus(client.status)
    setShowEditModal(true)
  }

  async function handleEdit() {
    if (!editClient) return
    setEditing(true)
    const supabase = (await import('@/lib/supabase/client')).createClient()
    await supabase
      .from('clients')
      .update({
        name: editName || editClient.name,
        contact_name: editContact || editClient.contact_name,
        email: editEmail || editClient.email,
        phone: editPhone || editClient.phone,
        status: editStatus,
      })
      .eq('id', editClient.id)
    window.location.reload()
  }

  const getStatusBadge = (status: string) => {
    const s = CLIENT_STATUSES.find((s) => s.value === status)
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
        <h2 className="text-xl font-semibold text-neutral-900">Clients</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 h-9 px-4 bg-green-700 hover:bg-green-800 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus size={16} />
          Add client
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search clients..."
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
          {CLIENT_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-6 h-6 border-2 border-green-700 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <p className="text-neutral-400 text-sm">
              {search || statusFilter ? 'No clients match your search' : 'No clients yet'}
            </p>
            {!search && !statusFilter && (
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-3 text-sm text-green-700 hover:underline"
              >
                Add your first client
              </button>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100">
                <th className="text-left text-xs font-medium text-neutral-400 uppercase tracking-wide px-6 py-3">Client</th>
                <th className="text-left text-xs font-medium text-neutral-400 uppercase tracking-wide px-6 py-3 hidden sm:table-cell">Contact</th>
                <th className="text-left text-xs font-medium text-neutral-400 uppercase tracking-wide px-6 py-3 hidden md:table-cell">Email</th>
                <th className="text-left text-xs font-medium text-neutral-400 uppercase tracking-wide px-6 py-3">Status</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((client) => (
                <tr
                  key={client.id}
                  className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${getAvatarColor(client.name)}`}>
                        {getInitials(client.name)}
                      </div>
                      <span className="text-sm font-medium text-neutral-900">{client.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <span className="text-sm text-neutral-500">{client.contact_name ?? '—'}</span>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <div className="flex items-center gap-1.5">
                      {client.email ? (
                        <>
                          <Mail size={13} className="text-neutral-400" />
                          <span className="text-sm text-neutral-500">{client.email}</span>
                        </>
                      ) : (
                        <span className="text-sm text-neutral-300">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(client.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 justify-end">
  <button
  onClick={() => openEdit(client)}
  className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
>
  <Pencil size={15} />
</button>
                     <button
  onClick={(e) => {
    e.stopPropagation()
    setConfirmDelete(client.id)
  }}
  className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
>
  <Trash2 size={15} />
</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add client modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Add client</h3>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700">Client name *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Acme Inc."
                  className="h-10 px-3 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700">Contact name</label>
                <input
                  type="text"
                  value={newContact}
                  onChange={(e) => setNewContact(e.target.value)}
                  placeholder="John Smith"
                  className="h-10 px-3 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700">Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="client@company.com"
                  className="h-10 px-3 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700">Phone</label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+1 234 567 8900"
                  className="h-10 px-3 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ClientStatus)}
                  className="h-10 px-3 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                >
                  {CLIENT_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="h-9 px-4 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={adding || !newName.trim()}
                className="h-9 px-4 bg-green-700 hover:bg-green-800 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {adding ? 'Adding...' : 'Add client'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit client modal */}
      {showEditModal && editClient && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Edit client</h3>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700">Client name *</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="h-10 px-3 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700">Contact name</label>
                <input
                  type="text"
                  value={editContact}
                  onChange={(e) => setEditContact(e.target.value)}
                  className="h-10 px-3 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700">Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="h-10 px-3 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700">Phone</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="h-10 px-3 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as ClientStatus)}
                  className="h-10 px-3 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                >
                  {CLIENT_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="h-9 px-4 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                disabled={editing}
                className="h-9 px-4 bg-green-700 hover:bg-green-800 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {editing ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-neutral-900 mb-2">
              Delete client?
            </h3>
            <p className="text-sm text-neutral-500 mb-6">
              This will permanently delete the client and all associated data. This cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="h-9 px-4 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteClient(confirmDelete)
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