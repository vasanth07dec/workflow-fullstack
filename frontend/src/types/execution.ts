
export interface ExecutionAPIResponse {
  id: string
  workflow_id: string
  workflow_version: number
  status: string
  data: Data
  current_step_id: string
  retries: number
  triggered_by: string
  started_at: string
  ended_at: string
  workflow_name: string
  triggered_by_name: string
}

export interface Data {
  amount?: number
  country?: string
  department?: string
  [key: string]: unknown
}
