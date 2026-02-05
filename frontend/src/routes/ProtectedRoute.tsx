import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { auth$, isAuthenticated } from '../state/auth.store';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState<boolean>(isAuthenticated(auth$.value));
  useEffect(() => {
    const sub = auth$.subscribe((s) => setOk(isAuthenticated(s)));
    return () => sub.unsubscribe();
  }, []);
  if (!ok) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
