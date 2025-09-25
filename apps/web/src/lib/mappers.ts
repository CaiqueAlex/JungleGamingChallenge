import type { 
  BackendTaskStatus, 
  BackendTaskPriority, 
  FrontendTaskStatus, 
  FrontendTaskPriority 
} from './schemas'

export const mapStatusToBackend = (status: FrontendTaskStatus): BackendTaskStatus => {
  const mapping: Record<FrontendTaskStatus, BackendTaskStatus> = {
    'pending': 'TODO',
    'in_progress': 'IN_PROGRESS', 
    'completed': 'DONE'
  }
  return mapping[status]
}

export const mapStatusFromBackend = (status: BackendTaskStatus): FrontendTaskStatus => {
  const mapping: Record<BackendTaskStatus, FrontendTaskStatus> = {
    'TODO': 'pending',
    'IN_PROGRESS': 'in_progress',
    'DONE': 'completed'
  }
  return mapping[status]
}

export const mapPriorityToBackend = (priority: FrontendTaskPriority): BackendTaskPriority => {
  const mapping: Record<FrontendTaskPriority, BackendTaskPriority> = {
    'low': 'LOW',
    'medium': 'MEDIUM',
    'high': 'HIGH',
    'urgent': 'URGENT'
  }
  return mapping[priority]
}

export const mapPriorityFromBackend = (priority: BackendTaskPriority): FrontendTaskPriority => {
  const mapping: Record<BackendTaskPriority, FrontendTaskPriority> = {
    'LOW': 'low',
    'MEDIUM': 'medium', 
    'HIGH': 'high',
    'URGENT': 'urgent'
  }
  return mapping[priority]
}