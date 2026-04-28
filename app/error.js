'use client'

import './css/style.css';
import './css/euclid-circular-a-font.css'
import { startTransition } from 'react';
import { router } from 'better-auth/api';
import { useRouter } from 'next/navigation';
export default function Error({ error, reset }) {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full animate-ping opacity-75"></div>
          </div>
        </div>

        {/* Error Content Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Something went wrong
            </h1>
            <p className="text-sm text-gray-500">
              Don't worry, it happens to the best of us
            </p>
          </div>

          {/* Error Message */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800 font-medium break-words">
              {error?.message || 'An unexpected error occurred'}
            </p>
          </div>

          {/* Action Buttons */}
          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Option A: Try to refresh the current failing page */}
            <button
              onClick={() =>
                startTransition(() => {
                  router.refresh();
                  reset();
                })
              }
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg"
            >
              Try again
            </button>

            {/* Option B: Redirect to the last successful page */}
            <button
              onClick={() => router.back()} // This sends them to the previous URL in history
              className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-3 px-6 rounded-lg transition-all duration-200 border border-blue-200"
            >
              Return to previous page
            </button>

            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-all duration-200"
            >
              Go back home
            </button>
          </div>

          {/* Additional Help */}
          <div className="text-center pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              If this problem persists, please{' '}
              <a href="/contact" className="text-blue-600 hover:text-blue-700 underline">
                contact support
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-400 mt-6">
          Error ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
        </p>
      </div>
    </div>
  );
}