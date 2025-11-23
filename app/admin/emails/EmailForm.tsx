"use client";

import { useState } from "react";
import { sendEmailAction } from "@/app/(actions)/emailActions";
import { Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const negativeBalanceUsers = users.filter((u) => u.balance < 0);

  const handleSelectAllNegative = () => {
    const ids = negativeBalanceUsers.map((u) => u.id);
    const allSelected = ids.every((id) => selectedUsers.includes(id));
    if (allSelected) {
      setSelectedUsers(selectedUsers.filter((id) => !ids.includes(id)));
    } else {
      const newSelected = new Set([...selectedUsers, ...ids]);
      setSelectedUsers(Array.from(newSelected));
    }
  };

  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Recipients</label>
        
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedUsers.length > 0 && (
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2">
              {selectedUsers.length} selected
            </span>
          )}
          <button
            type="button"
            onClick={handleSelectAllNegative}
            className="inline-flex items-center justify-center rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-slate-100 hover:text-slate-900 h-8 px-3"
          >
            {negativeBalanceUsers.every((u) => selectedUsers.includes(u.id))
              ? "Deselect Negative Balance Users"
              : `Select All Negative Balance Users (${negativeBalanceUsers.length})`}
          </button>
        </div>

        <div className="relative">
          <div
            className="flex min-h-[40px] w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span>
              {selectedUsers.length === 0
                ? "Select users..."
                : `${selectedUsers.length} users selected`}
            </span>
          </div>

          {isDropdownOpen && (
            <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-slate-200 bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              <div className="px-2 py-2 sticky top-0 bg-white border-b border-slate-100">
                <input
                  type="text"
                  className="w-full rounded-md border border-slate-200 px-3 py-1 text-sm focus:border-slate-400 focus:outline-none"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              {filteredUsers.length === 0 ? (
                <div className="relative cursor-default select-none py-2 px-4 text-slate-700">
                  No user found.
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="relative cursor-pointer select-none py-2 pl-10 pr-4 text-slate-900 hover:bg-slate-100"
                    onClick={() => toggleUser(user.id)}
                  >
                    <span
                      className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                        selectedUsers.includes(user.id)
                          ? "text-slate-600"
                          : "invisible"
                      }`}
                    >
                      <Check className="h-4 w-4" />
                    </span>
                    <div className="flex flex-col">
                      <span className="font-medium block truncate">
                        {user.name || "Unnamed"}
                      </span>
                      <span className="text-xs text-slate-500 block truncate">
                        {user.email} • Balance: {user.balance}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        {isDropdownOpen && (
          <div
            className="fixed inset-0 z-0"
            onClick={() => setIsDropdownOpen(false)}
          />
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="subject" className="text-sm font-medium text-slate-700">
          Subject
        </label>
        <input
          id="subject"
          required
          className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g. Outstanding Balance Reminder"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className="text-sm font-medium text-slate-700">
          Message
        </label>
        <textarea
          id="message"
          required
          rows={6}
          className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter your message here..."
        />
      </div>

      <button
        type="submit"
        disabled={isSending}
        className="inline-flex w-full items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-slate-50 hover:bg-slate-900/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      >
        {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Send Emails
      </button>
    </form>
  );
}
