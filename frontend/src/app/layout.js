import localFont from 'next/font/local';
import './globals.css';
import Navbar from '../components/Navbar';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata = {
  title: 'RTSH | Potential Winner Project',
  description: 'A good attempt at a win',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-200">
        {/* Navbar */}
        <header className="z-50">
          <Navbar />
        </header>

        <div className="flex flex-1 pt-[4rem]">
          {/* Left Sidebar with Repeated Background Pattern */}
          <aside
            className="hidden lg:flex flex-col w-64 border-r border-stone-200 dark:border-stone-700"
            style={{
              backgroundImage: 'url("/rtsh2025/aside-pattern.png")',
              backgroundRepeat: 'repeat',
              backgroundSize: 'auto',
            }}
          >
            {/* Pattern only, no textual content */}
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-10 overflow-auto">
            <div className="bg-stone-100 dark:bg-stone-800 p-6 rounded shadow-sm min-h-[calc(100vh-10rem)]">
              {children}
            </div>
          </main>

          {/* Right Sidebar with Repeated Background Pattern */}
          <aside
            className="hidden xl:block w-64 border-l border-stone-200 dark:border-stone-700"
            style={{
              backgroundImage: 'url("/rtsh2025/aside-pattern.png")',
              backgroundRepeat: 'repeat',
              backgroundSize: 'auto',
            }}
          >
            {/* Pattern only, no textual content */}
          </aside>
        </div>

        {/* Footer */}
        <footer className="bg-stone-50 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-700 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between text-sm text-stone-600 dark:text-stone-400">
            <p>&copy; {new Date().getFullYear()} RTSH. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
