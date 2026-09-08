'use client';

import { usePathname } from 'next/navigation';
import StoreFooter from '@/app/components/StoreFooter';

export default function GlobalStoreFooter({ legal, copy, version }){
  const pathname=usePathname();
  if(pathname?.startsWith('/dashboard')||pathname?.startsWith('/auth')||pathname?.startsWith('/api')||pathname?.startsWith('/legal/'))return null;
  return <StoreFooter legal={legal} copy={copy} version={version}/>;
}
