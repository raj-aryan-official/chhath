import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import SunLoader from '../components/brand/SunLoader.jsx';
import { selectIsAdmin, selectUser } from '../store/slices/authSlice.js';

export default function ProtectedRoute({ adminOnly = false }) {
  const user = useSelector(selectUser);
  const isAdmin = useSelector(selectIsAdmin);
  const status = useSelector((state) => state.auth.status);
  const location = useLocation();

  if (status === 'idle' || status === 'loading') {
    return <SunLoader />;
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
