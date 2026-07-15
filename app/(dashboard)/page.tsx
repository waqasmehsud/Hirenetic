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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Your Protected Items</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Manage, audit, and secure your database records.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-lg cursor-pointer"
        >
          Add Item
        </button>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 bg-zinc-900/30 border border-zinc-800/80 rounded-2xl text-center space-y-4">
          <p className="text-zinc-400">No items found. Create your first item above.</p>
        </div>
      ) : (
        /* Items Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 hover:border-indigo-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <h3 className="text-lg font-bold text-white truncate">{item.name}</h3>
                <p className="text-zinc-400 text-sm mt-2 line-clamp-3">
                  {item.description || "No description provided."}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between">
                <span className="text-xs text-zinc-500">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(item)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/20 transition cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/20 transition cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CRUD Modal */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full space-y-6 relative shadow-2xl">
            <h2 className="text-xl font-bold">
              {editItem ? "Edit Secure Item" : "Create Secure Item"}
            </h2>

            {error && (
              <div className="p-3 bg-red-950/50 border border-red-900/50 text-red-400 text-sm rounded-xl text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300">Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="Secret item name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 block w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition h-28"
                  placeholder="Provide context..."
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-zinc-800 rounded-xl text-sm font-medium text-zinc-400 hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition shadow-lg cursor-pointer"
                >
                  {submitting ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
