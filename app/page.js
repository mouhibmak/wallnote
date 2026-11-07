'use client';

import { useEffect, useMemo, useState } from 'react';

const THEMES = [
  { name: 'Light', bg: '#ffffff', card: '#f9fafb', text: '#111827', muted: '#6b7280', accent: '#f59e0b', border: '#e5e7eb' },
  { name: 'Dark', bg: '#0f172a', card: '#1e293b', text: '#f1f5f9', muted: '#94a3b8', accent: '#fbbf24', border: '#334155' },
  { name: 'Warm', bg: '#fffbeb', card: '#ffffff', text: '#451a03', muted: '#92400e', accent: '#ea580c', border: '#fde68a' },
];

// Obviously fictional people. Labelled SAMPLE everywhere they appear —
// these are placeholder demo data, never presented as real customers.
const SAMPLE = [
  { name: 'Sam Sample', role: 'Fictional Customer, Example Co.', quote: 'This is a sample testimonial. Replace it with a real quote from one of your own customers.', stars: 5 },
  { name: 'Pat Placeholder', role: 'Made-Up User, Demo Ltd.', quote: 'Sample text only — Wallnote ships with no real testimonials. Add your own below and the wall updates live.', stars: 5 },
  { name: 'Dana Demo', role: 'Imaginary Client, Testville Inc.', quote: 'A third sample card so you can see how a three-column wall looks. Delete all samples to start from an empty wall.', stars: 4 },
];

const STORAGE_KEY = 'wallnote-v01-testimonials';

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

  return (
    <main style={styles.main}>
      <h1 style={styles.h1}>Wallnote</h1>
      <p style={styles.tag}>
        Free testimonial wall builder. Paste your own testimonials, preview the
        wall live, copy one embed snippet onto your site. No sign-up, no backend.
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
        <p style={styles.note}>
          Static snapshot: the snippet carries your testimonials inside it, so it
          works with no server and no tracking. Edit the wall here and re-paste
          the snippet to update your site. The small &ldquo;Powered by
          Wallnote&rdquo; link keeps the free tier free.
        </p>
      </div>

      <footer style={styles.footer}>
        Wallnote v0.1 — free wall builder. Hosted collection forms, auto-updating
        embeds and video testimonials coming later. Demo data is fictional and
        labelled SAMPLE.
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
  code: { fontSize: 12, background: '#f3f4f6', padding: 12, borderRadius: 6, whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxHeight: 320, overflow: 'auto', margin: 0 },
  footer: { marginTop: 40, fontSize: 13, color: '#9ca3af' },
};
