import './globals.css';

export const metadata = {
  title: 'Wallnote — Free Testimonial Wall Builder',
  description:
    'Paste your customer testimonials, preview a beautiful wall of love, and copy a free embed snippet for your site. No sign-up, no backend, free forever.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
