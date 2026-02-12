'use client'
import React, { useEffect, useState } from 'react'
import { useAuth, useClerk, useSignIn } from '@clerk/nextjs'
import type { NextPage } from 'next'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'sonner';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"

const ForgotPasswordPage: NextPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [successfulCreation, setSuccessfulCreation] = useState(false)
  const [secondFactor, setSecondFactor] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)

  const router = useRouter()
  const clerk = useClerk()
  const { isSignedIn } = useAuth()
  const { isLoaded, signIn, setActive } = useSignIn()

  useEffect(() => {
    if (isSignedIn) {
      toast.success('You are already signed in. Redirecting to dashboard...')
      router.push('/dashboard')
    }
  }, [isSignedIn, router])

  if (!isLoaded) {
    return null
  }

  // Send the password reset code to the user's email
  async function create(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await signIn
      ?.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      })
      .then((_) => {
        setSuccessfulCreation(true)
        setError('')
        toast.success('Password reset code sent to your email.')
      })
      .catch((err) => {
        setError(err.errors?.[0]?.longMessage || 'An error occurred')
        toast.error(err.errors?.[0]?.longMessage || 'An error occurred')
      })
    setLoading(false)
  }

  // Reset the user's password.
  async function reset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await signIn
      ?.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password,
      })
      .then((result) => {
        if (result.status === 'needs_second_factor') {
          setSecondFactor(true)
          setError('')
          toast.error('2FA is required, but this UI does not handle that.')
        } else if (result.status === 'complete') {
          setActive({ session: result.createdSessionId })
            .then(() => {
              if (result.createdSessionId) {
                localStorage.setItem('sessionId', result.createdSessionId);
              }
              setError('')
              setSuccess(true)
              router.push('/dashboard')
            })
            .catch((err) => {
              setError(err.errors?.[0]?.longMessage || 'Failed to set active session')
              toast.error(err.errors?.[0]?.longMessage || 'Failed to set active session')
            })
        }
      })
      .catch((err) => {
        setError(err.errors?.[0]?.longMessage || 'An error occurred')
        toast.error(err.errors?.[0]?.longMessage || 'An error occurred')
      })
    setLoading(false)
  }

  const resendOtp = async (e: React.MouseEvent) => { 
    e.preventDefault()
    setResendLoading(true)
    await signIn
      ?.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      })
      .then((_) => {
        setError('')
        toast.success('Password reset code resent to your email.')
      })
      .catch((err) => {
        setError(err.errors?.[0]?.longMessage || 'An error occurred')
        toast.error(err.errors?.[0]?.longMessage || 'An error occurred')
      })
    setResendLoading(false)
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 overflow-hidden bg-white">
      {/* LEFT SIDE – Branding / Features */}
      <div className="relative hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-indigo-700 via-purple-700 to-fuchsia-600 text-white p-16 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-[500px] h-[500px] bg-indigo-400/30 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-[600px] h-[600px] bg-pink-500/20 rounded-full blur-[100px] animate-pulse"></div>
        </div>
        <div className="relative z-10 text-center flex flex-col items-center">
          <Image
            src="/heidelai.png"
            alt="HeidelAI"
            width={120}
            height={120}
            className="mb-8 drop-shadow-xl"
          />
          <h1 className="text-5xl font-extrabold mb-6 leading-tight">
            Forgot your password?
          </h1>
          <p className="max-w-xl text-indigo-100 mb-12 leading-relaxed text-xl">
            No worries! Reset your password and get back to your workspace.
          </p>
          <div className="grid grid-cols-2 gap-6 mt-4 max-w-2xl">
            <div className="backdrop-blur-md bg-white/10 border border-white/10 rounded-2xl p-6 text-left hover:bg-white/20 transition-all">
              <h3 className="font-semibold text-2xl mb-3">🔒 Secure Reset</h3>
              <p className="text-lg text-indigo-100/90">
                Your account security is our priority.
              </p>
            </div>
            <div className="backdrop-blur-md bg-white/10 border border-white/10 rounded-2xl p-6 text-left hover:bg-white/20 transition-all">
              <h3 className="font-semibold text-2xl mb-3">⚡ Fast Recovery</h3>
              <p className="text-lg text-indigo-100/90">
                Get back to work in just a few steps.
              </p>
            </div>
            <div className="backdrop-blur-md bg-white/10 border border-white/10 rounded-2xl p-6 text-left hover:bg-white/20 transition-all">
              <h3 className="font-semibold text-2xl mb-3">🛡️ Privacy First</h3>
              <p className="text-lg text-indigo-100/90">
                We never share your credentials.
              </p>
            </div>
            <div className="backdrop-blur-md bg-white/10 border border-white/10 rounded-2xl p-6 text-left hover:bg-white/20 transition-all">
              <h3 className="font-semibold text-2xl mb-3">💬 Support</h3>
              <p className="text-lg text-indigo-100/90">
                Need help? Contact your admin anytime.
              </p>
            </div>
          </div>
          <p className="mt-16 text-xl text-indigo-100/80 italic font-light">
            &quot;Smarter security. Simple recovery.&quot;
          </p>
        </div>
      </div>

      {/* RIGHT SIDE – Forgot Password Form */}
      <div className="flex flex-col justify-center items-center bg-gradient-to-br from-white via-indigo-50 to-purple-100 p-8 md:p-12 relative min-h-screen w-full">
        <div className="w-full max-w-2xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">
              Reset Your Password
            </h2>
            <p className="text-gray-600 text-lg">
              Enter your email to receive a reset code.
            </p>
          </div>

          <form className="space-y-6" onSubmit={!successfulCreation ? create : reset}>
            {!successfulCreation && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-3" htmlFor="email">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="e.g john@doe.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all hover:border-gray-300"
                    required
                  />
                </div>

                {error && !success && (
                  <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg animate-in slide-in-from-top duration-300">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <p className="text-red-700 font-medium">{error}</p>
                    </div>
                  </div>
                )}

                {success && (
                  <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg animate-in slide-in-from-top duration-300">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <p className="text-green-700 font-medium">Success! Redirecting...</p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl text-lg font-semibold hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-all mt-8 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    'Send password reset code'
                  )}
                </button>
              </div>
            )}

            {successfulCreation && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-6">
                  <p className="text-indigo-700 text-sm font-medium">
                    ✓ Code sent to <span className="font-semibold">{email}</span>
                  </p>
                </div>

                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-3" htmlFor="password">
                    New Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Enter a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all hover:border-gray-300"
                    autoComplete="new-password"
                    required
                  />
                  <p className="text-gray-500 text-sm mt-2">Minimum 8 characters recommended</p>
                </div>

                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-3" htmlFor="code">
                    Reset Code (sent to your email)
                  </label>
                  <div className="w-full flex justify-center mt-4">
                    <InputOTP
                      maxLength={6}
                      value={code}
                      onChange={setCode}
                      required
                      className="flex items-center gap-3"
                    >
                      <InputOTPGroup className="flex gap-2 md:gap-3">
                        {[0, 1, 2].map((i) => (
                          <InputOTPSlot
                            key={i}
                            index={i}
                            className="
                              h-12 w-12
                              rounded-lg
                              border-2 border-gray-200
                              bg-gray-50
                              text-lg font-semibold
                              text-gray-900
                              shadow-sm
                              transition-all
                              focus:border-indigo-500
                              focus:ring-2 focus:ring-indigo-500
                              hover:border-gray-300
                            "
                          />
                        ))}
                      </InputOTPGroup>

                      <span className="text-gray-300 text-xl font-semibold select-none">–</span>

                      <InputOTPGroup className="flex gap-2 md:gap-3">
                        {[3, 4, 5].map((i) => (
                          <InputOTPSlot
                            key={i}
                            index={i}
                            className="
                              h-12 w-12
                              rounded-lg
                              border-2 border-gray-200
                              bg-gray-50
                              text-lg font-semibold
                              text-gray-900
                              shadow-sm
                              transition-all
                              focus:border-indigo-500
                              focus:ring-2 focus:ring-indigo-500
                              hover:border-gray-300
                            "
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>

                {error && !success && (
                  <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg animate-in slide-in-from-top duration-300">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <p className="text-red-700 font-medium">{error}</p>
                    </div>
                  </div>
                )}

                {success && (
                  <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg animate-in slide-in-from-top duration-300">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <p className="text-green-700 font-medium">Success! Redirecting...</p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl text-lg font-semibold hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-all mt-8 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Resetting...
                    </span>
                  ) : (
                    'Reset Password'
                  )}
                </button>

                <div className="flex justify-center mt-4">
                  <button
                    type="button"
                    className="text-indigo-600 hover:text-indigo-700 font-medium text-base hover:underline transition-colors disabled:opacity-50"
                    onClick={resendOtp}
                    disabled={resendLoading}
                  >
                    {resendLoading ? 'Resending...' : 'Didn\'t receive the code? Resend'}
                  </button>
                </div>
              </div>
            )}

            {secondFactor && (
              <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-yellow-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-yellow-700 font-medium">2FA is required, but this UI does not handle that.</p>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage