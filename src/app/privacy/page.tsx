export default function PrivacyPage() {
  return (
    <div style={{ 
      maxWidth: '720px', 
      margin: '0 auto', 
      padding: '4rem 1.5rem',
      color: 'var(--text-primary)'
    }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        Privacy Policy
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>
        Last updated: July 2026
      </p>
      
      {[
        {
          title: 'Information We Collect',
          content: 'We collect information you provide when creating an account (name, email via Clerk authentication) and information about your usage of the platform (problems solved, plans created, progress data).'
        },
        {
          title: 'How We Use Your Information',
          content: 'We use your information solely to provide and improve the AlgoPath service — generating your personalized roadmap, tracking your progress, and scheduling revisions. We do not sell your data to third parties.'
        },
        {
          title: 'Data Storage',
          content: 'Your data is stored securely in PostgreSQL databases hosted on Neon. Authentication is handled by Clerk. We use industry-standard security practices including encrypted connections and parameterized queries.'
        },
        {
          title: 'Cookies',
          content: 'We use essential cookies for authentication and session management. We do not use tracking or advertising cookies.'
        },
        {
          title: 'Third-Party Services',
          content: 'We use Clerk for authentication, Neon for database hosting, Upstash Redis for rate limiting, and Vercel for deployment. Each service has its own privacy policy.'
        },
        {
          title: 'Your Rights',
          content: 'You can delete your account and all associated data at any time from your profile settings. You can contact us to request a copy of your data.'
        },
        {
          title: 'Contact',
          content: 'For privacy-related questions, contact us at: hello@algopath.dev'
        },
      ].map((section) => (
        <div key={section.title} style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ 
            fontSize: '1.1rem', 
            fontWeight: 600, 
            marginBottom: '0.5rem',
            color: 'var(--text-primary)'
          }}>
            {section.title}
          </h2>
          <p style={{ 
            color: 'var(--text-secondary)', 
            lineHeight: 1.7,
            fontSize: '0.9rem'
          }}>
            {section.content}
          </p>
        </div>
      ))}
    </div>
  );
}
