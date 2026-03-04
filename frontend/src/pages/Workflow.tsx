/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Tag,
  Input,
  Space,
  Typography,
  Tooltip,
  Form,
  InputNumber,
  Modal,
  type TableColumnType,
  type TablePaginationConfig,
  message,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  PlayCircleOutlined,
  DeleteOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import {
  useLazyGetWorkflowQuery,
} from '../redux/api/workflow';
import type { WorkflowData, WorkflowReq } from '../types/workflow';
import { useDebounce } from '../hooks/useDebounce';
import { useExecuteWorkflowMutation } from '../redux/api/executions';

const { Title, Text } = Typography;

/**
 * Component - WorkflowList
 * show all workflow with search, pagination.. each workflow includes execution button
 * 
 * @returns WorkflowList component
 */
const WorkflowList: React.FC = () => {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = userInfo?.id || null;
  const role = userInfo?.role || "user";
  const email = userInfo?.email || "";

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);

  const [page, setPage] = useState(1);
  const [limit] = useState(2);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] =
    useState<WorkflowData | null>(null);

  const [form] = Form.useForm();

  const [fetchWorkflows, { data: workflowData, isLoading }] =
    useLazyGetWorkflowQuery();

  const [executeWorkflow] = useExecuteWorkflowMutation();

  /**
   * Fetch Workflows
   */
  useEffect(() => {
    const params: WorkflowReq = {
      page,
      limit,
    };

    if (debouncedSearch) {
      params.search = debouncedSearch;
    }

    if (role === "ceo" || role === "manager") {
      params.filter_by_assignee = email;
      params.is_active = true;
    }

    fetchWorkflows(params);
  }, [page, limit, debouncedSearch, role, email, fetchWorkflows]);

  /**
   * Handle Table Pagination Change
   */
  const handleTableChange = (pagination: TablePaginationConfig) => {
    setPage(pagination?.current || 1);
  };

  /**
   * Reset page when searching
   */
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const columns: TableColumnType<WorkflowData>[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
      render: (v: number) => <Tag color="blue">v{v}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'default'}>
          {active ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
    },
    {
      title: 'Updated',
      dataIndex: 'updated_at',
      key: 'updated_at',
    },
    {
      title: 'Actions',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (is_active: boolean, record) => {
        console.log(is_active,"is_active")
        return is_active ? "Executed" : <Space>
          <Tooltip title="Execute">
            <Button
              size="small"
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={() => {
                setSelectedWorkflow(record);
                setIsModalOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              size="small"
              color='gold'
              icon={<EditOutlined />}
              disabled
              onClick={() => {
                setSelectedWorkflow(record);
                setIsModalOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              size="small"
              type="primary"
              danger
              disabled
              icon={<DeleteOutlined />}
              onClick={() => {
                setSelectedWorkflow(record);
                setIsModalOpen(true);
              }}
            />
          </Tooltip>
        </Space>
      },
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Title level={3}>Workflows</Title>
          <Text>Manage and execute your automation workflows</Text>
        </div>

        {role === "admin" && <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => navigate('/workflows/new')}
        >
          Create Workflow
        </Button>}
      </div>

      <div className="bg-background p-4">
        <div className="mb-4">
          <Input
            placeholder="Search workflows..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
            allowClear
          />
        </div>
        <Table
          columns={columns}
          dataSource={workflowData?.data || []}
          rowKey="id"
          loading={isLoading}
          onChange={handleTableChange}
          pagination={{
            current: workflowData?.pagination?.page || 1,
            pageSize: workflowData?.pagination?.limit || 10,
            total: workflowData?.pagination?.total || 0,
            showSizeChanger: false,
          }}
        />
        <Modal
          title={`Execute Workflow: ${selectedWorkflow?.name || ""}`}
          open={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false);
            form.resetFields();
          }}
          footer={null}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={(values) => {
              executeWorkflow({
                workflowId: selectedWorkflow?.id || "",
                input_data: values,
                triggered_by: userId,
              }).then(() => {
                setIsModalOpen(false);
                form.resetFields();
                message.success("Executed successfully")
              })
            }}
          >
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {selectedWorkflow?.input_schema?.schema?.map((field: any) => {
              const { type, field_name, required } = field;

              return (
                <Form.Item
                  key={field_name}
                  name={field_name}
                  label={field_name}
                  rules={
                    required
                      ? [{ required: true, message: `${field_name} is required` }]
                      : []
                  }
                >
                  {type === "number" ? (
                    <InputNumber style={{ width: "100%" }} />
                  ) : (
                    <Input />
                  )}
                </Form.Item>
              );
            })}

            <Button type="primary" htmlType="submit">
              Execute
            </Button>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default WorkflowList;