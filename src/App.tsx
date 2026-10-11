// App.tsx
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import Layout from "./Components/Layout/Layout";
import Home from "./Components/Home/Home";
import Login from "./Components/Login/Login";
import Register from "./Components/Register/Register";
import NotFound from "./Components/Notfound/NotFound";
import Profile from "./Components/Profile/Profile";
import PostDetails from "./Components/PostDetails/PostDetails";
import ProtectedRoute from "./Components/ProtectedRoute/ProtectedRoute";
import GuestRoute from "./Components/GuestRoute/GuestRoute";
import AuthContextProvider from "./Components/Context/AuthContext/AuthContext";
import Notification from "./Components/Notification/Notification";
import Settings from "./Components/Settings/Settings";

// برا الـ component عشان ما يتعملوش من جديد مع كل رندر
const queryClient = new QueryClient();

const router = createBrowserRouter([
  // صفحات الدخول: من غير Navbar، ومقفولة على اللي عامل لوجين
  {
    element: <GuestRoute />,
    children: [
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
    ],
  },
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/feed" replace /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: "feed", element: <Home /> },
          {
            path: "profile",
            element: <Profile />,
          },
          {
            path: "profile/:id",
            element: <Profile />,
          },
          { path: "postDetails/:id", element: <PostDetails /> },
          {
            path: "notifications",
            element: <Notification/>,
          },
          { path: "settings", element: <Settings/> },
        ],
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

const App = () => (
  <AuthContextProvider>
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <RouterProvider router={router} />
    </QueryClientProvider>
  </AuthContextProvider>
);

export default App;
