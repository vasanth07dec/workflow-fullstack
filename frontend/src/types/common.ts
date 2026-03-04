export interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

export interface APIResponse<T> {
  data: T[]
  pagination: Pagination
}