import type { Metadata } from 'next';
import { SentryUserProvider } from '@/app/components/providers/SentryUserProvider';

export const metadata: Metadata = {
  title: 'Orario Vallauri',
  description: 'Gestione orario scolastico',
};

export default function OrarioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SentryUserProvider>
      {children}
    </SentryUserProvider>
  );
}
