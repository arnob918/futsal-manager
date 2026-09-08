"use client";

import { Money } from "@/components/Money";
import { PageHeader } from "@/components/PageHeader";
import {
  TransactionLedger,
  type FundRequest,
  type Transaction,
} from "@/components/TransactionLedger";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function FundsView({
  initialRequests,
  initialTransactions,
  userName = "User",
  userBalance = 0,
}: {
  initialRequests: FundRequest[];
  initialTransactions: Transaction[];
  userName?: string;
  userBalance?: number;
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        title={userName}
        description="Balance and full transaction history"
      />

      <Card>
        <CardHeader>
          <CardDescription>Current balance</CardDescription>
          <CardTitle className="text-3xl sm:text-4xl">
            <Money amount={userBalance} tone="sign" />
          </CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Transaction history</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionLedger
            transactions={initialTransactions}
            requests={initialRequests}
          />
        </CardContent>
      </Card>
    </div>
  );
}
