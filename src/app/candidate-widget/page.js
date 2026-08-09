'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import CandidateDetailModal from '../hr-panel/components/CandidateDetailModal';

export default function StandaloneCandidateWidgetPage() {
  const searchParams = useSearchParams();
  const candidateId = searchParams.get('candidate_id') || searchParams.get('id');
  const email = searchParams.get('email');

  const [candidateData, setCandidateData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function fetchExposedCandidateWidget() {
      setIsLoading(true);
      setErrorMsg('');
      try {
        let apiUrl = '/exposed-api?public_widget=true';
        if (candidateId) apiUrl += `&candidate_id=${encodeURIComponent(candidateId)}`;
        if (email) apiUrl += `&email=${encodeURIComponent(email)}`;

        const res = await fetch(apiUrl);
        const data = await res.json();

        if (data.success && data.candidateWidget) {
          setCandidateData(data.candidateWidget);
        } else if (data.error) {
          setErrorMsg(data.error);
        }
      } catch (err) {
        console.error('Error fetching exposed candidate widget data:', err);
        setErrorMsg('Failed to load candidate widget payload');
      } finally {
        setIsLoading(false);
      }
    }

    fetchExposedCandidateWidget();
  }, [candidateId, email]);

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      {isLoading ? (
        <div style={{ color: '#ffffff', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500" />
          Loading Exposed Candidate Widget Payload...
        </div>
      ) : errorMsg ? (
        <div style={{ color: '#ef4444', background: '#fef2f2', border: '1px solid #fecaca', padding: '16px 24px', borderRadius: '12px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 700 }}>Candidate Widget Error</h3>
          <p style={{ margin: 0, fontSize: '13px' }}>{errorMsg}</p>
        </div>
      ) : candidateData ? (
        <CandidateDetailModal
          selectedCandidate={candidateData}
          isOpen={true}
          onClose={() => {}}
          applicants={[candidateData]}
        />
      ) : (
        <div style={{ color: '#94a3b8', fontSize: '14px' }}>No candidate data available.</div>
      )}
    </div>
  );
}
