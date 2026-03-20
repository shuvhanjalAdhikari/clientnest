export type UserRole = 'owner' | 'admin' | 'member'

export type ClientStatus = 'active' | 'inactive' | 'prospect'

export type ProjectStatus = 
  | 'draft' 
  | 'active' 
  | 'on_hold' 
  | 'completed' 
  | 'archived'

export type TaskStatus = 'todo' | 'in_progress' | 'done'

export type Priority = 'low' | 'medium' | 'high'

export type FileType = 'pdf' | 'docx' | 'txt'

export interface Workspace {
  id: string
  name: string
  slug: string
  logo_url?: string
  created_at: string
}

export interface User {
  id: string
  workspace_id: string
  full_name: string
  avatar_url?: string
  role: UserRole
  created_at: string
}

export interface Client {
  id: string
  workspace_id: string
  name: string
  contact_name?: string
  email?: string
  phone?: string
  status: ClientStatus
  notes?: string
  created_at: string
}

export interface Project {
  id: string
  workspace_id: string
  client_id: string
  name: string
  description?: string
  status: ProjectStatus
  deadline?: string
  created_by: string
  created_at: string
  client?: Client
}

export interface Task {
  id: string
  workspace_id: string
  project_id: string
  title: string
  description?: string
  status: TaskStatus
  priority: Priority
  assignee_id?: string
  due_date?: string
  position: number
  created_at: string
  assignee?: User
  project?: { id: string; name: string } // add this line
}

export interface Document {
  id: string
  workspace_id: string
  client_id?: string
  project_id?: string
  name: string
  storage_path: string
  file_type?: FileType
  file_size?: number
  is_indexed: boolean
  uploaded_by: string
  created_at: string
}

export interface ActivityLog {
  id: string
  workspace_id: string
  actor_id: string
  action: string
  entity_type?: string
  entity_id?: string
  metadata?: Record<string, unknown>
  created_at: string
  actor?: User
}

export interface AIConversation {
  id: string
  workspace_id: string
  user_id: string
  title?: string
  scope_type?: string
  scope_id?: string
  created_at: string
}

export interface AIMessage {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  sources?: string[]
  created_at: string
}

export interface MeetingNote {
  id: string
  workspace_id: string
  project_id: string
  title: string
  raw_notes?: string
  action_items?: string[]
  decisions?: string[]
  key_notes?: string[]
  meeting_date?: string
  created_at: string
}