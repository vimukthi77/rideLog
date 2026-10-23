import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Preloader from '@/components/layout/Preloader';

export const metadata: Metadata = {
  title: 'Lakdhanavi Ride Recording System | Sahasdhanavi 350 MW LNG Power Plant',
  description: 'Digital vehicle ride recording and transport logbook system for Lakdhanavi Limited - Sahasdhanavi 350 MW Combined Cycle Power Plant (CCPP) EPC Project, Kerawalapitiya.',
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-[#1B262C] antialiased selection:bg-[#3282B8] selection:text-white min-h-screen">
        <AuthProvider>
          <Preloader minDuration={1000} />
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1B262C',
                color: '#FFFFFF',
                borderRadius: '10px',
                border: '1px solid #3282B8',
                fontSize: '14px',
                fontWeight: 500,
                boxShadow: '0 10px 25px -5px rgba(27, 38, 44, 0.3)',
              },
              success: {
                iconTheme: {
                  primary: '#27AE60',
                  secondary: '#FFFFFF',
                },
              },
              error: {
                iconTheme: {
                  primary: '#E74C3C',
                  secondary: '#FFFFFF',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
