import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { getToken, decodeToken } from './auth';

export default function withAuth(WrappedComponent, allowedRoles = []) {
  return function ProtectedRoute(props) {
    const router = useRouter();

    useEffect(() => {
      // Check authentication on component mount
      const token = getToken();
      if (!token) {
        router.replace('/auth/login');
        return;
      }

      const user = decodeToken(token);
      if (!user || !allowedRoles.includes(user.role)) {
        router.replace('/auth/login');
      }
    }, [router]);

    // Return the wrapped component with its props
    return <WrappedComponent {...props} />;
  };
}