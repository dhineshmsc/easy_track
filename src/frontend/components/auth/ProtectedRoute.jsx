import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { getAuthCookie } from '../../utils/auth';

/**
 * Guards all protected routes with two checks:
 *  1. User must have a valid auth cookie (is logged in).
 *  2. The `:company` in the URL must match the company stored in
 *     the session cookie — prevents URL manipulation to access
 *     another company's workspace.
 *
 * Any failure redirects to the sign-in page ("/").
 */
const ProtectedRoute = ({ element }) => {
  const { company } = useParams();
  const session = getAuthCookie();

  // Not logged in at all
  if (!session || !session.token) {
    return <Navigate to="/" replace />;
  }

  // URL company doesn't match the logged-in user's company
  if (company && session.company && company.toLowerCase() !== session.company.toLowerCase()) {
    return <Navigate to="/" replace />;
  }

  return element;
};

export default ProtectedRoute;
