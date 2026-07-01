import { Navigate, useLocation } from 'react-router-dom';

import authService from '../../services/auth.service';

export default function PrivateRoute({ children }) {
    const location = useLocation();
    if (!authService.isAuthenticated()) {
        const from = location.pathname + location.search + location.hash;
        return <Navigate to="/login" replace state={{ from }} />;
    }
    return children;
}
