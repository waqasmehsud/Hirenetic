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
    <div className="space-y-8 text-white font-sans">
      {/* Header section */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          Compliance Security Audit
        </h1>
        <p className="text-[13px] text-slate-400 mt-1">
          Authorized global read access log containing full audit history for
          the LLM Shield tenant pipeline.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/30 border border-rose-900/60 text-rose-455 text-[13px] rounded-xl text-center">
          Security Violation: {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col justify-center items-center h-64 space-y-4 bg-slate-900/40 border border-slate-850/80 rounded-[24px]">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-[13px] text-slate-400 tracking-wider animate-pulse">
            Querying compliance history database...
          </p>
        </div>
      ) : items.length === 0 ? (
        <div className="p-16 bg-slate-900/40 border border-slate-850/80 rounded-[24px] text-center text-[13px] text-slate-400 font-bold uppercase tracking-wider font-mono">
          No records registered on secure network.
        </div>
      ) : (
        <div className="overflow-hidden border border-slate-800 bg-slate-900/50 rounded-[24px] shadow-lg backdrop-blur-md">
          <div className="overflow-x-auto font-mono text-[13px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                  <th className="px-6 py-4 text-indigo-400 font-bold">
                    Node Session
                  </th>
                  <th className="px-6 py-4 font-bold">Description Payload</th>
                  <th className="px-6 py-4 font-bold">Profile Owner</th>
                  <th className="px-6 py-4 font-bold">Privilege</th>
                  <th className="px-6 py-4 font-bold">Commit Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/50 text-slate-300">
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-850/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-white">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 truncate max-w-xs text-slate-400">
                      {item.description || (
                        <span className="text-slate-600 italic">
                          [ null_payload ]
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-white">
                      {item.profiles?.full_name || (
                        <span className="text-slate-600 italic">
                          [ orphan_node ]
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 text-[10px] font-bold border rounded-full uppercase tracking-wider ${
                          item.profiles?.role === "admin"
                            ? "bg-indigo-950/30 text-indigo-400 border-indigo-900/60"
                            : "bg-slate-950/50 text-slate-400 border-slate-800"
                        }`}
                      >
                        {item.profiles?.role || "user"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-[11px]">
                      {new Date(item.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
