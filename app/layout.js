import "./globals.css";

export const metadata = {
  title: "Pathfinder Demo",
  description: "AI-powered pathfinder chat demo",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
