"use client";
import { signIn } from "next-auth/react";
import Image from "next/image";
import football from "@/public/football.svg";

export default function SignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 px-4">
      <div className="max-w-5xl w-full grid md:grid-cols-2 gap-12 items-center">
        {/* Left side - Content */}
        <div className="space-y-6 text-center md:text-left order-2 md:order-1">
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
              Penalty Merchants
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              The field where football turns into brotherhood.
            </p>
          </div>

          {/* <div className="space-y-4 pt-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-gray-700">
                Organize matches and track player attendance
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-gray-700">
                Automatic cost splitting and balance tracking
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-gray-700">
                Simple fund management for your group
              </p>
            </div>
          </div> */}

          <div className="pt-6">
            <button
              className="w-full md:w-auto group relative inline-flex items-center justify-center gap-3 bg-white border-2 border-gray-300 rounded-lg px-8 py-4 text-base font-semibold text-gray-700 shadow-sm hover:shadow-md hover:border-gray-400 transition-all duration-200 hover:-translate-y-0.5"
              onClick={() => signIn("google", { callbackUrl: "/" })}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          {/* <p className="text-sm text-gray-500 pt-2">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p> */}
        </div>

        {/* Right side - Animated illustration */}
        <div className="flex items-center justify-center order-1 md:order-2">
          <div className="relative w-full max-w-md aspect-square">
            {/* Animated soccer ball */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-64 h-64">
                {/* Background circles for depth */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-100 to-green-100 opacity-50 animate-pulse" />
                <div
                  className="absolute inset-8 rounded-full bg-gradient-to-br from-blue-200 to-green-200 opacity-40 animate-pulse"
                  style={{ animationDelay: "0.5s" }}
                />

                {/* Soccer ball illustration */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="w-40 h-40 animate-bounce opacity-65"
                    style={{ animationDuration: "2s" }}
                  >
                    <Image src={football} alt="football" />
                  </div>
                </div>

                {/* Floating elements */}
                <div
                  className="absolute top-0 right-0 w-12 h-12 bg-yellow-300 rounded-full opacity-80 animate-ping"
                  style={{ animationDuration: "3s" }}
                />
                <div
                  className="absolute bottom-0 left-0 w-16 h-16 bg-green-300 rounded-full opacity-60 animate-ping"
                  style={{ animationDuration: "4s" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
