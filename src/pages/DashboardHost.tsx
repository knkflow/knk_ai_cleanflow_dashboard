import { Navigate } from 'react-router-dom';

export function DashboardHost() {
  return <Navigate to="/host/apartments" replace />;
}
