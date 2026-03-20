'use client'

import { useState } from 'react'
import { useTasks } from '@/hooks/useTasks'
import { useProjects } from '@/hooks/useProjects'
import { Plus, Search, Trash2, Pencil, CheckSquare } from 'lucide-react'
import { TASK_STATUSES, PRIORITIES } from '@/constants'
import type { TaskStatus, Priority, Task } from '@/types'

export default function TasksClient() {
  const { tasks, loading, addTask, updateTask, deleteTask } = useTasks()
  const { projects } = useProjects()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')

  // Add modal
  const [showAddModal, setShowAddModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newStatus, setNewStatus] = useState<TaskStatus>('todo')
  const [newPriority, setNewPriority] = useState<Priority>('medium')
  const [newDueDate, setNewDueDate] = useState('')
  const [newProjectId, setNewProjectId] = useState('')
  const [adding, setAdding] = useState(false)

  // Delete confirmation
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const [showEditModal, setShowEditModal] = useState(false)
const [editTask, setEditTask] = useState<Task | null>(null)
const [editTitle, setEditTitle] = useState('')
const [editStatus, setEditStatus] = useState<TaskStatus>('todo')
const [editPriority, setEditPriority] = useState<Priority>('medium')
const [editDueDate, setEditDueDate] = useState('')
const [editProjectId, setEditProjectId] = useState('')
const [editing, setEditing] = useState(false)

  const filtered = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter ? t.status === statusFilter : true
    const matchesPriority = priorityFilter ? t.priority === priorityFilter : true
    return matchesSearch && matchesStatus && matchesPriority
  })

  // Group by project
  const grouped = filtered.reduce((acc, task) => {
    const projectName = (task.project as { name: string } | null)?.name ?? 'No project'
    if (!acc[projectName]) acc[projectName] = []
    acc[projectName].push(task)
    return acc
  }, {} as Record<string, typeof tasks>)

  async function handleAdd() {
    if (!newTitle.trim() || !newProjectId) return
    setAdding(true)
    await addTask({
      title: newTitle,
      description: newDescription || undefined,
      status: newStatus,
      priority: newPriority,
      due_date: newDueDate || undefined,
      project_id: newProjectId,
    })
    setNewTitle('')
    setNewDescription('')
    setNewStatus('todo')
    setNewPriority('medium')
    setNewDueDate('')
    setNewProjectId('')
    setAdding(false)
    setShowAddModal(false)
  }

  const getPriorityDot = (priority: string) => {
    const colors: Record<string, string> = {
      high: 'bg-red-500',
      medium: 'bg-amber-500',
      low: 'bg-green-500',
    }
    return (
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${colors[priority] ?? 'bg-neutral-300'}`} />
    )
  }

  const getStatusBadge = (status: string) => {
    const s = TASK_STATUSES.find((s) => s.value === status)
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
        <h2 className="text-xl font-semibold text-neutral-900">Tasks</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 h-9 px-4 bg-green-700 hover:bg-green-800 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus size={16} />
          Add task
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search tasks..."
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
          {TASK_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="h-10 px-3 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
        >
          <option value="">All priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      {/* Tasks list */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-6 h-6 border-2 border-green-700 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-center bg-white border border-neutral-200 rounded-xl">
          <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <CheckSquare size={22} className="text-neutral-400" />
          </div>
          <p className="text-neutral-500 text-sm mb-1">
            {search || statusFilter || priorityFilter ? 'No tasks match your search' : 'No tasks yet'}
          </p>
          {!search && !statusFilter && !priorityFilter && (
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-2 text-sm text-green-700 hover:underline"
            >
              Add your first task
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {Object.entries(grouped).map(([projectName, projectTasks]) => (
            <div key={projectName}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                  {projectName}
                </span>
                <span className="text-xs text-neutral-400 font-mono">
                  {projectTasks.length}
                </span>
              </div>
              <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
                {projectTasks.map((task, index) => (
                  <div
                    key={task.id}
                    className={`flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors ${
                      index < projectTasks.length - 1 ? 'border-b border-neutral-100' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={() =>
                        updateTask(task.id, {
                          status: task.status === 'done' ? 'todo' : 'done',
                        })
                      }
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        task.status === 'done'
                          ? 'bg-green-700 border-green-700'
                          : 'border-neutral-300 hover:border-green-600'
                      }`}
                    >
                      {task.status === 'done' && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </button>

                    {/* Priority dot */}
                    {getPriorityDot(task.priority)}

                    {/* Title */}
                    <span className={`flex-1 text-sm ${
                      task.status === 'done'
                        ? 'line-through text-neutral-400'
                        : 'text-neutral-900'
                    }`}>
                      {task.title}
                    </span>

                    {/* Status badge */}
                    <div className="hidden sm:block">
                      {getStatusBadge(task.status)}
                    </div>

                    {/* Due date */}
                    {task.due_date && (
                      <span className={`text-xs font-mono hidden md:block ${
                        new Date(task.due_date) < new Date() && task.status !== 'done'
                          ? 'text-red-600 font-medium'
                          : 'text-neutral-400'
                      }`}>
                        {new Date(task.due_date).toLocaleDateString()}
                      </span>
                    )}

                    {/* Actions */}
                    {/* Actions */}
<div className="flex items-center gap-1">
  <button
    onClick={() => {
      setEditTask(task)
      setEditTitle(task.title)
      setEditStatus(task.status)
      setEditPriority(task.priority)
      setEditDueDate(task.due_date ?? '')
      setEditProjectId(task.project_id)
      setShowEditModal(true)
    }}
    className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
  >
    <Pencil size={14} />
  </button>
  <button
    onClick={() => setConfirmDelete(task.id)}
    className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
  >
    <Trash2 size={14} />
  </button>
</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add task modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Add task</h3>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700">Task title *</label>
                <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Design homepage mockup" className="h-10 px-3 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700">Project *</label>
                <select value={newProjectId} onChange={(e) => setNewProjectId(e.target.value)} className="h-10 px-3 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent">
                  <option value="">Select a project</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="flex gap-3">
                <div className="flex flex-col gap-1.5 flex-1">
                  <label className="text-sm font-medium text-neutral-700">Status</label>
                  <select value={newStatus} onChange={(e) => setNewStatus(e.target.value as TaskStatus)} className="h-10 px-3 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent">
                    {TASK_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5 flex-1">
                  <label className="text-sm font-medium text-neutral-700">Priority</label>
                  <select value={newPriority} onChange={(e) => setNewPriority(e.target.value as Priority)} className="h-10 px-3 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent">
                    {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700">Due date</label>
                <input type="date" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} className="h-10 px-3 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700">Description</label>
                <textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Optional details..." rows={2} className="px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent resize-none" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="h-9 px-4 text-sm text-neutral-600 hover:text-neutral-900 transition-colors">Cancel</button>
              <button onClick={handleAdd} disabled={adding || !newTitle.trim() || !newProjectId} className="h-9 px-4 bg-green-700 hover:bg-green-800 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {adding ? 'Adding...' : 'Add task'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit task modal */}
{showEditModal && editTask && (
  <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowEditModal(false)}>
    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">Edit task</h3>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-neutral-700">Task title *</label>
          <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="h-10 px-3 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-neutral-700">Project</label>
          <select value={editProjectId} onChange={(e) => setEditProjectId(e.target.value)} className="h-10 px-3 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent">
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="flex gap-3">
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-sm font-medium text-neutral-700">Status</label>
            <select value={editStatus} onChange={(e) => setEditStatus(e.target.value as TaskStatus)} className="h-10 px-3 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent">
              {TASK_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-sm font-medium text-neutral-700">Priority</label>
            <select value={editPriority} onChange={(e) => setEditPriority(e.target.value as Priority)} className="h-10 px-3 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent">
              {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-neutral-700">Due date</label>
          <input type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} className="h-10 px-3 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent" />
        </div>
      </div>
      <div className="flex items-center justify-end gap-3 mt-6">
        <button onClick={() => setShowEditModal(false)} className="h-9 px-4 text-sm text-neutral-600 hover:text-neutral-900 transition-colors">Cancel</button>
        <button
          onClick={async () => {
            setEditing(true)
            await updateTask(editTask.id, {
              title: editTitle,
              status: editStatus,
              priority: editPriority,
              due_date: editDueDate || undefined,
              project_id: editProjectId,
            })
            setShowEditModal(false)
            setEditing(false)
          }}
          disabled={editing}
          className="h-9 px-4 bg-green-700 hover:bg-green-800 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
        >
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
            <h3 className="text-base font-semibold text-neutral-900 mb-2">Delete task?</h3>
            <p className="text-sm text-neutral-500 mb-6">This will permanently delete this task. This cannot be undone.</p>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setConfirmDelete(null)} className="h-9 px-4 text-sm text-neutral-600 hover:text-neutral-900 transition-colors">Cancel</button>
              <button onClick={() => { deleteTask(confirmDelete); setConfirmDelete(null) }} className="h-9 px-4 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors">Delete</button>
            </div>
          </div>
        </div>
        
      )}

    </div>
  )
}