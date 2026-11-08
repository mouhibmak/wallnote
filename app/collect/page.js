'use client';

import { useState } from 'react';
import Link from 'next/link';

function stars(n) {
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}

const COLLECT_FAQ = [
  {
    q: 'Where does my testimonial go when I submit this form?',
    a: 'Nowhere — this page has no backend and stores nothing. After you submit, it generates a JSON snippet for your testimonial. Copy it and send it to the person who asked for it; they paste it into the wall builder with the Import JSON button.',
  },
  {
    q: 'Is anything I type here uploaded or tracked?',
    a: 'No. Everything happens in your browser. Nothing is sent to any server, and closing the page discards what you typed.',
  },
  {
    q: 'Can I edit my testimonial after generating the JSON?',
    a: 'Yes. Change any field above and submit again — the JSON snippet updates to match. The person adding it to the wall can also edit it there before publishing.',
  },
  {
    q: 'Do I need an account to share my testimonial?',
    a: 'No. The form is free and needs no account or email. Your name, role and testimonial are only used to build the JSON snippet in your browser.',
  },
];

export default function Collect() {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [quote, setQuote] = useState('');
  const [starCount, setStarCount] = useState(5);
  const [snippet, setSnippet] = useState('');
  const [copied, setCopied] = useState(false);

  function generate(e) {
    e.preventDefault();
    if (!name.trim() || !quote.trim()) return;
    const obj = {
      name: name.trim(),
      role: role.trim() || 'Customer',
      quote: quote.trim(),
      stars: starCount,
    };
    setSnippet(JSON.stringify(obj, null, 2));
    setCopied(false);
  }

  async function copySnippet() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: COLLECT_FAQ.map((i) => ({
      '@type': 'Question',
      name: i.q,
      acceptedAnswer: { '@type': 'Answer', text: i.a },
    })),
  };

  return (
    <main style={styles.main}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Link href="/" style={styles.back}>← Wallnote</Link>
      <h1 style={styles.h1}>Share your testimonial</h1>
      <p style={styles.tag}>
        Someone asked you for a testimonial? Fill in this form and it turns
        your words into a JSON snippet you can send them — they paste it into
        the Wallnote builder and your quote appears on their wall. No account,
        nothing is uploaded anywhere.
      </p>

      <div style={styles.panel}>
        <form onSubmit={generate} style={styles.form}>
          <input style={styles.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name — e.g. Jane Doe" maxLength={80} />
          <input style={styles.input} value={role} onChange={(e) => setRole(e.target.value)} placeholder="Your role / company — e.g. Founder, Acme" maxLength={100} />
          <textarea style={{ ...styles.input, minHeight: 100, resize: 'vertical' }} value={quote} onChange={(e) => setQuote(e.target.value)} placeholder="What would you like to say about their work?" maxLength={500} />
          <label style={styles.label}>
            Rating
            <select style={styles.input} value={starCount} onChange={(e) => setStarCount(Number(e.target.value))}>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>{`${n} — ${stars(n)}`}</option>
              ))}
            </select>
          </label>
          <button type="submit" style={styles.button} disabled={!name.trim() || !quote.trim()}>
            Generate my testimonial JSON
          </button>
        </form>
        <p style={styles.note}>
          Only share words you genuinely mean, and only about a product or
          service you actually used.
        </p>
      </div>

      {snippet && (
        <div style={styles.panel}>
          <div style={styles.label}>Your testimonial as JSON — copy it and send it to the site owner</div>
          <pre style={styles.code}>{snippet}</pre>
          <button onClick={copySnippet} style={styles.button}>
            {copied ? 'Copied!' : 'Copy JSON'}
          </button>
          <p style={styles.note}>
            Next step for the site owner: open the{' '}
            <Link href="/" style={styles.link}>Wallnote builder</Link>, paste this
            JSON into the &ldquo;Import JSON&rdquo; box, and click &ldquo;Add to
            wall&rdquo;. Your testimonial is added to their wall — still only in
            their browser, nothing uploaded.
          </p>
        </div>
      )}

      <section style={styles.faqSection}>
        <h2 style={styles.faqH2}>Frequently asked questions</h2>
        {COLLECT_FAQ.map((i) => (
          <div key={i.q} style={{ marginBottom: 16 }}>
            <h3 style={styles.faqH3}>{i.q}</h3>
            <p style={styles.faqP}>{i.a}</p>
          </div>
        ))}
      </section>

      <footer style={styles.footer}>
        Wallnote — free testimonial collection form. No sign-up, no backend,
        nothing stored.
      </footer>
    </main>
  );
}

const styles = {
  main: { maxWidth: 760, margin: '0 auto', padding: '48px 20px', fontFamily: 'sans-serif', color: '#111827' },
  back: { fontSize: 14, color: '#2563eb', textDecoration: 'none' },
  h1: { fontSize: 32, margin: '12px 0 8px', lineHeight: 1.2 },
  tag: { fontSize: 16, color: '#4b5563', margin: '0 0 24px', lineHeight: 1.6 },
  panel: { border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column', gap: 14, background: '#fff', marginBottom: 24 },
  label: { fontSize: 14, fontWeight: 700, display: 'flex', flexDirection: 'column', gap: 6 },
  form: { display: 'flex', flexDirection: 'column', gap: 10 },
  input: { fontSize: 16, padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontFamily: 'sans-serif' },
  button: { display: 'inline-block', textAlign: 'center', background: '#111827', color: '#fff', padding: '14px 18px', borderRadius: 10, textDecoration: 'none', fontWeight: 700, marginTop: 8, cursor: 'pointer', border: 'none', fontSize: 16 },
  note: { fontSize: 13, color: '#6b7280', margin: 0 },
  code: { fontSize: 13, background: '#f3f4f6', padding: 12, borderRadius: 6, whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxHeight: 320, overflow: 'auto', margin: 0 },
  link: { color: '#2563eb' },
  faqSection: { marginTop: 40 },
  faqH2: { fontSize: 22, margin: '0 0 16px' },
  faqH3: { fontSize: 16, margin: '0 0 4px' },
  faqP: { fontSize: 15, lineHeight: 1.6, color: '#374151', margin: 0 },
  footer: { marginTop: 40, fontSize: 13, color: '#9ca3af' },
};
