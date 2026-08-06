import './candidate-panel.css'

export const metadata = {
  title: 'Candidate Panel | Vantage Point',
  description: 'AI-Powered Candidate Career Portal',
}

export default function CandidatePanelLayout({ children }) {
  return (
    <div className="candidate-panel-root">
      {children}
    </div>
  )
}
