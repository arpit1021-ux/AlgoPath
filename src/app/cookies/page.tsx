export default function CookiesPage() {
  return (
    <div style={{ 
      maxWidth: '720px', 
      margin: '0 auto', 
      padding: '4rem 1.5rem',
    }}>
      <h1 style={{ 
        fontSize: '2rem', 
        fontWeight: 700, 
        marginBottom: '0.5rem',
        color: 'var(--text-primary)'
      }}>
        Cookie Policy
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>
        Last updated: July 2026
      </p>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.9rem' }}>
        AlgoPath uses only essential cookies required for authentication and 
        session management via Clerk. We store your theme preference 
        (dark/light) in localStorage. We do not use advertising, tracking, 
        or analytics cookies. You can clear cookies at any time through your 
        browser settings, though this will log you out of the platform.
      </p>
    </div>
  );
}
