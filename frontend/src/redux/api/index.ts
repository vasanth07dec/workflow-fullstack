import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

/**
 * main centralize configuration for api integration
 */
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_BASE_URL, credentials: 'include' }),
  endpoints: () => ({ }),
  tagTypes: ['Workflows', "Execution"],
})