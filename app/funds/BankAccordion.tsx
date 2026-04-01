// components/BankAccordion.tsx
"use client";

import * as React from "react";
import { ChevronUp, Copy, Check, Landmark } from "lucide-react";

interface CopyButtonProps {
  text: string;
  label?: string;
}

function CopyButton({ text, label }: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand("copy");
          textArea.remove();
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error("Fallback copy failed:", err);
          textArea.remove();
        }
      }
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg border border-blue-200 bg-white hover:bg-blue-50 transition-colors active:scale-95"
      type="button"
      title={copied ? "Copied!" : `Copy ${label ?? ""}`}
    >
      {copied ? (
        <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
      ) : (
        <Copy className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
      )}
    </button>
  );
}

interface BankAccordionProps {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  branchName: string;
}

export function BankAccordion({
  bankName,
  accountNumber,
  accountHolder,
  branchName,
}: BankAccordionProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="flex-1 min-w-0 sm:w-64">
      {/* Accordion Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-2 rounded-t-xl bg-blue-700 px-3 py-2.5 text-white shadow-lg hover:bg-blue-800 transition-colors sm:px-4 sm:py-3"
        type="button"
      >
        <div className="flex items-center gap-2">
          <Landmark className="w-5 h-5 shrink-0" />
          <span className="font-semibold text-sm sm:text-base">
            Bank Transfer
          </span>
        </div>
        <ChevronUp
          className={`h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Accordion Content */}
      <div
        className={`overflow-hidden rounded-b-xl bg-white shadow-lg transition-all duration-200 ${
          isOpen ? "max-h-[500px] border-x border-b" : "max-h-0"
        }`}
      >
        <div className="p-3 space-y-3 sm:p-4 sm:space-y-4">
          {/* Instructions */}
          <div className="text-sm text-gray-700">
            <p className="font-medium mb-1 text-sm">Transfer to:</p>
            <p className="text-xs text-gray-600">
              Use the details below to make a bank transfer
            </p>
          </div>

          {/* Bank Name & Branch */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 space-y-0.5">
            <p className="font-semibold text-sm text-blue-900">{bankName}</p>
            <p className="text-xs text-blue-700">{branchName}</p>
          </div>

          {/* Account Number */}
          <div>
            <p className="text-xs text-gray-500 mb-1 font-medium">
              Account Number
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-2 sm:px-3">
                <span className="font-mono text-xs sm:text-lg font-bold text-blue-900 break-all">
                  {accountNumber}
                </span>
              </div>
              <CopyButton text={accountNumber} label="account number" />
            </div>
          </div>

          {/* Account Holder */}
          <div>
            <p className="text-xs text-gray-500 mb-1 font-medium">
              Account Holder
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-2 sm:px-3">
                <span className="text-xs sm:text-base font-semibold text-blue-900">
                  {accountHolder}
                </span>
              </div>
              <CopyButton text={accountHolder} label="account holder name" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
