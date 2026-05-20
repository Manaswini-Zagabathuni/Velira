import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/lib/auth-context';
import './globals.css';

export const metadata = {
  title: 'Velira — Watch Over Your Loved Ones',
  description: 'Velira helps families stay connected and care for elderly parents from a distance.',
  icons: { icon: '/icons/velira.svg' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                fontFamily: 'DM Sans, sans-serif',
                borderRadius: '12px',
                border: '1px solid #b4e6ce',
                background: '#fff',
                color: '#12402f',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
