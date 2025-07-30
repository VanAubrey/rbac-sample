import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';

export default function App({ 
  Component, 
  pageProps: { session, ...pageProps } 
}: AppProps) {
  // Use type assertion to tell TypeScript this is safe
  const SafeComponent = Component as unknown as React.ComponentType<any>;
  
  return (
    <SessionProvider session={session}>
      <SafeComponent {...pageProps} />
    </SessionProvider>
  );
}