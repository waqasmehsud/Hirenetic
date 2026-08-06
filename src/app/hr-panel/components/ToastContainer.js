'use client';

import React from 'react';
import { CheckCircle } from 'lucide-react';

export default function ToastContainer({ toasts }) {
  return (
    <div id="toast-container">
      {toasts.map(t => (
        <div className="toast" key={t.id}>
          <CheckCircle size={16} style={{ color: '#10b981' }} />
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
