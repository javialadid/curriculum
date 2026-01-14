export function PrivacyContent() {
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      <h1>Privacy Policy</h1>

      <p className="text-muted-foreground mb-8">
        Last Updated: November 24, 2025
      </p>

      <p>
        This privacy policy describes how this personal portfolio website collects, uses, and protects information when you visit our website.
      </p>

      <h2>Information We Collect</h2>

      <h3>Analytics (Optional)</h3>
      <p>
        If you consent to cookies, we use Google Analytics 4 for insights about visitor interactions:
      </p>
      <ul>
        <li>User journey and behavior patterns</li>
        <li>Interaction events (chatbot usage, theme changes)</li>
        <li>Conversion tracking and detailed demographics</li>
        <li>Cross-session user behavior analysis</li>
      </ul>
      <p>
        Analytics only activates with your explicit consent and can be disabled at any time.
      </p>

      <h3>Chatbot Interactions</h3>
      <p>
        When you use the AI chatbot feature:
      </p>
      <ul>
        <li>Your messages are processed by our AI service provider (Groq) to generate responses</li>
        <li>Conversations are not stored or logged on our servers</li>
        <li>We share professional resume information with the AI to provide contextually relevant answers</li>
        <li>Personal identifiers (name, photo, contact information) are filtered out before sharing with the AI</li>
      </ul>

      <h2>How We Use Information</h2>

      <h3>Analytics Data</h3>
      <p>
        Anonymous usage data helps us understand how visitors interact with the portfolio and improve the user experience.
      </p>

      <h3>Chatbot Data</h3>
      <p>
        User messages and resume context are temporarily processed by our AI service provider to generate helpful responses about professional background and experience.
      </p>

      <h2>Data Sharing and Third Parties</h2>

      <h3>AI Service Provider (Groq)</h3>
      <ul>
        <li>User messages are sent to Groq&apos;s API for processing</li>
        <li>Groq&apos;s privacy policy: <a href="https://groq.com/privacy-policy/" target="_blank" rel="noopener noreferrer">https://groq.com/privacy-policy/</a></li>
        <li>Data is processed temporarily and not stored by Groq for our purposes</li>
      </ul>

      <h3>Database Provider (Supabase)</h3>
      <ul>
        <li>Resume and chatbot configuration data is stored securely</li>
        <li>Supabase&apos;s privacy policy: <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">https://supabase.com/privacy</a></li>
        <li>Row Level Security ensures data privacy</li>
      </ul>

      <h3>Analytics Provider (Google Analytics)</h3>
      <ul>
        <li>Only used with explicit user consent</li>
        <li>Google&apos;s privacy policy: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">https://policies.google.com/privacy</a></li>
      </ul>

      <h2>Cookies</h2>

      <h3>Cookies for Analytics</h3>
      <p>
        We only use cookies if you explicitly consent to analytics:
      </p>
      <ul>
        <li>Google Analytics cookies for detailed usage statistics</li>
        <li>Cookies enable cross-session tracking and user behavior analysis</li>
        <li>All cookies are strictly for analytics purposes</li>
      </ul>
      <p>
        If you decline analytics, we may ask again on your next visit to give you the opportunity to change your mind. You can always dismiss the banner if you prefer to keep your current choice.
      </p>

      <h2>Data Security</h2>
      <ul>
        <li>All data transmission uses HTTPS encryption</li>
        <li>No personal data is stored permanently</li>
        <li>Chatbot conversations are ephemeral (not saved)</li>
        <li>Server access is logged for security purposes only</li>
      </ul>

      <h2>Your Rights</h2>
      <p>
        Since we collect minimal data and no personal information:
      </p>
      <ul>
        <li>You can withdraw consent for analytics at any time</li>
        <li>No personal data means no right to access/delete requests needed</li>
        <li>Contact information is not collected</li>
      </ul>

      <h2>Data Retention</h2>
      <ul>
        <li>Chatbot conversations: Not retained (processed in real-time only)</li>
        <li>Analytics data: Retained according to Google Analytics policies</li>
        <li>Resume data: Stored indefinitely for portfolio purposes</li>
      </ul>

      <h2>International Data Transfers</h2>
      <p>
        Data may be processed by:
      </p>
      <ul>
        <li>Supabase (global CDN)</li>
        <li>Groq (US-based service)</li>
        <li>Google Analytics (global service)</li>
      </ul>

      <h2>Changes to This Policy</h2>
      <p>
        This policy may be updated as features change. Significant changes will be clearly communicated.
      </p>

      <h2>Contact</h2>
      <p>
        This is a personal portfolio website. For privacy concerns, please review the code at: [GitHub Repository URL]
      </p>

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Compliance Notes</h3>
        <ul className="text-sm space-y-1">
          <li>✅ This website is designed with privacy by default</li>
          <li>✅ No cookies are used without explicit consent</li>
          <li>✅ Personal data collection is minimized</li>
          <li>✅ Analytics are completely optional</li>
        </ul>
      </div>
    </div>
  )
}
