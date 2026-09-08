// app/about/page.tsx
import { CalendarPlus, Receipt, Wallet, Wallet2, X } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const PROBLEMS = [
  "Someone has to pay upfront for the group",
  "Everyone has to send money, always in odd amounts",
  "The payer has to keep track of who forgot",
  "Everyone pays on a different platform",
];

const STEPS = [
  {
    icon: Wallet,
    title: "Players add funds",
    body: "Each player requests to add money to their account balance. The admin approves once payment is received — think of it as prepaid credit for future games.",
  },
  {
    icon: CalendarPlus,
    title: "Admin schedules a match",
    body: "The admin creates a match with the date, time and location. All players see upcoming matches on their dashboard.",
  },
  {
    icon: Receipt,
    title: "After the match",
    body: "Admin adds the total cost and selects who participated. The system splits the cost equally and deducts it from each player's balance.",
  },
  {
    icon: Wallet2,
    title: "Everyone stays updated",
    body: "Players check their balance anytime and request more funds when running low. No awkward conversations, no chasing payments.",
  },
];

export default function AboutPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Why Penalty Merchants?"
        description="Managing weekly transactions shouldn't be complicated. This is how we keep the admin work out of the game."
      />

      <Card>
        <CardHeader>
          <CardTitle>The problem we solve</CardTitle>
          <CardDescription>
            Playing football should be about the game, not the admin work. But
            every week:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2.5">
            {PROBLEMS.map((problem) => (
              <li key={problem} className="flex items-start gap-3 text-sm">
                <X className="mt-0.5 size-4 shrink-0 text-destructive" />
                <span className="text-muted-foreground">{problem}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">How it works</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {STEPS.map(({ icon: Icon, title, body }, index) => (
            <Card key={title}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
                    <Icon className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Step {index + 1}
                    </p>
                    <CardTitle className="text-base">{title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
