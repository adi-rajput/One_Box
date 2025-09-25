'use client';

import React from 'react';
import { EmailDashboard } from '../components/EmailDashboard';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <EmailDashboard />
    </div>
  );
}
