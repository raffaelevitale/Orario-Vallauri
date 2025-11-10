import { redirect } from 'next/navigation'

export default function RootPage() {
  // Redirect root to the setup page to start onboarding
  redirect('/orario/setup')
}
