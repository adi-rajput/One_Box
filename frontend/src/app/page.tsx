'use client';

import React from 'react';
import { EmailDashboard } from '../components/EmailDashboard';

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <main role="main" aria-label="Email Dashboard">
        <EmailDashboard />
      </main>
    </div>
  );
}
