import React from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { ShieldCheck, Cpu } from 'lucide-react'

export default function AuthGuard({ children, userToken, onLogin }) {
  const handleSuccess = (credentialResponse) => {
    const token = credentialResponse.credential
    onLogin(token)
  }

  const handleFailure = () => {
    console.error('Google Sign-In Failed')
  }

  const handleMockLogin = () => {
    onLogin('mock-token')
  }

  if (userToken) {
    return <>{children}</>
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#0D1117] px-4 py-12 sm:px-6 lg:px-8 overflow-hidden">
      {/* Radiant Background Effects */}
      <div className="absolute top-[-20%] left-[-20%] h-[70vw] w-[70vw] rounded-full bg-brandBlue/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] h-[70vw] w-[70vw] rounded-full bg-brandPurple/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md space-y-8 z-10">
        <div className="flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-brandBlue to-brandPurple p-0.5 shadow-lg shadow-brandBlue/20 animate-pulse">
            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#0D1117]">
              <Cpu className="h-8 w-8 text-brandBlue" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-white">
            Antigravity Wrapper
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            A premium interface for the Google Antigravity Agent
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-gray-800 bg-gray-900/50 p-8 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="rounded-full bg-gray-800/80 p-3">
              <ShieldCheck className="h-6 w-6 text-brandPurple" />
            </div>
            
            <div className="text-center">
              <p className="text-sm font-medium text-gray-300">Authentication Required</p>
              <p className="mt-1 text-xs text-gray-500">Sign in with Google to establish your secure workspace session.</p>
            </div>

            <div className="w-full flex justify-center pt-2">
              <GoogleLogin
                onSuccess={handleSuccess}
                onError={handleFailure}
                theme="filled_dark"
                shape="circle"
                width="280px"
              />
            </div>

            <div className="relative w-full py-2">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gray-900 px-2 text-gray-500">Or Development Bypass</span>
              </div>
            </div>

            <button
              onClick={handleMockLogin}
              className="w-full py-2 px-4 border border-brandBlue/30 hover:border-brandBlue rounded-xl text-brandBlue hover:bg-brandBlue/5 text-sm font-medium transition duration-200"
            >
              Skip & Mock Log In
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
