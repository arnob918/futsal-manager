// components/BkashAccordion.tsx
"use client";

import * as React from "react";
import { Copy, Check, ChevronUp } from "lucide-react";
import Image from "next/image";

interface BkashAccordionProps {
  bkashNumber: string;
  qrCodePath?: string;
  bkashLogo?: string;
  // Controlled props for coordinated mobile behaviour
  isOpen?: boolean;
  onToggle?: () => void;
  isCollapsed?: boolean; // mobile: the other accordion is open
}

export function BkashAccordion({
  bkashNumber,
  qrCodePath = "/bkash_qr.jpeg",
  bkashLogo = "/bkashlogo.png",
  isOpen: controlledOpen,
  onToggle,
  isCollapsed = false,
}: BkashAccordionProps) {
  const [localOpen, setLocalOpen] = React.useState(false);

  // Use controlled state if provided, otherwise fall back to local
  const isOpen = controlledOpen !== undefined ? controlledOpen : localOpen;
  const handleToggle = onToggle ?? (() => setLocalOpen((v) => !v));

  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(bkashNumber);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = bkashNumber;
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
    <div className="w-full">
      {/* Accordion Header */}
      <button
        onClick={handleToggle}
        className={`flex w-full items-center rounded-t-xl bg-pink-600 px-3 py-2.5 text-white shadow-lg hover:bg-pink-700 transition-colors sm:px-4 sm:py-3 ${
          isCollapsed
            ? "justify-center rounded-xl"
            : "justify-between gap-2 rounded-t-xl"
        } ${!isOpen && !isCollapsed ? "rounded-b-xl" : ""}`}
        type="button"
        title="bKash Payment"
      >
        <div className={`flex items-center ${isCollapsed ? "" : "gap-2"}`}>
          <Image
            src={bkashLogo}
            alt="bKash Icon"
            width={24}
            height={24}
            className="rounded w-[24px] h-[24px] sm:w-[20px] sm:h-[20px] shrink-0"
          />
          {/* Hide label when collapsed on mobile */}
          <span
            className={`font-semibold text-sm sm:text-base whitespace-nowrap overflow-hidden transition-all duration-300 ${
              isCollapsed
                ? "w-0 opacity-0 sm:w-auto sm:opacity-100 sm:ml-2"
                : "ml-0"
            }`}
          >
            bKash Payment
          </span>
        </div>
        {/* Hide chevron when collapsed on mobile */}
        <ChevronUp
          className={`h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180" : ""
          } ${isCollapsed ? "hidden sm:block" : ""}`}
        />
      </button>

      {/* Accordion Content */}
      <div
        className={`overflow-hidden rounded-b-xl bg-white shadow-lg transition-all duration-300 ${
          isOpen && !isCollapsed ? "max-h-[500px] border-x border-b" : "max-h-0"
        }`}
      >
        <div className="p-3 space-y-3 sm:p-4 sm:space-y-4">
          {/* Instructions */}
          <div className="text-sm text-gray-700">
            <p className="font-medium mb-1 text-sm">Send money to:</p>
            <p className="text-xs text-gray-600">
              Open bKash app and send money to this number
            </p>
          </div>

          {/* Number with Copy Button */}
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-lg border border-pink-200 bg-pink-50 px-2.5 py-2 sm:px-3">
              <span className="font-mono text-base sm:text-lg font-bold text-pink-900 break-all">
                {bkashNumber}
              </span>
            </div>
            <button
              onClick={handleCopy}
              className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg border border-pink-200 bg-white hover:bg-pink-50 transition-colors active:scale-95"
              type="button"
              title={copied ? "Copied!" : "Copy number"}
            >
              {copied ? (
                <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              ) : (
                <Copy className="h-4 w-4 sm:h-5 sm:w-5 text-pink-600" />
              )}
            </button>
          </div>

          {/* QR Code */}
          <div className="hidden sm:flex flex-col border-t pt-3 sm:pt-4">
            <p className="text-xs text-gray-600 mb-2 text-center">
              Or scan QR code in bKash app
            </p>
            <div className="flex justify-center">
              <div className="rounded-lg border-2 border-pink-200 p-2 bg-white">
                <Image
                  src={qrCodePath}
                  alt="bKash QR Code"
                  width={120}
                  height={120}
                  className="rounded w-[120px] h-[120px] sm:w-[150px] sm:h-[150px]"
                />
              </div>
            </div>
          </div>

          {/* Mobile hint */}
          <a href="https://bka.sh/next">
            <div className="sm:hidden bg-pink-50 rounded-lg px-3 py-2 text-center">
              <p className="text-xs text-pink-700">💡 Open Bkash App</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
