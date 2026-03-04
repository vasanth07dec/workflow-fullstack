/* eslint-disable react-hooks/set-state-in-effect */
import { Button, Flex, Select, Space, Table, Typography } from "antd"
import { useApproveExecutionMutation, useCancelExecutionMutation, useLazyGetAllExecutionsQuery } from "../redux/api/executions";
import { useEffect, useMemo, useState } from "react";
import type { ExecutionAPIResponse } from "../types/execution";

const { Text } = Typography

/**
 * Component - Execution
 * Shows Execution list with approve or reject action
 * 
 * @returns Execution list
 */
const Execution = () => {
  const userInfo = JSON.parse(localStorage.getItem('user') || "{}")
  const email = userInfo?.email;
  const role = userInfo?.role;
  const [filter, setFilter] = useState<string | undefined>(role === "ceo" || role === "admin" ? '' : 'pending');
  const [executionData, setExecutionData] = useState<ExecutionAPIResponse[]>([])
  const [getAllExecutions, { data }] = useLazyGetAllExecutionsQuery()
  const [cancelExecution] = useCancelExecutionMutation()
  const [approveExecution, {isLoading}] = useApproveExecutionMutation()

  useEffect(() => {
    setExecutionData(data || [])
  },[data])

  /**
   * fetch execution list
   */
  useEffect(() => {
    if (role === "manager" || role === "ceo") {
      getAllExecutions({ status: filter === "" ? undefined : filter, filter_by_assignee: email })
    } else {
      getAllExecutions({})
    }
  }, [getAllExecutions, filter, email, role])

  /**
   * status field options based on role
   */
  const statusFilter = useMemo(() => {
    const status = {
      all: { label: "All", value: '' },
      pending: { label: "Pending", value: "pending" },
      in_progress: { label: "in_progress", value: "in_progress" },
      completed: { label: "Completed", value: "completed" },
      // failed: { label: "Failed", value: "failed" },
      canceled: { label: "Cancelled", value: "canceled" }
    }

    if (role === "manager") {
      return [status.pending, status.completed]
    }

    if (role === "ceo" || role === "admin") {
      return Object.values(status)
    }

    return []
  }, [role])

  const handleApproval = (id:string) => {
    approveExecution(id)
  }

  const handleRejection = (id:string) => {
    cancelExecution(id)
  }

  /**
   * columns for table
   */
  const columns = [
    {
      title: "Execution ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Workflow Name",
      dataIndex: "workflow_name",
      key: "workflow_name",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Triggered By",
      dataIndex: "triggered_by_name",
      key: "triggered_by",
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
    },
    {
      title: "Actions",
      dataIndex: "status",
      key: "status",
      render: (status: string, record: ExecutionAPIResponse) => {
        console.log(status)
        if (role === "manager" || role === "ceo") {
          return status === "pending" ? <Space>
              <Button type="primary" onClick={() => handleApproval(record.id)} loading={isLoading}>Approve</Button>
              <Button type="primary" danger onClick={() => handleRejection(record.id)}>Reject</Button>
            </Space> : `status: ${status}`
        } else {
          return <Button type="primary" disabled>Action</Button>
        }
      }
    }
  ];

  return (
    <div>
      <Flex align="center" gap={10} className="mb-6!">
        <Text>Status filter</Text>
        <Select
          value={filter}
          onChange={(value) => setFilter(value)}
          options={statusFilter}
          className="w-48"
        />
      </Flex>
      <Table
        columns={columns}
        dataSource={executionData}
        rowKey="id"
        pagination={{
          pageSize: 10,
        }}
      />
    </div>
  )
}

export default Execution