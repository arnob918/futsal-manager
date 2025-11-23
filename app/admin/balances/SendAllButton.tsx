"use client";

import { useState } from "react";
import { sendNegativeBalanceEmailAction } from "@/app/(actions)/emailActions";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";

export default function SendAllButton({ userIds }: { userIds: string[] }) {
  const [isSending, setIsSending] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSend = async () => {
    setIsSending(true);
    try {
      const result = await sendNegativeBalanceEmailAction(userIds);
      if (result.success) {
        toast.success(result.message);
        setIsOpen(false);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsSending(false);
    }
  };

  if (userIds.length === 0) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-rose-600 text-white hover:bg-rose-700 h-9 px-4 py-2"
      >
        <Mail className="mr-2 h-4 w-4" />
        Send Reminder to All ({userIds.length})
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
            <h2 className="text-lg font-semibold mb-2">Are you sure?</h2>
            <p className="text-sm text-slate-600 mb-6">
              This will send an email reminder to {userIds.length} users with a
              negative balance.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsOpen(false)}
                disabled={isSending}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={isSending}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-md disabled:opacity-50"
              >
                {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Emails
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
