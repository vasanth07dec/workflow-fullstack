/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Space,
  Select,
  Switch,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useCreateWorkflowMutation, useGetApproversListQuery } from '../redux/api/workflow';

const { Title } = Typography;

/**
 * Component - WorkflowEditor 
 * shows form for create or edit
 * 
 * @returns WorkflowEditor create or edit page
 */
const WorkflowEditor: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [createWorkflow, { isLoading }] = useCreateWorkflowMutation();
  const { data } = useGetApproversListQuery();

  /**
   * approver list for select field
   */
  const approverOptions = useMemo(() => {
    return data?.map((approver) => ({
      value: approver.email,
      label: approver.name,
    })) || [];
  }, [data]);

  /**
   * form submit handler
   */
  const handleSubmit = async () => {
    const values = await form.validateFields();
    
    const payload = {
      name: values.name,
      version: 1,
      input_schema: { schema: values.input_schema },
      steps: values.steps.map((step: Record<string, string>, index: number) => ({
        name: step.name,
        step_type: step.step_type,
        step_order: index + 1,
        priority: index + 1,
        metadata: {
          assignee_email: step.assignee_email,
        },
        condition: step.condition || {},
      })),
    }
    createWorkflow(payload).then(() => {
      navigate("/")
    })
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')} />
        <Title level={3} className="mb-0">
          Create Workflow
        </Title>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          input_schema: [{}],
          steps: [
            {
              condition: {},
            },
          ],
        }}
      >
        <Card title="Basic Information" className="mb-6">
          <Form.Item
            label="Workflow Name"
            name="name"
            rules={[{ required: true }]}
          >
            <Input placeholder="Expense Approval" />
          </Form.Item>
        </Card>

        <Card
          title="Input Schema"
          className="mb-6"
          extra={
            <Form.List name="input_schema">
              {(fields, { add }) =>
                fields.length > 0 && (
                  <Button icon={<PlusOutlined />} onClick={() => add({})}>
                    Add Field
                  </Button>
                )
              }
            </Form.List>
          }
        >
          <Form.List name="input_schema">
            {(fields, { remove }) => (
              <>
                {fields.map(({ key, name }) => (
                  <Card
                    key={key}
                    size="small"
                    className="mb-4"
                    extra={
                      fields.length > 1 && (
                        <DeleteOutlined onClick={() => remove(name)} />
                      )
                    }
                  >
                    <Space wrap>
                      <Form.Item
                        name={[name, 'field_name']}
                        rules={[{ required: true }]}
                      >
                        <Input placeholder="Field Name (e.g., amount)" />
                      </Form.Item>

                      <Form.Item
                        name={[name, 'type']}
                        rules={[{ required: true }]}
                      >
                        <Select
                          placeholder="Type"
                          style={{ width: 140 }}
                          options={[
                            { value: 'string', label: 'String' },
                            { value: 'number', label: 'Number' },
                            { value: 'boolean', label: 'Boolean' },
                            { value: 'select', label: 'Select' },
                          ]}
                        />
                      </Form.Item>

                      <Form.Item
                        name={[name, 'required']}
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                    </Space>
                  </Card>
                ))}
              </>
            )}
          </Form.List>
        </Card>

        <Card
          title="Workflow Steps"
          extra={
            <Form.List name="steps">
              {(fields, { add }) =>
                fields.length > 0 && (
                  <Button icon={<PlusOutlined />} onClick={() => add({ condition: {} })}>
                    Add Step
                  </Button>
                )
              }
            </Form.List>
          }
        >
          <Form.List name="steps">
            {(fields, { remove }) => (
              <>
                {fields.map(({ key, name }) => (
                  <Card
                    key={key}
                    className="mb-6"
                    title={`Step ${name + 1}`}
                    extra={
                      fields.length > 1 && (
                        <DeleteOutlined onClick={() => remove(name)} />
                      )
                    }
                  >
                    <Form.Item
                      label="Step Name"
                      name={[name, 'name']}
                      rules={[{ required: true }]}
                    >
                      <Input placeholder="Manager Approval" />
                    </Form.Item>

                    <Form.Item
                      label="Step Type"
                      name={[name, 'step_type']}
                      rules={[{ required: true }]}
                    >
                      <Select
                        options={[
                          // { value: 'task', label: 'Task' },
                          { value: 'approval', label: 'Approval' },
                          { value: 'notification', label: 'Notification' },
                        ]}
                      />
                    </Form.Item>

                    <Form.Item
                      label="Assignee Email"
                      name={[name, 'assignee_email']}
                      rules={[
                        { required: true },
                        { type: 'email', message: 'Invalid email' },
                      ]}
                    >
                      <Select
                        placeholder="Select Approver"
                        style={{ width: 240 }}
                        options={approverOptions}
                      />
                    </Form.Item>

                    <Divider>Condition</Divider>

                    <Form.Item
                      shouldUpdate
                      noStyle
                    >
                      {() => {
                        const schema = form.getFieldValue('input_schema') || [];

                        const fieldOptions = schema
                          .filter((f: any) => f?.field_name)
                          .map((f: any) => ({
                            value: f.field_name,
                            label: f.field_name,
                          }));

                        return (
                          <Space wrap>
                            <Form.Item
                              name={[name, 'condition', 'field']}
                              rules={[{ required: true }]}
                            >
                              <Select
                                placeholder="Select Field"
                                style={{ width: 160 }}
                                options={fieldOptions}
                              />
                            </Form.Item>

                            <Form.Item
                              name={[name, 'condition', 'operator']}
                              rules={[{ required: true }]}
                            >
                              <Select
                                style={{ width: 120 }}
                                options={[
                                  { value: '>', label: '>' },
                                  { value: '<', label: '<' },
                                  { value: '>=', label: '>=' },
                                  { value: '<=', label: '<=' },
                                  { value: '==', label: 'Equals' },
                                  { value: '!=', label: 'Not Equals' },
                                ]}
                              />
                            </Form.Item>

                            <Form.Item
                              name={[name, 'condition', 'value']}
                              rules={[{ required: true }]}
                            >
                              <Input placeholder="Value" />
                            </Form.Item>
                          </Space>
                        );
                      }}
                    </Form.Item>
                  </Card>
                ))}
              </>
            )}
          </Form.List>
        </Card>

        <div className="flex justify-end gap-3">
          <Button onClick={() => navigate('/')}>Cancel</Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            htmlType="submit"
            size="large"
            loading={isLoading}
          >
            Save Workflow
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default WorkflowEditor;