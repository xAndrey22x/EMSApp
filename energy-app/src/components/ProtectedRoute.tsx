import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  isAdminRoute: boolean;
}

export function ProtectedRoute({ children, isAdminRoute }: ProtectedRouteProps) {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isAuthenticated = user !== null;
  const isAdmin = user?.admin;

  if (!isAuthenticated) return <Navigate to="/login" />;
  if ((isAdminRoute && !isAdmin) || (!isAdminRoute && isAdmin)) {
    return <Navigate to="/exception" />;
  }
  return <>{children}</>;
}
