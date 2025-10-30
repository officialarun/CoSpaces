import '../styles/globals.css';
import { AuthProvider } from '../lib/auth';
import { Toaster } from 'react-hot-toast';
import { Inter } from 'next/font/google';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <div className={`${inter.variable} font-sans`}>
        <Component {...pageProps} />
        <Toaster position="top-right" />
      </div>
    </AuthProvider>
  );
}

export default MyApp;

