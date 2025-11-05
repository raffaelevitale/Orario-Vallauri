import { redirect } from 'next/navigation'

export default function RootPage() {
  // Redirect root to the Orario route
  redirect('/orario')
}
