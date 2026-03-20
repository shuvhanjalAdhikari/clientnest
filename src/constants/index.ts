export const PROJECT_STATUSES = [
  { value: 'draft',     label: 'Draft',     color: 'bg-gray-100 text-gray-600' },
  { value: 'active',    label: 'Active',    color: 'bg-green-100 text-green-700' },
  { value: 'on_hold',   label: 'On Hold',   color: 'bg-amber-100 text-amber-700' },
  { value: 'completed', label: 'Completed', color: 'bg-blue-100 text-blue-700' },
  { value: 'archived',  label: 'Archived',  color: 'bg-gray-100 text-gray-500' },
]

export const TASK_STATUSES = [
  { value: 'todo',        label: 'To Do',       color: 'bg-gray-100 text-gray-600' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-amber-100 text-amber-700' },
  { value: 'done',        label: 'Done',        color: 'bg-green-100 text-green-700' },
]

export const PRIORITIES = [
  { value: 'low',    label: 'Low',    color: 'bg-gray-100 text-gray-600' },
  { value: 'medium', label: 'Medium', color: 'bg-amber-100 text-amber-700' },
  { value: 'high',   label: 'High',   color: 'bg-red-100 text-red-700' },
]

export const CLIENT_STATUSES = [
  { value: 'active',   label: 'Active',   color: 'bg-green-100 text-green-700' },
  { value: 'inactive', label: 'Inactive', color: 'bg-gray-100 text-gray-500' },
  { value: 'prospect', label: 'Prospect', color: 'bg-purple-100 text-purple-700' },
]

export const NAV_ITEMS = [
  { label: 'Dashboard',  href: '/dashboard',  icon: 'LayoutDashboard' },
  { label: 'Clients',    href: '/clients',    icon: 'Users' },
  { label: 'Projects',   href: '/projects',   icon: 'FolderOpen' },
  { label: 'Tasks',      href: '/tasks',      icon: 'CheckSquare' },
  { label: 'Documents',  href: '/documents',  icon: 'FileText' },
  { label: 'AI Assistant', href: '/assistant', icon: 'Sparkles' },
]

export const FILE_TYPES = [
  { value: 'pdf',  label: 'PDF',      accept: '.pdf' },
  { value: 'docx', label: 'Word Doc', accept: '.docx' },
  { value: 'txt',  label: 'Text',     accept: '.txt' },
]

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB in bytes