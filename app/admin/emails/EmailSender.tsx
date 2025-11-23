"use client";

import { useState } from "react";
import { sendEmailAction } from "@/app/(actions)/emailActions";

type User = {
  id: string;
  name: string | null;
  email: string;
  balance: number;
};

export default function EmailSender({ users }: { users: User[] }) {
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [isSending, setIsSending] = useState(false);

  const toggleUser = (userId: string) => {
    const newSelected = new Set(selectedUserIds);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUserIds(newSelected);
  };

  const selectNegativeBalanceUsers = () => {
    const negativeUsers = users
      .filter((u) => u.balance < 0)
      .map((u) => u.id);
    setSelectedUserIds(new Set(negativeUsers));
  };

  const selectAllUsers = () => {
    setSelectedUserIds(new Set(users.map((u) => u.id)));
  };

  const clearSelection = () => {
    setSelectedUserIds(new Set());
  };

  const handleSend = async () => {
    if (selectedUserIds.size === 0) {
      setStatus({ type: "error", message: "Please select at least one user." });
      return;
    }
    if (!subject.trim() || !message.trim()) {
      setStatus({ type: "error", message: "Subject and message are required." });
      return;
    }

    setIsSending(true);
    setStatus({ type: null, message: "" });

    try {
      const result = await sendEmailAction({
        userIds: Array.from(selectedUserIds),
        subject,
        message,
      });

      if (result.success) {
        setStatus({ type: "success", message: result.message || "Emails sent!" });
        setSubject("");
        setMessage("");
        setSelectedUserIds(new Set());
      } else {
        setStatus({ type: "error", message: result.error || "Failed to send." });
      }
    } catch (error) {
      setStatus({ type: "error", message: "An unexpected error occurred." });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Select Users</h2>
        <div className="flex gap-2 mb-4">
          <button
            onClick={selectNegativeBalanceUsers}
            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Select Negative Balance
          </button>
          <button
            onClick={selectAllUsers}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Select All
          </button>
          <button
            onClick={clearSelection}
            className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700"
          >
            Clear
          </button>
        </div>
        
        <div className="max-h-60 overflow-y-auto border rounded p-2">
          {users.map((user) => (
            <div key={user.id} className="flex items-center gap-2 py-1 hover:bg-gray-50">
              <input
                type="checkbox"
                id={`user-${user.id}`}
                checked={selectedUserIds.has(user.id)}
                onChange={() => toggleUser(user.id)}
                className="rounded border-gray-300"
              />
              <label htmlFor={`user-${user.id}`} className="flex-1 cursor-pointer flex justify-between text-sm">
                <span>{user.name || user.email}</span>
                <span className={user.balance < 0 ? "text-red-600 font-medium" : "text-green-600"}>
                  {user.balance}
                </span>
              </label>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Selected: {selectedUserIds.size} users
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <h2 className="text-xl font-semibold">Compose Email</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full border rounded-md p-2"
            placeholder="Important Notification"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            className="w-full border rounded-md p-2"
            placeholder="Write your message here..."
          />
        </div>

        {status.message && (
          <div className={`p-3 rounded ${status.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {status.message}
          </div>
        )}

        <button
          onClick={handleSend}
          disabled={isSending}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSending ? "Sending..." : "Send Emails"}
        </button>
      </div>
    </div>
  );
}
