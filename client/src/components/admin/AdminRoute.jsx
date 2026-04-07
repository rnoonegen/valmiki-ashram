import { Navigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { getAdminToken } from '../../admin/api';

export default function AdminRoute({ children }) {
  const token = getAdminToken();
  if (!token) {
    return <Navigate to="/admin-login" replace />;
  }
  return children || <Outlet />;
}
