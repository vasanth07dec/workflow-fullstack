import type { APIResponse } from "./common"

export type WorkflowAPIResponse = APIResponse<WorkflowData>

export interface WorkflowData {
  id: string
  name: string
  version: number
  is_active: boolean
  input_schema: InputSchema
  start_step_id: string
  created_at: string
  updated_at: string
}

export interface InputSchema {
  schema: Schema[]
}

export interface Schema {
  type: string
  required: boolean
  field_name: string
}

export type WorkflowReq = { filter_by_assignee?: string, is_active?: boolean, page: number, limit: number, search?: string }

