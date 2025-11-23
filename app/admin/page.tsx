import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, DollarSign, Calendar, CheckCircle, Wallet, Mail } from "lucide-react";

export default async function Admin() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string;

  if (!userId) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, name: true },
  });

  // Redirect non-admin users to homepage
  if (user?.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 mt-10 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 border border-slate-200">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-slate-600">
            Welcome, {user?.name || "Admin"}. Manage matches, settlements, and
            fund requests.
          </p>
        </div>

        {/* Admin Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Create Match */}
          <Link href="/admin/matches">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-blue-300 transition-all group cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">
                    Create Match
                  </h3>
                  <p className="text-sm text-slate-600">
                    Schedule new matches and add participants
                  </p>
                </div>
              </div>
            </div>
          </Link>

          {/* Settle Match */}
          <Link href="/admin/settle">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-green-300 transition-all group cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="bg-green-100 p-3 rounded-lg group-hover:bg-green-200 transition-colors">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">
                    Settle Match
                  </h3>
                  <p className="text-sm text-slate-600">
                    Process match settlements and deduct balances
                  </p>
                </div>
              </div>
            </div>
          </Link>

          {/* Handle Fund Requests */}
          <Link href="/admin/funds">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-purple-300 transition-all group cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="bg-purple-100 p-3 rounded-lg group-hover:bg-purple-200 transition-colors">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">
                    Fund Requests
                  </h3>
                  <p className="text-sm text-slate-600">
                    Approve or reject pending fund requests
                  </p>
                </div>
              </div>
            </div>
          </Link>

          {/* View All Balances */}
          <Link href="/admin/balances">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-amber-300 transition-all group cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="bg-amber-100 p-3 rounded-lg group-hover:bg-amber-200 transition-colors">
                  <Wallet className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">
                    User Balances
                  </h3>
                  <p className="text-sm text-slate-600">
                    View and manage all user account balances
                  </p>
                </div>
              </div>
            </div>
          </Link>

          {/* Email Notifications */}
          <Link href="/admin/emails">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-indigo-300 transition-all group cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="bg-indigo-100 p-3 rounded-lg group-hover:bg-indigo-200 transition-colors">
                  <Mail className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">
                    Email Notifications
                  </h3>
                  <p className="text-sm text-slate-600">
                    Send email notifications to users
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Quick Access
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-600">Total Users</p>
              <p className="text-2xl font-bold text-slate-900">-</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-600">Active Matches</p>
              <p className="text-2xl font-bold text-slate-900">-</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <DollarSign className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-600">Pending Funds</p>
              <p className="text-2xl font-bold text-slate-900">-</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <CheckCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-600">To Settle</p>
              <p className="text-2xl font-bold text-slate-900">-</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
