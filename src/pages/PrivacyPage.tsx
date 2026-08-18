import { Link } from 'react-router-dom'

export default function PrivacyPage() {
  return (
    <main style={{ backgroundColor: '#f0ede0', minHeight: '100vh' }}>
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: '64px',
        padding: '0 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f0ede0',
        borderBottom: '1px solid rgba(0,0,0,0.1)',
      }}>
        <Link to="/" style={{
          fontFamily: '"Trajan Pro Regular", serif',
          fontSize: '16px',
          letterSpacing: '0.2em',
          color: '#333',
          fontWeight: 400,
          textDecoration: 'none',
        }}>
          PLAYA
        </Link>
      </nav>

      <section style={{
        padding: '100px 40px',
        marginTop: '64px',
        maxWidth: '800px',
        margin: '64px auto 0',
      }}>
        <h1 style={{
          fontFamily: '"Trajan Pro Regular", serif',
          fontSize: '40px',
          color: '#333',
          marginBottom: '40px',
          fontWeight: 400,
        }}>
          Privacy Policy
        </h1>
        <p style={{
          fontFamily: '"Pretendard Regular", Pretendard, sans-serif',
          fontSize: '15px',
          lineHeight: '21px',
          color: '#333',
          marginBottom: '20px',
        }}>
          This is a placeholder privacy policy page. Please contact us at info@theplaya.com for more information about our privacy practices.
        </p>
        <p style={{
          fontFamily: '"Pretendard Regular", Pretendard, sans-serif',
          fontSize: '15px',
          lineHeight: '21px',
          color: '#333',
          marginBottom: '40px',
        }}>
          At PLAYA, we are committed to protecting your personal information and your right to privacy.
        </p>
        <Link to="/" style={{
          fontFamily: 'Roboto, sans-serif',
          fontSize: '11px',
          letterSpacing: '0.15em',
          color: '#333',
          textDecoration: 'none',
          borderBottom: '1px solid #333',
          paddingBottom: '4px',
          display: 'inline-block',
          textTransform: 'uppercase',
        }}>
          ← Back to Home
        </Link>
      </section>
    </main>
  )
}
