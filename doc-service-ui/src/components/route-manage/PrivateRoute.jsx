import { Navigate } from 'react-router-dom';
// PrivateRoute lives under `src/components/route-manage/`, so reach up to `src/services`.
import authService from '../../services/auth.service';

export default function PrivateRoute({ children }) {
    if (!authService.isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }
    return children;
}
