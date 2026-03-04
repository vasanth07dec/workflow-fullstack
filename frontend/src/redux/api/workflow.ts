import { api } from ".";
import type { ApproverListResponse } from "../../types/approver";
import type { WorkflowAPIResponse, WorkflowReq } from "../../types/workflow";

const workflow = api.injectEndpoints({
    endpoints: (build) => ({
        /**
         * get workflow list
         */
        getWorkflow: build.query<WorkflowAPIResponse, WorkflowReq | void>({
            query: (params: { filter_by_assignee?: string, is_active?: boolean, page: number, limit: number, search?: string }) => ({
                url: `workflows`,
                params: {
                    filter_by_assignee: params?.filter_by_assignee,
                    is_active: params?.is_active,
                    page: params?.page,
                    limit: params?.limit,
                    search: params?.search
                }
            }),
            providesTags: ['Workflows'],
        }),
        /**
         * create workflow
         */
        createWorkflow: build.mutation({
            query: (data) => ({
                url: `workflows`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Workflows'],
        }),
        /**
         * get approvers list eg manager or ceo
         */
        getApproversList: build.query<ApproverListResponse[], void>({
            query: () => `approvers-list`,
        }),
        
    })
});

export const { useGetWorkflowQuery, useLazyGetWorkflowQuery, useCreateWorkflowMutation, useGetApproversListQuery } = workflow