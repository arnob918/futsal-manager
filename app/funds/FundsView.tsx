// app/(dashboard)/funds/FundsView.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { PaymentDetails } from "./PaymentDetails";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  TransactionLedger,
  type FundRequest,
  type Transaction,
} from "@/components/TransactionLedger";

const formSchema = z.object({
  amount: z
    .string()
    .min(1, "Enter an amount.")
    .refine((v) => Number.isFinite(Number(v)) && Number(v) > 0, {
      message: "Must be a positive amount.",
    }),
  channel: z.string().min(1, "Select a payment method."),
  userNote: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function FundsView({
  action,
  initialRequests,
  initialTransactions,
  channels,
}: {
  action: (formData: FormData) => Promise<{ ok: boolean } | void>;
  initialRequests: FundRequest[];
  initialTransactions: Transaction[];
  channels: string[];
}) {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { amount: "", channel: "", userNote: "" },
  });

  async function onSubmit(values: FormValues) {
    const formData = new FormData();
    formData.set("amount", values.amount);
    formData.set("channel", values.channel);
    formData.set("userNote", values.userNote ?? "");

    try {
      const res = await action(formData);
      if (!res || res.ok) {
        form.reset();
        router.refresh();
        toast.success("Request submitted", {
          description: "The admin will approve it once payment is received.",
        });
      }
    } catch (e: any) {
      toast.error("Couldn't submit the request", {
        description: e?.message || "Something went wrong while submitting.",
      });
    }
  }

  const pending = form.formState.isSubmitting;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add funds"
        description="Request to add money to your balance. Amount and payment method are required."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <Card>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="grid gap-4 sm:grid-cols-2"
              >
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount (BDT)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          inputMode="decimal"
                          step="0.01"
                          min="0.01"
                          placeholder="e.g. 1500"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Must be a positive amount.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="channel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment method</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a method…" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {channels.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        How you sent (or will send) the money.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="userNote"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Note (optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={3}
                          placeholder="Account details, transaction ID, sender name, etc."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="sm:col-span-2 sm:flex sm:justify-end">
                  <Button
                    type="submit"
                    disabled={pending}
                    className="w-full sm:w-auto"
                  >
                    {pending && <Loader2 className="size-4 animate-spin" />}
                    {pending ? "Submitting…" : "Request funds"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <PaymentDetails />
      </div>

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
