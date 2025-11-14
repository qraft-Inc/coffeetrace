import { Inter } from 'next/font/google';
import './globals.css';
import Providers from '../components/Providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Coffee Trace - Farm to Cup Traceability',
  description: 'Climate-smart, data-driven coffee value chain platform enabling full traceability from farm to cup',
  keywords: 'coffee, traceability, sustainability, carbon footprint, fair trade, marketplace',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
