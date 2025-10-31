// app/about/page.tsx
import Link from "next/link";
import {
  Users,
  Calendar,
  Wallet,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Hero Section */}
      <section className="px-4 pt-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            Why <span className="text-emerald-600">Penalty Marchants Web</span>?
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            We built this platform to solve a simple problem: managing weekly
            transactions shouldn't be complicated.
          </p>
        </div>
      </section>

      {/* Problem Section */}
      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              The Problem We Solve
            </h2>
            <p className="mt-4 text-gray-600">
              Playing football should be about the game, not the admin work. But
              every week:
            </p>
            <ul className="mt-4 space-y-2 text-gray-600">
              <li className="flex items-start gap-3">
                <span className="mt-1 text-red-500">✗</span>
                <span>Someone has to pay upfront for the group</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 text-red-500">✗</span>
                <span>
                  Everyone has to send money which is always odd amounts
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 text-red-500">✗</span>
                <span>The payer has to keep track of who forgot</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 text-red-500">✗</span>
                <span>Everyone pays in different platform</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      {/* <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Our Solution
          </h2>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-xl bg-emerald-50 p-6 border border-emerald-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-lg bg-emerald-600 p-2">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">For Admins</h3>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <Calendar className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                  <span>Schedule matches in seconds</span>
                </li>
                <li className="flex items-start gap-2">
                  <Users className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                  <span>Mark who attended after each game</span>
                </li>
                <li className="flex items-start gap-2">
                  <Wallet className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                  <span>Enter total cost - it auto-splits equally</span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                  <span>Track all balances in real-time</span>
                </li>
              </ul>
            </div>

            <div className="rounded-xl bg-blue-50 p-6 border border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-lg bg-blue-600 p-2">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">For Players</h3>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                  <span>Quick signup - no complex forms</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                  <span>Request to add funds when needed</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                  <span>See balance and transactions anytime</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                  <span>View all upcoming matches</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section> */}

      {/* How It Works */}
      <section className="px-4 py-8 sm:px-6 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>

          <div className="space-y-8">
            {/* Step 1 */}
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-emerald-600 text-white font-bold text-xl flex items-center justify-center">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Players Add Funds
                </h3>
                <p className="text-gray-600">
                  Each player requests to add money to their account balance.
                  The admin approves once payment is received. Think of it as
                  prepaid credit for future games.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-emerald-600 text-white font-bold text-xl flex items-center justify-center">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Admin Schedules a Match
                </h3>
                <p className="text-gray-600">
                  The admin creates a new match with the date, time, and
                  location. All players can see upcoming matches in their
                  dashboard.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-emerald-600 text-white font-bold text-xl flex items-center justify-center">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  After the Match
                </h3>
                <p className="text-gray-600">
                  Admin adds the total cost and selects who participated. The
                  system automatically splits the cost equally and deducts from
                  each player's balance.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-emerald-600 text-white font-bold text-xl flex items-center justify-center">
                4
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Everyone Stays Updated
                </h3>
                <p className="text-gray-600">
                  Players can check their balance anytime. When running low,
                  they simply request more funds. No awkward conversations, no
                  chasing payments.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      {/* <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Teams Love It
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-bold text-gray-900 mb-2">Lightning Fast</h3>
              <p className="text-sm text-gray-600">
                Schedule matches and split costs in under 30 seconds
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
              <div className="text-3xl mb-3">💰</div>
              <h3 className="font-bold text-gray-900 mb-2">No More Chasing</h3>
              <p className="text-sm text-gray-600">
                Prepaid balances mean no awkward payment requests
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-bold text-gray-900 mb-2">Crystal Clear</h3>
              <p className="text-sm text-gray-600">
                Everyone knows their balance and match history
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
              <div className="text-3xl mb-3">🤝</div>
              <h3 className="font-bold text-gray-900 mb-2">Built for Groups</h3>
              <p className="text-sm text-gray-600">
                Perfect for regular weekly games with the same crew
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
              <div className="text-3xl mb-3">📱</div>
              <h3 className="font-bold text-gray-900 mb-2">Mobile Friendly</h3>
              <p className="text-sm text-gray-600">
                Check balances and matches from anywhere
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-bold text-gray-900 mb-2">Simple & Focused</h3>
              <p className="text-sm text-gray-600">
                No bloat, just what you need for futsal management
              </p>
            </div>
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      {/* <section className="px-4 py-16 sm:px-6 lg:px-8 bg-emerald-600">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Simplify Your Games?
          </h2>
          <p className="text-emerald-100 text-lg mb-8">
            Join teams already using Futsal Manager to organize their weekly
            matches
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-emerald-600 hover:bg-gray-50 transition"
            >
              Get Started
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white px-6 py-3 font-semibold text-white hover:bg-emerald-700 transition"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section> */}

      {/* FAQ */}
      {/* <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Common Questions
          </h2>

          <div className="space-y-6">
            <details className="group rounded-lg bg-white p-6 shadow-sm border border-gray-200">
              <summary className="cursor-pointer font-semibold text-gray-900 list-none flex items-center justify-between">
                <span>How do players add money to their balance?</span>
                <span className="text-emerald-600 group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <p className="mt-4 text-gray-600">
                Players submit a fund request through their dashboard. They then
                pay the admin directly (cash, bKash, Nagad, etc.). Once the
                admin receives payment, they approve the request and the balance
                is updated.
              </p>
            </details>

            <details className="group rounded-lg bg-white p-6 shadow-sm border border-gray-200">
              <summary className="cursor-pointer font-semibold text-gray-900 list-none flex items-center justify-between">
                <span>What if someone doesn't have enough balance?</span>
                <span className="text-emerald-600 group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <p className="mt-4 text-gray-600">
                The system will show a warning if a player's balance is too low.
                They should request to add funds before the match. Admins can
                also manually adjust balances if needed.
              </p>
            </details>

            <details className="group rounded-lg bg-white p-6 shadow-sm border border-gray-200">
              <summary className="cursor-pointer font-semibold text-gray-900 list-none flex items-center justify-between">
                <span>Can costs be split unevenly?</span>
                <span className="text-emerald-600 group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <p className="mt-4 text-gray-600">
                Currently, costs are split equally among all participants. This
                keeps things simple and fair for regular weekly games.
              </p>
            </details>

            <details className="group rounded-lg bg-white p-6 shadow-sm border border-gray-200">
              <summary className="cursor-pointer font-semibold text-gray-900 list-none flex items-center justify-between">
                <span>Is this free to use?</span>
                <span className="text-emerald-600 group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <p className="mt-4 text-gray-600">
                Yes! We built this for our own futsal group and decided to share
                it with others. It's completely free to use.
              </p>
            </details>
          </div>
        </div>
      </section> */}
    </div>
  );
}
