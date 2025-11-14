import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, user }) {
  // Verificar se é guest
  const guestData = localStorage.getItem('guest_user');
  const isGuest = guestData ? JSON.parse(guestData) : null;

  if (!user && !isGuest) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}
