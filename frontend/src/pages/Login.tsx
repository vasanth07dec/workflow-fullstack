import React from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../redux/api/auth';
import type { LoginPayload } from '../types/user';

const { Title } = Typography;

/**
 * Component - Login
 * used to login and auth check
 * 
 * @returns Login page
 */
const Login: React.FC = () => {
  const [form] = Form.useForm();
  const [login, { isLoading }] = useLoginMutation();
  const navigate = useNavigate();

  const handleSubmit =  (values: LoginPayload) => {
    login(values).then((r) => {
        if ('data' in r) {
            message.success('Login successful');
            navigate('/');
            console.log(r?.data?.user,"logged in user")
            localStorage.setItem('user', JSON.stringify(r?.data?.user || {}));
        } else {
            message.error('Login failed');
        }
        }).catch(() => {    
            message.error('Login failed');
        });
    }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card style={{ width: 400 }}>
        <Title level={3} style={{ textAlign: 'center' }}>
          Login
        </Title>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Email is required' },
              { type: 'email', message: 'Invalid email' },
            ]}
          >
            <Input
              size='large'
              prefix={<UserOutlined />}
              placeholder="Enter your email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Password is required' }]}
          >
            <Input
              type="password"
              size='large'
              prefix={<LockOutlined />}
              placeholder="Enter your password"
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            block
            loading={isLoading}
          >
            Login
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default Login;