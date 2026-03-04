import { createBrowserRouter } from "react-router-dom";
import { lazyLoad } from "../utils/lazyLoad";
import Login from "../pages/Login";
import NotFound from "../pages/NotFound";

// Lazy pages
const WorkflowList = lazyLoad(() => import("../pages/Workflow"));
const WorkflowEditor = lazyLoad(() => import("../pages/WorkflowEditor"));
const Execution = lazyLoad(() => import("../pages/Execution"));
const Logs = lazyLoad(() => import("../pages/Logs"));

// Lazy layout & protected route
const AppLayout = lazyLoad(() => import("../components/AppLayout"));
const ProtectedRoute = lazyLoad(() => import("../components/ProtectedRoute"));

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,

  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: "/",
            element: <WorkflowList />,
          },
          {
            path: "/workflows/new",
            element: <WorkflowEditor />,
          },
          {
            path: "/execution",
            element: <Execution />,
          },
          {
            path: "/logs",
            element: <Logs />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);