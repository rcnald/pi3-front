import { Navigate } from 'react-router-dom';

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated =
    localStorage.getItem('habitus_user_logged') === 'true';

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
