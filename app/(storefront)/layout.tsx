'use client';

import { ReactNode } from 'react';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { CartProvider } from '@/lib/CartContext';

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function StorefrontRootLayout({ children }: { children: ReactNode }) {
  return (
    <ConvexProvider client={convex}>
      <CartProvider>{children}</CartProvider>
    </ConvexProvider>
  );
}
