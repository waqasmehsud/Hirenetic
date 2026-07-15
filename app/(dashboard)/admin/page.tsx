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
      <div className="border-b border-border pb-6">
        <h1 className="text-2xl font-extrabold tracking-wider font-mono text-white flex items-center gap-2">
          <span className="text-accent">&gt;_</span> SYSTEM_AUDIT_LOG
        </h1>
        <p className="text-xs text-zinc-500 mt-1 font-mono">
          SECURE ENCRYPTED NODE READS // GLOBAL METADATA COMPLIANCE LOG.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-accent/5 border border-accent/30 text-accent text-xs font-mono rounded-none text-center uppercase tracking-wide">
          ACCESS_VIOLATION: {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col justify-center items-center h-64 space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono text-primary tracking-widest animate-pulse">QUERYING COMPLIANCE ENGINE...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="p-16 bg-muted/20 border border-border/80 rounded-none text-center text-xs font-mono text-zinc-500 uppercase tracking-wider cyber-panel">
          NO RECORDS REGISTERED ON SECURE NETWORK.
        </div>
      ) : (
        <div className="overflow-x-auto border border-border bg-secondary/30 backdrop-blur-md rounded-none cyber-panel">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/20 font-mono text-xs font-bold text-zinc-400 uppercase tracking-wider">
                <th className="px-6 py-4 border-r border-border/50 text-primary">Node Item</th>
                <th className="px-6 py-4 border-r border-border/50">Description Metadata</th>
                <th className="px-6 py-4 border-r border-border/50">Node Owner</th>
                <th className="px-6 py-4 border-r border-border/50">Sec Level</th>
                <th className="px-6 py-4">Commit Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-xs font-mono text-zinc-400">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-muted/10 transition-colors duration-150">
                  <td className="px-6 py-4 border-r border-border/50 font-semibold text-white tracking-wide">{item.name}</td>
                  <td className="px-6 py-4 border-r border-border/50 truncate max-w-xs font-sans text-zinc-300">
                    {item.description || <span className="text-zinc-600 font-mono text-xs">[ NULL_PAYLOAD ]</span>}
                  </td>
                  <td className="px-6 py-4 border-r border-border/50 text-zinc-300">
                    {item.profiles?.full_name || (
                      <span className="text-zinc-600 font-bold">[ NO_OWNER_ID ]</span>
                    )}
                  </td>
                  <td className="px-6 py-4 border-r border-border/50">
                    <span
                      className={`inline-block px-2 py-0.5 text-[9px] font-bold border uppercase tracking-wider ${
                        item.profiles?.role === "admin"
                          ? "bg-accent/5 text-accent border-accent/20 neon-glow-red"
                          : "bg-primary/5 text-primary border-primary/20 neon-glow-green"
                      }`}
                    >
                      {item.profiles?.role || "user"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-500 text-[10px]">
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

