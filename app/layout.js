import './globals.css';

export const metadata = {
  title: 'Wallnote — Free Testimonial Wall Builder',
  description:
    'Build a free testimonial wall: add customer quotes, pick a theme, and copy one embed snippet for your site. No sign-up, no backend.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
