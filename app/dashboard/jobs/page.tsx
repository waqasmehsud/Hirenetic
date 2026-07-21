"use client";

import { useState, useEffect, useMemo } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

interface LinkedInJob {
  id: string;
  job_title: string;
  company: string;
  location: string | null;
  job_link: string;
  posted_date: string | null;
  scraped_at: string;
}

export default function LinkedInJobsDashboard() {
  const [jobs, setJobs] = useState<LinkedInJob[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "company" | "title">("newest");

  // Initial fetch on mount using async promise resolution (no synchronous setState inside effect body)
  useEffect(() => {
    let ignore = false;
    const supabase = createBrowserSupabaseClient();

    supabase
      .from("available_jobs")
      .select("*")
      .order("scraped_at", { ascending: false })
      .then(async (res) => {
        let data = res.data;
        let fetchError = res.error;
        if (fetchError && fetchError.message.includes("available_jobs")) {
          const fallbackRes = await supabase
            .from("linkedin_jobs")
            .select("*")
            .order("scraped_at", { ascending: false });
          data = fallbackRes.data;
          fetchError = fallbackRes.error;
        }

        if (fetchError) {
          throw new Error(fetchError.message);
        }

        if (!ignore) {
          setJobs((data as LinkedInJob[]) || []);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          console.error("Failed to fetch LinkedIn jobs:", err);
          const message =
            err instanceof Error
              ? err.message
              : "An unexpected error occurred while loading job data.";
          setError(message);
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  // Manual refresh feed handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setError(null);

    try {
      const supabase = createBrowserSupabaseClient();
      let { data, error: fetchError } = await supabase
        .from("available_jobs")
        .select("*")
        .order("scraped_at", { ascending: false });

      if (fetchError && fetchError.message.includes("available_jobs")) {
        const fallbackRes = await supabase
          .from("linkedin_jobs")
          .select("*")
          .order("scraped_at", { ascending: false });
        data = fallbackRes.data;
        fetchError = fallbackRes.error;
      }

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setJobs((data as LinkedInJob[]) || []);
    } catch (err: unknown) {
      console.error("Failed to refresh LinkedIn jobs:", err);
      const message =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while loading job data.";
      setError(message);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filter and sort jobs
  const processedJobs = useMemo(() => {
    let result = [...jobs];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (job) =>
          job.job_title.toLowerCase().includes(q) ||
          job.company.toLowerCase().includes(q) ||
          (job.location && job.location.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.scraped_at).getTime() - new Date(a.scraped_at).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.scraped_at).getTime() - new Date(b.scraped_at).getTime();
      }
      if (sortBy === "company") {
        return a.company.localeCompare(b.company);
      }
      if (sortBy === "title") {
        return a.job_title.localeCompare(b.job_title);
      }
      return 0;
    });

    return result;
  }, [jobs, searchQuery, sortBy]);

  // Unique companies count
  const uniqueCompanies = useMemo(() => {
    const set = new Set(jobs.map((j) => j.company.trim().toLowerCase()));
    return set.size;
  }, [jobs]);

  // Format scraped timestamp
  const formatTimestamp = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-8 text-white font-sans relative">
      {/* 1. Header Banner */}
      <div className="p-8 bg-slate-900/60 border border-slate-800 rounded-[28px] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative overflow-hidden backdrop-blur-md">
        <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-tr from-indigo-500/30 to-emerald-400/20 opacity-20 blur-3xl rounded-full pointer-events-none" />

        <div className="space-y-3 z-10 max-w-3xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold uppercase bg-slate-950 border border-slate-800 text-[#3ddc97] rounded-full tracking-wider font-mono">
            <span className="w-1.5 h-1.5 bg-[#3ddc97] rounded-full animate-ping" />
            Live Supabase Feed
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight leading-tight">
            Automated LinkedIn Job Crawls
          </h1>
          <p className="text-[14px] text-slate-400 leading-relaxed">
            Real-time feed of open tech, cybersecurity, and engineering positions parsed directly from LinkedIn and synchronized to Supabase.
          </p>
        </div>

        <div className="z-10 shrink-0">
          <button
            onClick={handleRefresh}
            disabled={loading || isRefreshing}
            className="w-full sm:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all rounded-xl disabled:opacity-50 cursor-pointer shadow-lg shadow-indigo-900/30 flex items-center justify-center gap-2"
          >
            <svg
              className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {isRefreshing ? "Refreshing..." : "Refresh Feed"}
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
        <div className="p-5 bg-slate-900/50 border border-slate-850/80 rounded-2xl">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block font-mono">
            Total Postings
          </span>
          <span className="text-2xl font-extrabold text-white mt-1 block font-mono">
            {jobs.length}
          </span>
        </div>
        <div className="p-5 bg-slate-900/50 border border-slate-850/80 rounded-2xl">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block font-mono">
            Companies Tracked
          </span>
          <span className="text-2xl font-extrabold text-emerald-400 mt-1 block font-mono">
            {uniqueCompanies}
          </span>
        </div>
        <div className="p-5 bg-slate-900/50 border border-slate-850/80 rounded-2xl">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block font-mono">
            Database Status
          </span>
          <span className="text-sm font-bold text-indigo-400 mt-2 block font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Supabase Connected
          </span>
        </div>
        <div className="p-5 bg-slate-900/50 border border-slate-850/80 rounded-2xl">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block font-mono">
            Target Keywords
          </span>
          <span className="text-sm font-bold text-purple-400 mt-2 block font-mono truncate">
            Cyber, Tech, Web, Dev
          </span>
        </div>
      </div>

      {/* 3. Controls & Data Table Section */}
      <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-[24px] space-y-6 backdrop-blur-md">
        {/* Search & Sort Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by job title or company..."
              className="w-full pl-10 pr-9 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort Control */}
          <div className="flex items-center gap-3 shrink-0">
            <label className="text-xs font-mono text-slate-400 font-bold uppercase tracking-wider">
              Sort By:
            </label>
            <select
              value={sortBy}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setSortBy(e.target.value as "newest" | "oldest" | "company" | "title")
              }
              className="bg-slate-950/70 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="newest">Newest Scraped</option>
              <option value="oldest">Oldest Scraped</option>
              <option value="company">Company (A-Z)</option>
              <option value="title">Job Title (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-5 bg-rose-950/30 border border-rose-800/80 rounded-xl text-rose-300 text-xs font-mono space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-2 text-rose-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                DATABASE_CONNECTION_ERROR
              </span>
              <button
                onClick={handleRefresh}
                className="px-3 py-1 bg-rose-900/60 hover:bg-rose-800 text-white rounded font-bold transition-all cursor-pointer"
              >
                Retry Fetch
              </button>
            </div>
            <p className="text-slate-400 font-sans text-xs">{error}</p>
          </div>
        )}

        {/* Data Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/40">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-900/80 border-b border-slate-800 font-mono text-[11px] uppercase text-slate-400 tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Job Title</th>
                <th className="py-3.5 px-4">Company</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Posted Date</th>
                <th className="py-3.5 px-4">Scraped At</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/60">
              {loading ? (
                // Skeleton Rows
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4 px-4">
                      <div className="h-4 bg-slate-800 rounded w-48 mb-1" />
                      <div className="h-3 bg-slate-850 rounded w-24" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 bg-slate-800 rounded w-32" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 bg-slate-800 rounded w-28" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 bg-slate-800 rounded w-20" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 bg-slate-800 rounded w-24" />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="h-8 bg-slate-800 rounded w-24 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : processedJobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-mono">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <svg
                        className="w-8 h-8 text-slate-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm font-bold text-slate-400">No Job Postings Found</p>
                      <p className="text-xs text-slate-500 max-w-sm font-sans">
                        {searchQuery
                          ? `No jobs match your search query "${searchQuery}". Try clearing your search.`
                          : "The available_jobs database table is currently empty. Run the Python crawler to populate job postings."}
                      </p>
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="mt-2 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-lg transition-all"
                        >
                          Clear Search Filter
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                processedJobs.map((job) => (
                  <tr
                    key={job.id || job.job_link}
                    className="hover:bg-slate-900/60 transition-colors group"
                  >
                    {/* Job Title */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-white group-hover:text-[#3ddc97] transition-colors leading-snug">
                        {job.job_title}
                      </div>
                      <span className="inline-block mt-1 px-2 py-0.5 border border-indigo-900/60 bg-indigo-950/40 text-indigo-400 font-mono text-[9px] uppercase font-bold rounded">
                        LinkedIn Verified
                      </span>
                    </td>

                    {/* Company */}
                    <td className="py-4 px-4 text-slate-300 font-semibold">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-indigo-400 font-mono">
                          {job.company.charAt(0).toUpperCase()}
                        </div>
                        <span>{job.company}</span>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-4 px-4 text-slate-400 font-mono text-[11px]">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
                        <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {job.location || "Remote"}
                      </span>
                    </td>

                    {/* Posted Date */}
                    <td className="py-4 px-4 text-slate-400 font-mono text-[11px]">
                      {job.posted_date || "Recently"}
                    </td>

                    {/* Scraped At */}
                    <td className="py-4 px-4 text-slate-400 font-mono text-[11px]">
                      {formatTimestamp(job.scraped_at)}
                    </td>

                    {/* Action Link */}
                    <td className="py-4 px-4 text-right">
                      <a
                        href={job.job_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-[#3ddc97] text-slate-300 hover:text-slate-950 border border-slate-800 hover:border-[#3ddc97] rounded-lg text-xs font-mono font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                      >
                        <span>View on LinkedIn</span>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
