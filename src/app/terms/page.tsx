export default function TermsPage() {
  return (
    <div style={{ 
      maxWidth: '720px', 
      margin: '0 auto', 
      padding: '4rem 1.5rem',
      color: 'var(--text-primary)'
    }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        Terms of Service
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>
        Last updated: July 2026
      </p>

      {[
        {
          title: 'Acceptance of Terms',
          content: 'By using AlgoPath, you agree to these terms. If you do not agree, please do not use the service.'
        },
        {
          title: 'Description of Service',
          content: 'AlgoPath provides a personalized DSA preparation platform including roadmap generation, progress tracking, and spaced repetition revision scheduling. The service is provided free of charge during beta.'
        },
        {
          title: 'User Accounts',
          content: 'You are responsible for maintaining the security of your account. You must provide accurate information when creating your account. One account per person.'
        },
        {
          title: 'Acceptable Use',
          content: 'You may not use AlgoPath to scrape data, reverse engineer the platform, attempt to access other users data, or use automated tools to abuse the service. Violation may result in account termination.'
        },
        {
          title: 'Intellectual Property',
          content: 'The AlgoPath platform, including its algorithm and UI, is owned by its creator. Problem data references LeetCode problems which are owned by LeetCode. AlgoPath is not affiliated with or endorsed by LeetCode.'
        },
        {
          title: 'Disclaimer',
          content: 'AlgoPath is provided as-is without warranty. We do not guarantee that using this platform will result in passing interviews or securing employment. Results depend on individual effort and preparation.'
        },
        {
          title: 'Limitation of Liability',
          content: 'AlgoPath is not liable for any damages arising from use of the service, loss of data, or inability to access the platform.'
        },
        {
          title: 'Changes to Terms',
          content: 'We may update these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.'
        },
        {
          title: 'Contact',
          content: 'For questions about these terms: hello@algopath.dev'
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
