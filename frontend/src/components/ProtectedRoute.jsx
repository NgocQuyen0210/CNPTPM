import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import authService from "../services/authService";

const ProtectedRoute = ({ requiredRole }) => {
  const user = authService.getUser();

  // Nếu chưa đăng nhập, chuyển về trang Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Nếu route yêu cầu Role cụ thể (ví dụ: ADMIN) mà user không có, chuyển về trang User bình thường
  if (requiredRole && (!user.roles || !user.roles.includes(requiredRole))) {
    return <Navigate to="/dashboard/menu" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
