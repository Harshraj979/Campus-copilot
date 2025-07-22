"use client";
import { useUser } from "@clerk/nextjs";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import Image from "next/image";

// Simple relative time formatter
function formatRelativeTime(dateStr: string) {
  if (!dateStr || dateStr === "(pending)") return "posting...";
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  if (diff < 172800) return "yesterday";
  return date.toLocaleDateString();
}

// Utility to get avatar initials
function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface Notice {
  id: string;
  title: string;
  content: string;
  postedBy: string;
  createdAt: string;
}

type FirestoreNotice = {
  title: string;
  content: string;
  postedBy: string;
  createdAt?: Timestamp | null;
};

const NOTICES_PAGE_SIZE = 100;
const ADMINS = ["hr5300439@gmail.com"]; // easy scaling for future admins

export default function NoticesPage() {
  const { user, isLoaded } = useUser();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(false);
  const [noticesLoading, setNoticesLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const isAdmin = user && ADMINS.includes(user.primaryEmailAddress?.emailAddress || "");

  // Toast helper
  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim() || !content.trim()) return;
    setLoading(true);
    try {
      await addDoc(collection(db, "notices"), {
        title: title.slice(0, 120),
        content: content.slice(0, 3000),
        postedBy: user.fullName || "Unknown",
        createdAt: serverTimestamp(),
      });
      setTitle("");
      setContent("");
      showToast("Notice posted!", "success");
    } catch (err) {
      console.error("Error posting notice:", err);
      showToast("Error posting notice.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const q = query(
      collection(db, "notices"),
      orderBy("createdAt", "desc"),
      limit(NOTICES_PAGE_SIZE)
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const freshNotices: Notice[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data() as FirestoreNotice;
          let createdAtVal = "";
          if (data.createdAt && "toDate" in data.createdAt) {
            createdAtVal = data.createdAt.toDate().toISOString();
          } else {
            createdAtVal = "(pending)";
          }
          freshNotices.push({
            id: doc.id,
            title: data.title,
            content: data.content,
            postedBy: data.postedBy,
            createdAt: createdAtVal,
          });
        });
        setNotices(freshNotices);
        setNoticesLoading(false);
      },
      (err) => {
        setNoticesLoading(false);
        showToast("Could not load notices.", "error");
      }
    );
    return () => unsubscribe();
  }, []);

  if (!isLoaded)
    return (
      <div className="flex min-h-screen items-center justify-center bg-black overflow-hidden">
        <div className="text-white text-xl animate-pulse">Loading…</div>
      </div>
    );

  return (
    <main className="relative w-full min-h-screen flex items-center justify-center bg-black overflow-hidden p-6">
      {/* Background Glow and Hero Image - stays consistent */}
      <div className="fixed bottom-[-200px] left-1/2 transform -translate-x-1/2 w-[1000px] h-[600px] bg-purple-600 opacity-30 blur-[200px] rounded-full z-0" />
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none select-none">
        <Image
          src="/images/image1.png"
          alt="Hero"
          width={1550}
          height={800}
          className="w-[1550px] max-w-none object-contain"
          priority
        />
      </div>
      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-md text-white shadow-lg z-50
            ${
              toast.type === "success" ? "bg-green-600/90" : "bg-red-600/90"
            } animate-fade-in`}
        >
          {toast.msg}
        </div>
      )}
      <div className="relative z-20 max-w-2xl w-full backdrop-blur-md bg-white/10 border border-white/20 text-white p-6 rounded-2xl shadow-lg space-y-8">
        <h1 className="text-3xl font-bold text-center tracking-tight mb-2">
          <span className="drop-shadow glow-text bg-gradient-to-r from-sky-300 via-purple-300 to-pink-400 bg-clip-text text-transparent">
            Notices
          </span>
        </h1>
        {/* Form */}
        {isAdmin && (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 bg-black/30 border border-white/10 rounded-xl p-5 shadow"
            aria-labelledby="post-notice-heading"
          >
            <input
              aria-label="Title"
              type="text"
              value={title}
              placeholder="Notice Title"
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white/20 text-white placeholder-white/70 border border-white/30 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
              maxLength={120}
            />
            <textarea
              aria-label="Notice Content"
              value={content}
              placeholder="What's the notice about?"
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-white/20 text-white placeholder-white/70 border border-white/30 p-3 rounded-xl min-h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
              maxLength={3000}
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || !title.trim() || !content.trim()}
                className="px-5 py-2 rounded-xl text-lg font-semibold bg-gradient-to-r from-purple-600 via-sky-400 to-cyan-400 text-white hover:brightness-110 hover:scale-105 transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-60"
                aria-label="Post Notice"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    Posting…
                  </span>
                ) : (
                  "Post Notice"
                )}
              </button>
            </div>
          </form>
        )}
        {/* Notices List */}
        <section className="space-y-4">
          {noticesLoading ? (
            // Skeleton Placeholder
            <div className="space-y-6 animate-pulse" aria-label="Loading notices">
              {[...Array(3)].map((_, idx) => (
                <div
                  key={idx}
                  className="bg-white/10 border border-white/20 rounded-xl p-5 flex items-center space-x-4"
                >
                  <div className="h-9 w-9 bg-gradient-to-br from-purple-400/60 to-sky-300/40 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-white/30 rounded w-1/3"></div>
                    <div className="h-3 bg-white/20 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : notices.length > 0 ? (
            <ul className="space-y-6">
              {notices.map((notice) => (
                <li
                  key={notice.id}
                  className="bg-white/20 border border-white/30 text-white p-5 rounded-xl shadow-lg flex space-x-4 items-start"
                >
                  {/* Avatar/Initials */}
                  <div className="flex-shrink-0 h-9 w-9 bg-gradient-to-br from-sky-500 to-purple-400 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md border border-white/30 select-none">
                    {getInitials(notice.postedBy)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold tracking-tight">{notice.title}</h2>
                      <span className="text-xs text-white/70 ml-3 whitespace-nowrap">
                        {formatRelativeTime(notice.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm mt-2 leading-relaxed whitespace-pre-line">{notice.content}</p>
                    <span className="block text-xs text-white/60 mt-3">
                      Posted by <span className="font-bold">{notice.postedBy}</span>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            // Empty State
            <div className="flex flex-col items-center justify-center py-12 text-white/70 animate-fade-in">
              <span className="text-6xl mb-3">📢</span>
              <h2 className="text-xl font-semibold mb-2">No notices yet</h2>
              <p className="text-center max-w-sm">Check back soon for updates and announcements. Only admins can post new ones.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
