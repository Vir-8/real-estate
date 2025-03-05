import "../app/globals.css"; // Import your global CSS
import type { AppProps } from 'next/app';
import { DataProvider } from '@/context/DataProvider';

export default function App({ Component, pageProps }: AppProps) {
  
  return (
    <DataProvider useMockDataOnly={false}>
      <Component {...pageProps} />
    </DataProvider>
  );
}