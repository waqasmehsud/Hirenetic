export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Welcome to Hirenetic</h1>
      <p style={{ color: '#888', fontSize: '1.1rem' }}>Simple clean Next.js application setup.</p>
    </main>
  );
}
