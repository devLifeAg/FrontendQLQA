import React from 'react';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  children: React.ReactNode; // Thay vì JSX.Element, dùng React.ReactNode
  disallowedRoles: number[]; // Các role bị chặn truy cập
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, disallowedRoles }) => {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!user) {
    // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
    return <Navigate to="/" />;
  }
  if (disallowedRoles.includes(user.u_role)) {
    // Nếu đã đăng nhập nhưng role bị chặn, chuyển hướng đến trang chủ
    return <Navigate to="/Home" />;
  }

  // Nếu hợp lệ, cho phép truy cập trang
  return <>{children}</>;
};

export default PrivateRoute;
