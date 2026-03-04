import React, { useMemo } from "react";
import { Layout, Menu, Button } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

const { Header, Sider, Content } = Layout;

/**
 * Component - AppLayout
 * it includes Header, Sider and content(dynamic by Outlet)
 * 
 * @returns AppLayout includes Header, Sider and content
 */
const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const role = user?.role;

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  /**
   * menu list based on role
   */
  const menuItems = useMemo(() => {
    if (role === "admin") {
      return [
        { key: "/", label: "Workflows" },
        { key: "/execution", label: "Execution" },
      ];
    }

    if (role === "user") {
      return [
        { key: "/", label: "Workflows" },
      ];
    }

    if (role === "manager" || role === "ceo") {
      return [{ key: "/", label: "Workflows" }, { key: "/execution", label: "Execution" }];
    }

    return [];
  }, [role]);

  return (
    <Layout className="min-h-screen!">
      <Sider>
        <div className="text-white p-4 font-bold">
          Workflow App
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header
          className="flex justify-end items-center bg-gray-200!"
        >
          <Button onClick={handleLogout}>Logout</Button>
        </Header>
        <Content className="m-4">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;