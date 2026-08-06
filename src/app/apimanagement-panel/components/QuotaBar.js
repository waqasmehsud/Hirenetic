'use client';

import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

export function getNextRefreshText(refreshCycle = 'Daily') {
  const now = new Date();

  if (refreshCycle === 'Monthly') {
    const nextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0));
    const diffMs = nextMonth.getTime() - now.getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `in ${days}d ${hours}h (1st UTC)`;
  }

  if (refreshCycle === 'Hourly') {
    const nextHour = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours() + 1, 0, 0));
    const diffMs = nextHour.getTime() - now.getTime();
    const minutes = Math.floor(diffMs / (1000 * 60));
    return `in ${minutes}m`;
  }

  // Default: Daily (Midnight 00:00 UTC)
  const tomorrowUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
  const diffMs = tomorrowUTC.getTime() - now.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  return `in ${hours}h ${minutes}m (00:00 UTC)`;
}

export function QuotaBar({ limit, used = 0, refreshCycle = 'Daily', isExceeded = false }) {
  const [refreshText, setRefreshText] = useState(() => getNextRefreshText(refreshCycle));

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshText(getNextRefreshText(refreshCycle));
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshCycle]);

  // Baseline limit defaults to 1500 if unconfigured
  const numericLimit = (limit && Number(limit) > 0) ? Number(limit) : 1500;
  const numericUsed = isExceeded ? numericLimit : Math.max(0, Number(used || 0));
  const percentage = isExceeded ? 100 : Math.min(Math.round((numericUsed / numericLimit) * 100), 100);

  let barColor = '#2563eb'; // Blue
  let bgBadge = '#eff6ff';
  let badgeText = `${percentage}%`;

  if (isExceeded || percentage >= 100) {
    barColor = '#ef4444'; // Red
    bgBadge = '#fef2f2';
    badgeText = '100% EXCEEDED';
  } else if (percentage >= 80) {
    barColor = '#f59e0b'; // Amber
    bgBadge = '#fffbeb';
  }

  return (
    <div style={{ minWidth: '170px', maxWidth: '240px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px', marginBottom: '5px' }}>
        <span style={{ fontWeight: 700, color: '#1e293b' }}>
          {numericUsed.toLocaleString()} <span style={{ color: '#94a3b8', fontWeight: 400 }}>/ {numericLimit.toLocaleString()}</span>
        </span>
        <span style={{ fontWeight: 700, color: barColor, backgroundColor: bgBadge, padding: '2px 6px', borderRadius: '4px', fontSize: '10px', letterSpacing: '0.2px' }}>
          {badgeText}
        </span>
      </div>

      {/* Progress Line Bar */}
      <div style={{
        width: '100%',
        height: '8px',
        backgroundColor: '#e2e8f0',
        borderRadius: '999px',
        overflow: 'hidden',
        border: '1px solid #cbd5e1',
        position: 'relative'
      }}>
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: barColor,
            borderRadius: '999px',
            transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: percentage > 0 ? `0 0 6px ${barColor}60` : 'none'
          }}
        />
      </div>

      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Clock size={11} style={{ color: '#94a3b8' }} />
        <span>Next refresh: <strong style={{ color: '#334155', fontWeight: 600 }}>{refreshText}</strong></span>
      </div>
    </div>
  );
}
