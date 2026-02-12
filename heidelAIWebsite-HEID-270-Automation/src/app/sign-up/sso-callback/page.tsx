import { AuthenticateWithRedirectCallback } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center">
        <AuthenticateWithRedirectCallback afterSignInUrl="/sign-up" afterSignUpUrl="/sign-up" />
    </div>
  )
}
