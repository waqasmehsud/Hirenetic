'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import CandidateDetailModal from '../../hr-panel/components/CandidateDetailModal';

export const dynamic = 'force-dynamic';

function EmbedCandidateWidgetContent() {
  const searchParams = useSearchParams();
  const candidateId = searchParams.get('candidate_id') || searchParams.get('id');
  const email = searchParams.get('email');

  const [candidateData, setCandidateData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function fetchExposedWidgetPayload() {
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
        console.error('Error loading embeddable candidate widget payload:', err);
        setErrorMsg('Failed to load candidate widget');
      } finally {
        setIsLoading(false);
      }
    }

    fetchExposedWidgetPayload();
  }, [candidateId, email]);

  return (
    <div style={{ width: '100%', height: '100vh', background: '#ffffff', overflow: 'auto', position: 'relative' }}>
      {isLoading ? (
        <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', color: '#0f172a', fontSize: '14px', fontWeight: 600, fontFamily: 'sans-serif', gap: '10px' }}>
          Loading Candidate Verified Profile...
        </div>
      ) : errorMsg ? (
        <div style={{ padding: '32px', textAlign: 'center', fontFamily: 'sans-serif', color: '#ef4444' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 8px' }}>Candidate Profile Error</h3>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>{errorMsg}</p>
        </div>
      ) : candidateData ? (
        <CandidateDetailModal
          selectedCandidate={candidateData}
          isOpen={true}
          onClose={() => {
            if (window.parent && window.parent !== window) {
              window.parent.postMessage({ type: 'HIRENETIC_WIDGET_CLOSE' }, '*');
            }
          }}
          applicants={[candidateData]}
        />
      ) : (
        <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>No candidate data available.</div>
      )}
    </div>
  );
}

export default function EmbedCandidateWidgetPage() {
  return (
    <Suspense fallback={<div style={{ width: '100%', height: '100vh', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
      <EmbedCandidateWidgetContent />
    </Suspense>
  );
}
