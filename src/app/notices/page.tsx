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

interface Notice {
  id: string;
  title: string;
  content: string;
  postedBy: string;
  createdAt: string;
}

// Type for Firestore raw document data
type FirestoreNotice = {
  title: string;
  content: string;
  postedBy: string;
  createdAt?: Timestamp | null;
};

const NOTICES_PAGE_SIZE = 100;

export default function NoticesPage() {
  const { user, isLoaded } = useUser();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim() || !content.trim()) return;
    setLoading(true);
    try {
      await addDoc(collection(db, "notices"), {
        title,
        content,
        postedBy: user.fullName || "Unknown",
        createdAt: serverTimestamp(),
      });
      setTitle("");
      setContent("");
    } catch (err) {
      console.error("Error posting notice:", err);
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
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const freshNotices: Notice[] = [];
      snapshot.forEach((doc) => {
        // FIX: Type the Firestore data instead of using implicit 'any'!
        const data = doc.data() as FirestoreNotice;
        let createdAtVal = "";
        if (data.createdAt && "toDate" in data.createdAt) {
          createdAtVal = data.createdAt.toDate().toLocaleString();
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
    });
    return () => unsubscribe();
  }, []);

  if (!isLoaded)
    return <div className="text-white text-center">Loading...</div>;

  return (
    <main className="relative w-full min-h-screen flex items-center justify-center bg-black overflow-hidden p-6">
      {/* Background Glow */}
      <div className="absolute bottom-[-200px] left-1/2 transform -translate-x-1/2 w-[1000px] h-[600px] bg-purple-600 opacity-30 blur-[200px] rounded-full z-0" />
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none select-none">
        <Image
          src="/images/image1.png"
          alt="Hero"
          width={1550}
          height={800}
          className="w-[1550px] max-w-none object-contain"
          priority
        />
      </div>
      <div className="relative z-20 max-w-2xl w-full backdrop-blur-md bg-white/10 border border-white/20 text-white p-6 rounded-2xl shadow-lg space-y-6">
        <h1 className="text-3xl font-bold text-center">Notices</h1>
        {/* Form */}
        {user?.primaryEmailAddress?.emailAddress === "hr5300439@gmail.com" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={title}
              placeholder="Notice Title"
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white/20 text-white placeholder-white/70 border border-white/30 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            />
            <textarea
              value={content}
              placeholder="Notice Content"
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-white/20 text-white placeholder-white/70 border border-white/30 p-3 rounded-xl min-h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            />
            <div className="p-[2px] rounded-md bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-400 shadow-[0_0_15px_rgba(192,132,252,0.6)]">
              <button
                type="submit"
                disabled={loading}
                className="bg-black w-full rounded-md p-3 text-white border-none focus:outline-none"
              >
                {loading ? "Posting..." : "Post Notice"}
              </button>
            </div>
          </form>
        )}
        {/* Notices List */}
        <section className="space-y-4">
          {notices.length > 0 ? (
            notices.map((notice) => (
              <div
                key={notice.id}
                className="bg-white/20 border border-white/30 text-white p-4 rounded-xl shadow"
              >
                <h2 className="text-lg font-semibold">{notice.title}</h2>
                <p className="text-sm mt-1">{notice.content}</p>
                <div className="text-xs text-white/70 mt-2">
                  Posted by {notice.postedBy} on {notice.createdAt}
                </div>
              </div>
            ))
          ) : (
            <p className="text-white/70 text-center">No notices yet.</p>
          )}
        </section>
      </div>
    </main>
  );
}
