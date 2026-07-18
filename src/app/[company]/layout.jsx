"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAuthCookie } from '../../frontend/utils/auth';

export default function CompanyLayout({ children }) {
  const { company } = useParams();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const session = getAuthCookie();
    if (!session || !session.token) {
      router.replace('/');
      return;
    }
    
    // Check if dynamic company matches session company
    if (company && session.company && company.toLowerCase() !== session.company.toLowerCase()) {
      router.replace('/');
      return;
    }
    setAuthorized(true);
  }, [company, router]);

  if (!authorized) {
    return null;
  }

  return children;
}
