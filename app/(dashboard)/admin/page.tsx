"use client";

import { useEffect, useState } from "react";

interface ProfileJoined {
  full_name: string | null;
  role: string | null;
}

interface ItemWithProfile {
  id: string;
  name: string;
  description: string | null;
  user_id: string;
  created_at: string;
  profiles: ProfileJoined | null;
}

export default function AdminPage() {
  const [items, setItems] = useState<ItemWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdminItems = async () => {
      try {
        const res = await fetch("/api/dashboard/admin/items");
        if (!res.ok) {
          if (res.status === 403) {
            throw new Error("Forbidden: Admin access required");
          }
          throw new Error("Failed to load audit logs");
        }
        const data = (await res.json()) as ItemWithProfile[];
        setItems(data);
      } catch (err: unknown) {
        const errorObj = err as { message?: string };
        setError(errorObj.message || "Error loading audit records");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminItems().catch((err: unknown) => {
      console.error("Unhandled error in fetchAdminItems:", err);
    });
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Admin Security Audit</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Systems Administrator view of all protected items and data compliance logs.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/50 border border-red-900/50 text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="p-16 bg-zinc-900/30 border border-zinc-800/80 rounded-2xl text-center text-zinc-400">
          No records found in the database.
        </div>
      ) : (
        <div className="overflow-x-auto border border-zinc-800/80 rounded-2xl bg-zinc-900/20 backdrop-blur-md">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800/85 bg-zinc-900/40 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                <th className="px-6 py-4">Item Name</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Owner</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-sm text-zinc-300">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-900/30 transition">
                  <td className="px-6 py-4 font-semibold text-white">{item.name}</td>
                  <td className="px-6 py-4 truncate max-w-xs">
                    {item.description || <span className="text-zinc-600">None</span>}
                  </td>
                  <td className="px-6 py-4">
                    {item.profiles?.full_name || (
                      <span className="text-zinc-600">Unknown User</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                        item.profiles?.role === "admin"
                          ? "bg-red-500/10 text-red-400 border border-red-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      }`}
                    >
                      {item.profiles?.role || "user"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-zinc-500">
                    {new Date(item.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
