import './globals.css';

export const metadata = {
  title: 'Finance Dashboard',
  description: 'Track your income and expenses',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 font-sans antialiased">
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
