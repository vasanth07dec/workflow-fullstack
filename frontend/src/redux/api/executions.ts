import { api } from ".";
import type { ExecutionAPIResponse } from "../../types/execution";

const execution = api.injectEndpoints({
    endpoints: (build) => ({
        /**
         * get executed workflow list
         */
        getAllExecutions: build.query<ExecutionAPIResponse[], {status?: string, filter_by_assignee?: string }>({
            query: (params) => ({
                url: `execution-workflow`,
                params,
            }),
            providesTags: ["Execution"]
        }),
        /**
         * execution action api that trigger execution process
         */
        executeWorkflow: build.mutation<unknown, { workflowId: string; input_data: unknown, triggered_by: string | null }>({
            query: ({ workflowId, input_data, triggered_by }) => ({
                url: `workflows/${workflowId}/execute`,
                method: 'POST',
                body: {
                    input_data,
                    triggered_by
                },
            }),
            invalidatesTags: ["Execution", "Workflows"]
        }),
        /**
         * cancel the execution
         */
        cancelExecution: build.mutation<unknown, string>({
            query: (executionId) => ({
                url: `executions/${executionId}/cancel`,
                method:"POST",
            }),
            invalidatesTags: ["Execution", "Workflows"]
        }),
        /**
         * approve the execution
         */
        approveExecution: build.mutation<unknown, string>({
            query: (executionId) => ({
                url: `executions/${executionId}/approve`,
                method:"POST",
            }),
            invalidatesTags: ["Execution", "Workflows"]
        })
    })
})

export const { useGetAllExecutionsQuery, useLazyGetAllExecutionsQuery, useExecuteWorkflowMutation, useCancelExecutionMutation, useApproveExecutionMutation } = execution;