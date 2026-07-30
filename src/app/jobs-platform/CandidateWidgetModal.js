export default function CandidateWidgetModal({ candidate, result, cvUrl, onClose }) {
  if (!result) return null

  const initials = (candidate.full_name || '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const claimedNotMatched = result.ok
    ? result.claimedSkills.filter((s) => !result.matchedSkills.includes(s))
    : []

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.5)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        overflowY: 'auto',
        zIndex: 50,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: '1rem',
          maxWidth: 900,
          width: '100%',
          boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
            {result.ok && result.avatarUrl ? (
              <img src={result.avatarUrl} alt="" style={{ width: 48, height: 48, borderRadius: '50%' }} />
            ) : (
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                {initials}
              </div>
            )}
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#0f172a' }}>{candidate.full_name || 'Unnamed candidate'}</div>
              <div style={{ color: '#64748b', fontSize: '0.85rem' }}>{candidate.resume_field || 'Field not detected'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {result.ok && result.matchPercentage !== null && (
              <div style={{ textAlign: 'center', background: '#f0fdf4', border: '1px solid #dcfce7', borderRadius: '0.75rem', padding: '0.5rem 1rem' }}>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#16a34a' }}>{result.matchPercentage}%</div>
                <div style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 600 }}>GitHub Skill Match</div>
              </div>
            )}
            <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.4rem', color: '#94a3b8', cursor: 'pointer', lineHeight: 1 }}>
              ×
            </button>
          </div>
        </div>

        {!result.ok ? (
          <div style={{ padding: '2rem', color: '#dc2626' }}>⚠️ {result.error}</div>
        ) : (
          <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Row 1: Summary / Identity Verification */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div style={{ background: '#f8fafc', borderRadius: '0.75rem', padding: '1.25rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>
                  ACCOUNTS CONNECTED
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>GitHub</span>
                    <span style={{ color: '#16a34a', fontWeight: 600 }}>✓ Connected & verified</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>LinkedIn</span>
                    <span style={{ color: candidate.linkedin_url ? '#16a34a' : '#94a3b8', fontWeight: 600 }}>
                      {candidate.linkedin_url ? '✓ Provided' : 'Not provided'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Portfolio</span>
                    <span style={{ color: candidate.portfolio_url ? '#16a34a' : '#94a3b8', fontWeight: 600 }}>
                      {candidate.portfolio_url ? '✓ Provided' : 'Not provided'}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ background: '#f8fafc', borderRadius: '0.75rem', padding: '1.25rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>
                  GITHUB ACTIVITY
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Public repositories</span>
                    <strong>{result.publicRepos}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Followers</span>
                    <strong>{result.followers}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Total stars earned</span>
                    <strong>{result.totalStars}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Skills */}
            <div style={{ background: '#f8fafc', borderRadius: '0.75rem', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                TECHNICAL SKILLS — CV VS. VERIFIED GITHUB ACTIVITY
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: result.topLanguages.length ? '0.75rem' : 0 }}>
                {result.matchedSkills.map((skill) => (
                  <span key={skill} style={{ border: '1px solid #16a34a', color: '#16a34a', borderRadius: '999px', padding: '0.25rem 0.75rem', fontSize: '0.8rem', fontWeight: 600 }}>
                    ✓ {skill}
                  </span>
                ))}
                {claimedNotMatched.map((skill) => (
                  <span key={skill} style={{ border: '1px solid #ea580c', color: '#ea580c', borderRadius: '999px', padding: '0.25rem 0.75rem', fontSize: '0.8rem', fontWeight: 600 }}>
                    {skill} (claimed, not found on GitHub)
                  </span>
                ))}
                {result.claimedSkills.length === 0 && (
                  <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No specific tech skills detected in CV text to cross-check.</span>
                )}
              </div>
              {result.topLanguages.length > 0 && (
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Languages actually used on GitHub: {result.topLanguages.join(', ')}
                </div>
              )}
            </div>

            {/* Overall assessment */}
            <div style={{ background: '#eff6ff', border: '1px solid #dbeafe', borderRadius: '0.75rem', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#2563eb', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                SUMMARY
              </div>
              <p style={{ fontSize: '0.9rem', color: '#1e3a5f', lineHeight: 1.6, margin: 0 }}>
                {candidate.full_name || 'This candidate'} has {result.publicRepos} public GitHub repositories and{' '}
                {result.followers} followers.{' '}
                {result.matchPercentage !== null
                  ? `${result.matchedSkills.length} of ${result.claimedSkills.length} technical skills claimed in their CV were confirmed on GitHub (${result.matchPercentage}% match).`
                  : 'No specific technical skills were detected in their CV to cross-check against GitHub.'}{' '}
                {candidate.linkedin_url || candidate.portfolio_url
                  ? 'Additional links were provided but their content is not automatically analyzed.'
                  : 'No additional links (LinkedIn/portfolio) were provided.'}
              </p>
            </div>

            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center' }}>
              This check only uses accounts the candidate explicitly connected. No background checks, social media
              monitoring, or unverified data sources are used.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}