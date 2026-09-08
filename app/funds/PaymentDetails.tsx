import Image from "next/image";
import { Landmark } from "lucide-react";

import { CopyField } from "./CopyField";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const BKASH_NUMBER = "01875782911";
const BANK = {
  bankName: "Prime Bank",
  branchName: "Bashundhara Branch",
  accountNumber: "2165215017043",
  accountHolder: "Md. Shoriful Islam",
};

export function PaymentDetails() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Where to send the money</CardTitle>
        <CardDescription>
          Pay through one of these, then submit the request above so the admin
          can match it up.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible>
          <AccordionItem value="bkash">
            <AccordionTrigger>
              <span className="flex items-center gap-2.5">
                {/* bKash keeps its own mark; the surface around it stays neutral. */}
                <Image
                  src="/bkashlogo.png"
                  alt=""
                  width={20}
                  height={20}
                  className="rounded"
                />
                bKash
              </span>
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <CopyField label="Send money to" value={BKASH_NUMBER} mono />
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Or scan the QR
                </p>
                <div className="w-fit rounded-md border bg-muted/50 p-2">
                  <Image
                    src="/bkash_qr.jpeg"
                    alt="bKash QR code"
                    width={140}
                    height={140}
                    className="rounded"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="bank" className="border-b-0">
            <AccordionTrigger>
              <span className="flex items-center gap-2.5">
                <Landmark className="size-5 text-muted-foreground" />
                Bank transfer
              </span>
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="rounded-md border bg-muted/50 px-3 py-2">
                <p className="text-sm font-medium">{BANK.bankName}</p>
                <p className="text-xs text-muted-foreground">
                  {BANK.branchName}
                </p>
              </div>
              <CopyField
                label="Account number"
                value={BANK.accountNumber}
                mono
              />
              <CopyField label="Account holder" value={BANK.accountHolder} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
