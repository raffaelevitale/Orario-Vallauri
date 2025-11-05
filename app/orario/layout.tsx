import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Orario | Raffaele Vitale',
  description: 'Gestione orario scolastico',
};

export default function OrarioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
