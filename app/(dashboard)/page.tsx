"use client";

import { useEffect, useState } from "react";

interface Item {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export default function DashboardHome() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const triggerRefetch = () => {
    setRefetchTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    let isMounted = true;
    const loadItems = async () => {
      try {
        const res = await fetch("/api/v1/items");
        if (!res.ok) throw new Error("Failed to load items");
        const data = (await res.json()) as Item[];
        if (isMounted) {
          setItems(data);
        }
      } catch (err: unknown) {
        const errorObj = err as { message?: string };
        if (isMounted) {
          setError(errorObj.message || "Error loading items");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadItems().catch((err: unknown) => {
      console.error("Unhandled error in loadItems:", err);
    });

    return () => {
      isMounted = false;
    };
  }, [refetchTrigger]);

  const openCreateModal = () => {
    setEditItem(null);
    setName("");
    setDescription("");
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (item: Item) => {
    setEditItem(item);
    setName(item.name);
    setDescription(item.description || "");
    setError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const url = editItem ? `/api/v1/items/${editItem.id}` : "/api/v1/items";
    const method = editItem ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      if (!res.ok) {
        const errData = (await res.json()) as { error: string };
        throw new Error(errData.error || "Failed to save item");
      }

      setModalOpen(false);
      triggerRefetch();
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setError(errorObj.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const res = await fetch(`/api/v1/items/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errData = (await res.json()) as { error: string };
        throw new Error(errData.error || "Failed to delete item");
      }

      triggerRefetch();
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      alert(errorObj.message || "Error deleting item");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-wider font-mono text-white flex items-center gap-2">
            <span className="text-primary">&gt;_</span> SECURE_VAULT_RECORDS
          </h1>
          <p className="text-xs text-zinc-500 mt-1 font-mono">
            OPERATIONS CONSOLE // MANAGE, AUDIT AND SECURE ENCRYPTED ITEM METADATA.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 font-mono text-xs uppercase tracking-wider font-semibold text-black bg-primary border border-primary hover:bg-black hover:text-primary hover:neon-glow-green transition-all duration-200 cursor-pointer shadow-lg shadow-primary/5"
        >
          [ + INITIALIZE RECORD ]
        </button>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col justify-center items-center h-64 space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono text-primary tracking-widest animate-pulse">DECRYPTING DATABASES...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 bg-muted/20 border border-border/80 rounded-sm text-center space-y-4 cyber-panel">
          <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
            NO RECORDS REGISTERED ON THIS NODE.
          </p>
          <button
            onClick={openCreateModal}
            className="text-xs font-mono text-primary border border-primary/30 hover:border-primary px-4 py-2 hover:bg-primary/5 transition-all cursor-pointer"
          >
            [ INITIALIZE FIRST RECORD ]
          </button>
        </div>
      ) : (
        /* Items Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-sm bg-muted/10 border border-border hover:border-primary/50 hover:neon-glow-green transition-all duration-300 flex flex-col justify-between cyber-panel"
            >
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-3 mb-4">
                  <span className="text-[10px] font-mono text-zinc-500 tracking-wider">
                    ID: {item.id.substring(0, 8).toUpperCase()}...
                  </span>
                  <span className="flex h-2 w-2 rounded-full bg-primary neon-glow-green" />
                </div>
                <h3 className="text-sm font-mono font-bold text-white tracking-wide uppercase truncate">
                  {item.name}
                </h3>
                <p className="text-zinc-400 text-xs mt-3 line-clamp-3 leading-relaxed font-sans">
                  {item.description || "No metadata description provided."}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between">
                <span className="text-[10px] font-mono text-zinc-500">
                  SECURED: {new Date(item.created_at).toLocaleDateString()}
                </span>
                <div className="flex gap-4">
                  <button
                    onClick={() => openEditModal(item)}
                    className="font-mono text-xs text-primary hover:text-white transition-all cursor-pointer"
                  >
                    [ EDIT ]
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="font-mono text-xs text-accent hover:text-white transition-all cursor-pointer"
                  >
                    [ PURGE ]
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CRUD Modal */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/85 backdrop-blur-sm px-4">
          <div className="bg-secondary/95 border border-primary/40 rounded-sm p-8 max-w-md w-full space-y-6 relative shadow-2xl neon-glow-green cyber-panel">
            <div className="scanner-bar" />
            <h2 className="text-lg font-mono font-bold text-white border-b border-border pb-3 uppercase tracking-wider flex items-center gap-2">
              <span className="text-primary">&gt;_</span> {editItem ? "EDIT_SECURE_RECORD" : "CREATE_SECURE_RECORD"}
            </h2>

            {error && (
              <div className="p-3 bg-accent/5 border border-accent/30 text-accent text-xs font-mono rounded-sm text-center uppercase tracking-wide">
                ERROR: {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-mono font-medium text-zinc-400 uppercase tracking-wider mb-2">
                  Record Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full px-4 py-3 bg-black border border-border rounded-none text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-mono text-sm transition placeholder-zinc-700"
                  placeholder="e.g., CONFIG_DATABASE_KEY"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-zinc-400 uppercase tracking-wider mb-2">
                  Secret Payload / Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="block w-full px-4 py-3 bg-black border border-border rounded-none text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-sans text-sm transition h-28 placeholder-zinc-700"
                  placeholder="Provide secure context metadata..."
                />
              </div>

              <div className="flex gap-4 justify-end pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-border bg-black font-mono text-xs uppercase tracking-wider text-zinc-500 hover:text-white transition-all cursor-pointer"
                >
                  [ CANCEL ]
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-primary hover:bg-black border border-primary text-black hover:text-primary font-mono text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:neon-glow-green"
                >
                  {submitting ? "SAVING..." : "COMMIT_WRITE"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

