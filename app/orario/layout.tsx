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
  // Wrap children in a fragment to ensure this exports a valid React component
  return <>{children}</>;
}
