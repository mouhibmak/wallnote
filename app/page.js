'use client';

import { useEffect, useMemo, useState } from 'react';

const THEMES = [
  { name: 'Light', bg: '#ffffff', card: '#f9fafb', text: '#111827', muted: '#6b7280', accent: '#f59e0b', border: '#e5e7eb' },
  { name: 'Dark', bg: '#0f172a', card: '#1e293b', text: '#f1f5f9', muted: '#94a3b8', accent: '#fbbf24', border: '#334155' },
  { name: 'Warm', bg: '#fffbeb', card: '#ffffff', text: '#451a03', muted: '#92400e', accent: '#ea580c', border: '#fde68a' },
  { name: 'Ocean', bg: '#f0f9ff', card: '#ffffff', text: '#0c4a6e', muted: '#0369a1', accent: '#0284c7', border: '#bae6fd' },
  { name: 'Forest', bg: '#052e16', card: '#14532d', text: '#f0fdf4', muted: '#86efac', accent: '#4ade80', border: '#166534' },
];

// Obviously fictional people. Labelled SAMPLE everywhere they appear —
// these are placeholder demo data, never presented as real customers.
const SAMPLE = [
  { name: 'Sam Sample', role: 'Fictional Customer, Example Co.', quote: 'This is a sample testimonial. Replace it with a real quote from one of your own customers.', stars: 5 },
  { name: 'Pat Placeholder', role: 'Made-Up User, Demo Ltd.', quote: 'Sample text only — Wallnote ships with no real testimonials. Add your own below and the wall updates live.', stars: 5 },
  { name: 'Dana Demo', role: 'Imaginary Client, Testville Inc.', quote: 'A third sample card so you can see how a three-column wall looks. Delete all samples to start from an empty wall.', stars: 4 },
];

const STORAGE_KEY = 'wallnote-v01-testimonials';

// FAQ — rendered visibly below and as JSON-LD FAQPage schema. Demo data
// stays labelled SAMPLE; nothing here claims real customers.
const FAQ_ITEMS = [
  {
    q: 'Is Wallnote really free?',
    a: 'Yes. Adding testimonials, previewing the wall, all five themes, the embed snippet and the JSON export are free. No sign-up and no backend.',
  },
  {
    q: 'Where are my testimonials stored?',
    a: 'Only in your own browser (localStorage). Nothing is uploaded anywhere. Use the Export as JSON button to keep a backup, or the embed snippet to put the wall on your site.',
  },
  {
    q: 'How do I put the wall on my website?',
    a: 'Copy the embed snippet from the panel below and paste it where the wall should appear on your site. It is a static snapshot: after you edit the wall here, re-paste the snippet to update your site.',
  },
  {
    q: 'Are the demo testimonials real?',
    a: 'No. The three demo cards are fictional people, labelled SAMPLE everywhere they appear. Delete them and add quotes from your own real customers, with their permission.',
  },
  {
    q: 'Can I export my wall?',
    a: 'Yes — the Export wall as JSON button downloads your testimonials as a JSON file you can back up or reuse elsewhere.',
  },
  {
    q: 'How do I collect testimonials from my customers?',
    a: 'Share your free collection form at /collect. Your customer fills it in (name, role, rating, testimonial) and it generates a JSON snippet they send to you. Paste that JSON into the Import JSON box on the wall builder and it is added to your wall. Nothing is stored on a server — the form has no backend.',
  },
  {
    q: 'How does Import JSON work?',
    a: 'Paste one testimonial object (or a list of them) in JSON — each with a name, a quote, and optionally a role and a star rating from 1 to 5 — and click "Add to wall". Invalid JSON or entries missing a name or quote are rejected with an error message, and nothing is added.',
  },
  {
    q: 'How do I ask a customer for a testimonial?',
    a: 'Send them the link to the /collect page, by email or message. They fill in the form (name, role, rating, testimonial) and it generates a JSON snippet they send back to you. Paste it into the Import JSON box above and it is added to your wall.',
  },
  {
    q: 'Can I collect testimonials from more than one customer?',
    a: 'Yes — share the /collect link with as many customers as you like. Each person generates their own JSON snippet; paste each one into the Import JSON box and they are all added to your wall. Nothing is stored on a server at any point.',
  },
];

function stars(n) {
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Builds a self-contained, static embed snippet: a <div> plus a small inline
// script that renders the wall from the JSON config. No server call, no
// tracking — the wall is a snapshot; re-paste the snippet after edits.
function buildSnippet(testimonials, theme) {
  const data = JSON.stringify(testimonials).replace(/<\//g, '<\\/');
  const t = JSON.stringify(theme).replace(/<\//g, '<\\/');
  const lines = [
    '<!-- Wallnote testimonial wall — free, no sign-up -->',
    '<div id="wallnote-wall"></div>',
    '<script>',
    '(function(){',
    'var T=' + data + ';',
    'var H=' + t + ';',
    'function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}',
    'function card(x){',
    'var st="";for(var i=0;i<5;i++){st+=i<x.stars?"★":"☆";}',
    'return "<div style=\\"background:"+H.card+";border:1px solid "+H.border+";border-radius:12px;padding:20px\\">"',
    '+"<div style=\\"color:"+H.accent+";font-size:18px;letter-spacing:2px\\">"+st+"</div>"',
    '+"<p style=\\"color:"+H.text+";font-size:16px;line-height:1.5;margin:12px 0\\">&ldquo;"+esc(x.quote)+"&rdquo;</p>"',
    '+"<div style=\\"color:"+H.text+";font-weight:700;font-size:14px\\">"+esc(x.name)+"</div>"',
    '+"<div style=\\"color:"+H.muted+";font-size:13px\\">"+esc(x.role)+"</div></div>";}',
    'var html="<div style=\\"display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px;background:"+H.bg+";padding:8px;font-family:sans-serif\\">";',
    'for(var j=0;j<T.length;j++){html+=card(T[j]);}',
    'html+="</div><p style=\\"text-align:center;font-size:12px;font-family:sans-serif;margin:12px 0 0\\"><a href=\\"https://wallnote.example\\" style=\\"color:#9ca3af;text-decoration:none\\">Powered by Wallnote</a></p>";',
    'document.getElementById("wallnote-wall").innerHTML=html;',
    '})();',
    '</' + 'script>',
  ];
  return lines.join('\n');
}

export default function Home() {
  const [items, setItems] = useState(SAMPLE);
  const [loaded, setLoaded] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [quote, setQuote] = useState('');
  const [starCount, setStarCount] = useState(5);
  const [theme, setTheme] = useState(THEMES[0]);
  const [copied, setCopied] = useState(false);
  const [isSample, setIsSample] = useState(true);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed);
          setIsSample(false);
        }
      }
    } catch {
      // Corrupt storage: keep the sample wall.
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage full or unavailable: the wall still works in memory.
    }
  }, [items, loaded]);

  const snippet = useMemo(() => buildSnippet(items, theme), [items, theme]);

  function addTestimonial(e) {
    e.preventDefault();
    if (!name.trim() || !quote.trim()) return;
    setItems([...items, { name: name.trim(), role: role.trim() || 'Customer', quote: quote.trim(), stars: starCount }]);
    setIsSample(false);
    setName('');
    setRole('');
    setQuote('');
    setStarCount(5);
  }

  function removeAt(i) {
    setItems(items.filter((_, idx) => idx !== i));
  }

  function loadSample() {
    setItems(SAMPLE);
    setIsSample(true);
  }

  function clearAll() {
    setItems([]);
    setIsSample(false);
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

  function exportJson() {
    try {
      const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'wallnote-testimonials.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      // Download failed: the wall is still visible and copyable above.
    }
  }

  // Import JSON: paste one testimonial object (or a list of them) generated
  // by the /collect form — or exported from another wall — and append the
  // valid entries to the wall. Nothing is uploaded; validation is local.
  function importJson() {
    setImportError('');
    let parsed;
    try {
      parsed = JSON.parse(importText);
    } catch {
      setImportError('That is not valid JSON. Copy the snippet exactly as the collection form generated it and try again.');
      return;
    }
    const list = Array.isArray(parsed) ? parsed : [parsed];
    const valid = [];
    for (const t of list) {
      if (!t || typeof t !== 'object') continue;
      const name = typeof t.name === 'string' ? t.name.trim() : '';
      const quote = typeof t.quote === 'string' ? t.quote.trim() : '';
      if (!name || !quote) continue;
      const starsNum = Number(t.stars);
      valid.push({
        name: name.slice(0, 80),
        role: typeof t.role === 'string' && t.role.trim() ? t.role.trim().slice(0, 100) : 'Customer',
        quote: quote.slice(0, 500),
        stars: starsNum >= 1 && starsNum <= 5 ? Math.round(starsNum) : 5,
      });
    }
    if (valid.length === 0) {
      setImportError('No valid testimonials found. Each one needs at least a name and a quote — for example: {"name": "Jane Doe", "role": "Founder, Acme", "quote": "Great work!", "stars": 5}.');
      return;
    }
    setItems([...items, ...valid]);
    setIsSample(false);
    setImportText('');
    setImportError(
      valid.length === 1
        ? 'Added 1 testimonial to your wall.'
        : `Added ${valid.length} testimonials to your wall.`
    );
  }

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((i) => ({
      '@type': 'Question',
      name: i.q,
      acceptedAnswer: { '@type': 'Answer', text: i.a },
    })),
  };

  return (
    <main style={styles.main}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <h1 style={styles.h1}>Wallnote</h1>
      <p style={styles.tag}>
        Free testimonial wall builder. Paste your own testimonials, preview the
        wall live, copy one embed snippet onto your site. No sign-up, no backend.
        Collecting quotes from customers?{' '}
        <a href="/collect" style={styles.link}>Share your free collection form →</a>
      </p>

      <div style={styles.grid}>
        <div style={styles.panel}>
          <div style={styles.label}>Add a testimonial</div>
          <form onSubmit={addTestimonial} style={styles.form}>
            <input style={styles.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Name — e.g. Jane Doe" maxLength={80} />
            <input style={styles.input} value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role / company — e.g. Founder, Acme" maxLength={100} />
            <textarea style={{ ...styles.input, minHeight: 80, resize: 'vertical' }} value={quote} onChange={(e) => setQuote(e.target.value)} placeholder="What did they say about you?" maxLength={500} />
            <label style={styles.label}>
              Stars
              <select style={styles.input} value={starCount} onChange={(e) => setStarCount(Number(e.target.value))}>
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>{`${n} — ${stars(n)}`}</option>
                ))}
              </select>
            </label>
            <button type="submit" style={styles.button} disabled={!name.trim() || !quote.trim()}>
              Add to wall
            </button>
          </form>
          <div style={styles.row}>
            <button onClick={loadSample} style={styles.smallButton}>Load sample wall</button>
            <button onClick={clearAll} style={styles.smallButton}>Clear wall</button>
          </div>
          <p style={styles.note}>
            Your wall is saved in this browser only (localStorage). Nothing is
            uploaded anywhere. Only add testimonials from real customers, with
            their permission.
          </p>
        </div>

        <div style={styles.panel}>
          <div style={styles.label}>Live preview</div>
          <div style={styles.label}>Theme</div>
          <div style={styles.presets}>
            {THEMES.map((t) => (
              <button
                key={t.name}
                onClick={() => setTheme(t)}
                style={{
                  ...styles.preset,
                  background: t.bg,
                  color: t.text,
                  border: theme.name === t.name ? `3px solid ${t.accent}` : '3px solid transparent',
                }}
              >
                {t.name}
              </button>
            ))}
          </div>
          {isSample && (
            <p style={styles.sampleBanner}>
              SAMPLE DATA — these three people are fictional. Add your own
              testimonials to replace them.
            </p>
          )}
          {items.length === 0 ? (
            <p style={styles.note}>Your wall is empty. Add a testimonial on the left, or load the sample wall.</p>
          ) : (
            <div style={{ ...styles.wall, background: theme.bg }}>
              {items.map((t, i) => (
                <div key={i} style={{ ...styles.card, background: theme.card, borderColor: theme.border }}>
                  <div style={{ color: theme.accent, fontSize: 18, letterSpacing: 2 }}>{stars(t.stars)}</div>
                  <p style={{ ...styles.quote, color: theme.text }}>&ldquo;{t.quote}&rdquo;</p>
                  <div style={{ color: theme.text, fontWeight: 700, fontSize: 14 }}>{t.name}</div>
                  <div style={{ color: theme.muted, fontSize: 13 }}>{t.role}</div>
                  {isSample && <div style={styles.sampleTag}>SAMPLE</div>}
                  <button onClick={() => removeAt(i)} style={styles.remove} title="Remove this testimonial">× Remove</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={styles.panel}>
        <div style={styles.label}>Embed snippet — paste this where the wall should appear on your site</div>
        <pre style={styles.code}>{snippet}</pre>
        <button onClick={copySnippet} style={styles.button}>
          {copied ? 'Copied!' : 'Copy embed snippet'}
        </button>
        <button onClick={exportJson} style={styles.button}>
          Export wall as JSON
        </button>
        <p style={styles.note}>
          Static snapshot: the snippet carries your testimonials inside it, so it
          works with no server and no tracking. Edit the wall here and re-paste
          the snippet to update your site. The small &ldquo;Powered by
          Wallnote&rdquo; link keeps the free tier free.
        </p>
      </div>

      <div style={styles.panel}>
        <div style={styles.label}>Import JSON — add testimonials from the collection form</div>
        <textarea
          style={{ ...styles.input, minHeight: 90, resize: 'vertical' }}
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder='Paste testimonial JSON here — e.g. {"name": "Jane Doe", "role": "Founder, Acme", "quote": "Great work!", "stars": 5}'
        />
        <button onClick={importJson} style={styles.button} disabled={!importText.trim()}>
          Add to wall
        </button>
        {importError && <p style={{ ...styles.note, color: importError.startsWith('Added') ? '#15803d' : '#dc2626' }}>{importError}</p>}
        <p style={styles.note}>
          Your customers generate this JSON on the{' '}
          <a href="/collect" style={styles.link}>collection form (/collect)</a> and
          send it to you. Paste one testimonial, or a list of them. Entries need
          at least a name and a quote; anything invalid is skipped with an error
          message and nothing is added.
        </p>
      </div>

      <section style={styles.faqSection}>
        <h2 style={styles.faqH2}>Frequently asked questions</h2>
        {FAQ_ITEMS.map((i) => (
          <div key={i.q} style={{ marginBottom: 16 }}>
            <h3 style={styles.faqH3}>{i.q}</h3>
            <p style={styles.faqP}>{i.a}</p>
          </div>
        ))}
      </section>

      <footer style={styles.footer}>
        Wallnote v0.3 — free wall builder + testimonial collection forms.
        Hosted collection, auto-updating embeds and video testimonials coming
        later. Demo data is fictional and labelled SAMPLE.
      </footer>
    </main>
  );
}

const styles = {
  main: { maxWidth: 1020, margin: '0 auto', padding: '48px 20px', fontFamily: 'sans-serif', color: '#111827' },
  h1: { fontSize: 48, margin: '0 0 8px' },
  tag: { fontSize: 19, color: '#4b5563', margin: '0 0 32px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 },
  panel: { border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column', gap: 14, background: '#fff' },
  label: { fontSize: 14, fontWeight: 700, display: 'flex', flexDirection: 'column', gap: 6 },
  form: { display: 'flex', flexDirection: 'column', gap: 10 },
  input: { fontSize: 16, padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontFamily: 'sans-serif' },
  presets: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  preset: { padding: '8px 14px', borderRadius: 999, cursor: 'pointer', fontSize: 14, fontWeight: 700 },
  button: { display: 'inline-block', textAlign: 'center', background: '#111827', color: '#fff', padding: '14px 18px', borderRadius: 10, textDecoration: 'none', fontWeight: 700, marginTop: 8, cursor: 'pointer', border: 'none', fontSize: 16 },
  smallButton: { padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700 },
  row: { display: 'flex', gap: 8 },
  note: { fontSize: 13, color: '#6b7280', margin: 0 },
  wall: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, padding: 12, borderRadius: 8 },
  card: { border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 6 },
  quote: { fontSize: 15, lineHeight: 1.5, margin: '8px 0' },
  sampleBanner: { fontSize: 13, fontWeight: 700, color: '#92400e', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 12px', margin: 0 },
  sampleTag: { fontSize: 11, fontWeight: 700, color: '#92400e', background: '#fef3c7', borderRadius: 4, padding: '2px 6px', alignSelf: 'flex-start', marginTop: 6 },
  remove: { background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: 12, padding: 0, alignSelf: 'flex-start', marginTop: 8 },
  link: { color: '#2563eb' },
  code: { fontSize: 12, background: '#f3f4f6', padding: 12, borderRadius: 6, whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxHeight: 320, overflow: 'auto', margin: 0 },
  faqSection: { marginTop: 40 },
  faqH2: { fontSize: 22, margin: '0 0 16px' },
  faqH3: { fontSize: 16, margin: '0 0 4px' },
  faqP: { fontSize: 15, lineHeight: 1.6, color: '#374151', margin: 0 },
  footer: { marginTop: 40, fontSize: 13, color: '#9ca3af' },
};
