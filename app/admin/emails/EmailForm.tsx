"use client";

import { useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";

import { sendEmailAction } from "@/app/(actions)/emailActions";
import { Money } from "@/components/Money";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type User = {
  id: string;
  name: string | null;
  email: string;
  balance: number;
};

export default function EmailForm({ users }: { users: User[] }) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const negativeBalanceUsers = useMemo(
    () => users.filter((u) => u.balance < 0),
    [users]
  );

  const allNegativeSelected =
    negativeBalanceUsers.length > 0 &&
    negativeBalanceUsers.every((u) => selectedUsers.includes(u.id));

  const filteredUsers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }, [users, searchTerm]);

  const handleSelectAllNegative = () => {
    const ids = negativeBalanceUsers.map((u) => u.id);
    if (allNegativeSelected) {
      setSelectedUsers(selectedUsers.filter((id) => !ids.includes(id)));
    } else {
      setSelectedUsers(Array.from(new Set([...selectedUsers, ...ids])));
    }
  };

  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUsers.length === 0) {
      toast.error("Please select at least one user");
      return;
    }

    setIsSending(true);
    try {
      const result = await sendEmailAction({
        userIds: selectedUsers,
        subject,
        message,
      });

      if (result.success) {
        toast.success(result.message);
        setSubject("");
        setMessage("");
        setSelectedUsers([]);
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label>Recipients</Label>
          <div className="flex items-center gap-2">
            {selectedUsers.length > 0 && (
              <Badge variant="secondary">
                {selectedUsers.length} selected
              </Badge>
            )}
            {negativeBalanceUsers.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSelectAllNegative}
              >
                {allNegativeSelected
                  ? "Deselect negative balances"
                  : `Select negative balances (${negativeBalanceUsers.length})`}
              </Button>
            )}
          </div>
        </div>

        {/* An inline list rather than a dropdown: the recipient set is the main
            decision on this screen, so it shouldn't hide behind an overlay. */}
        <div className="rounded-md border">
          <div className="border-b p-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                className="pl-9"
                placeholder="Search users…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto p-1">
            {filteredUsers.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                No user found.
              </p>
            ) : (
              filteredUsers.map((user) => (
                <label
                  key={user.id}
                  htmlFor={`recipient-${user.id}`}
                  className="flex cursor-pointer items-center gap-3 rounded-sm px-2 py-2 transition-colors hover:bg-accent"
                >
                  <Checkbox
                    id={`recipient-${user.id}`}
                    checked={selectedUsers.includes(user.id)}
                    onCheckedChange={() => toggleUser(user.id)}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {user.name || "Unnamed"}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </span>
                  <span className="shrink-0 text-sm font-medium">
                    <Money amount={user.balance} tone="sign" />
                  </span>
                </label>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g. Outstanding balance reminder"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          required
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter your message here…"
        />
      </div>

      <Button type="submit" disabled={isSending} className="w-full sm:w-auto">
        {isSending && <Loader2 className="size-4 animate-spin" />}
        {isSending ? "Sending…" : "Send emails"}
      </Button>
    </form>
  );
}
