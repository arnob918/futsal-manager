"use client";

import { useState } from "react";
import { sendNegativeBalanceEmailAction } from "@/app/(actions)/emailActions";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
      <Button
        onClick={() => setIsOpen(true)}
        // Full width on phones so the label never overflows the button box.
        className="h-11 w-full bg-rose-600 text-white hover:bg-rose-700 sm:h-9 sm:w-auto"
      >
        <Mail className="size-4" />
        <span className="truncate">Send Reminder to All ({userIds.length})</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This will send an email reminder to {userIds.length}{" "}
              {userIds.length === 1 ? "user" : "users"} with a negative balance.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => setIsOpen(false)}
              disabled={isSending}
              className="h-11 sm:h-9"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={isSending}
              className="h-11 bg-rose-600 text-white hover:bg-rose-700 sm:h-9"
            >
              {isSending && <Loader2 className="size-4 animate-spin" />}
              Send Emails
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
