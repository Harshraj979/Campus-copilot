"use client";
import { useUser } from "@clerk/nextjs";
import {
  collection,
  query,
  orderBy,
  where,
  limit,
  onSnapshot
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import Link from "next/link";
import Image from "next/image"; // <-- Add this!

interface Event {
  id: string;
  title: string;
  time: string;
  date: string;
}

interface Notice {
  id: string;
  title: string;
  content: string;
  postedBy?: string;
  createdAt: string;
}

const NOTICES_PAGE_SIZE = 30;
const EVENTS_PAGE_SIZE = 30;

// ---- LOCAL DATE HELPER ----
function getLocalTodayString() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loadingNotices, setLoadingNotices] = useState(true);

  // -- EVENTS: Use onSnapshot for REAL-TIME updates! --
  useEffect(() => {
    if (!user) return;
    setLoadingEvents(true);

    const todayStr = getLocalTodayString();
    // FIRESTORE QUERY: only today's events for this user
    const q = query(
      collection(db, "events"),
      orderBy("createdAt", "desc"),
      where("userId", "==", user.id),
      where("date", "==", todayStr),
      limit(EVENTS_PAGE_SIZE)
    );

    // Listen for changes in real-time
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedEvents: Event[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        fetchedEvents.push({
          id: doc.id,
          title: data.title,
          time: data.time,
          date: data.date,
        });
      });
      setEvents(fetchedEvents);
      setLoadingEvents(false);
    });
    return () => unsubscribe();
  }, [user]);

  // -- NOTICES: Already real-time with onSnapshot --
  useEffect(() => {
    setLoadingNotices(true);
    const q = query(
      collection(db, "notices"),
      orderBy("createdAt", "desc"),
      limit(NOTICES_PAGE_SIZE)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedNotices: Notice[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        let createdAt = "";
        if (data.createdAt?.toDate) {
          createdAt = data.createdAt.toDate().toLocaleString();
        } else {
          createdAt = "(pending)";
        }
        fetchedNotices.push({
          id: doc.id,
          title: data.title,
          content: data.content,
          postedBy: data.postedBy,
          createdAt,
        });
      });
      setNotices(fetchedNotices);
      setLoadingNotices(false);
    });
    return () => unsubscribe();
  }, []);

  if (!isLoaded)
    return (
      <div className="text-center pt-20 text-white text-xl">Loading...</div>
    );

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const hour = new Date().getHours();
  const greetKey = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
  const greetingIcon = {
    morning: "🌅",
    afternoon: "☀️",
    evening: "🌙",
  };
  const getGreeting = () => {
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };
  const displayName =
    user?.fullName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    "Student";

  return (
    <main className="relative min-h-screen pt-[100px] pb-24 px-4 sm:px-6 md:px-10 bg-black text-white overflow-x-hidden">
      {/* GLOWING BACKGROUND */}
      <div className="fixed bottom-[-200px] left-1/2 transform -translate-x-1/2 w-[1000px] h-[600px] bg-purple-600 opacity-30 blur-[200px] rounded-full z-0" />
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 z-0">
        <Image
          src="/images/image1.png"
          alt="Background Hero"
          width={1540}
          height={700}
          className="w-[1540px] max-w-none object-contain pointer-events-none select-none"
          priority
        />
      </div>
      {/* GREETING HEADER */}
      <header className="relative z-20 flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center">
            <span className="mr-2">{greetingIcon[greetKey]}</span>
            {getGreeting()},{" "}
            <span className="ml-2">{displayName}</span>
          </h1>
          <p className="text-md text-gray-300 mt-1">{today}</p>
        </div>
      </header>
      {/* TODAY'S EVENTS */}
      <section className="mb-10 relative z-20">
        <h2 className="text-xl font-semibold mb-3"> Today’s Events</h2>
        <ul className="bg-black/80 rounded-xl p-5 shadow-lg backdrop-blur-md divide-y divide-gray-900/30 min-h-[70px]">
          {loadingEvents ? (
            <li className="py-4 text-pink-300 flex items-center gap-2">
              <span className="animate-spin">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
              </span>
              Loading...
            </li>
          ) : events.length > 0 ? (
            events.map((event) => (
              <li
                key={event.id}
                className="flex justify-between items-center py-3"
              >
                <div>
                  <strong>{event.title}</strong>
                  <div className="text-pink-200 text-xs mt-1">{event.date}</div>
                </div>
                <div className="bg-gray-900 rounded-lg px-4 py-1 text-pink-300 font-mono">
                  {event.time}
                </div>
              </li>
            ))
          ) : (
            <li className="text-gray-400 py-6 flex flex-col items-center">
              <svg
                viewBox="0 0 24 24"
                className="w-8 h-8 mb-2 opacity-60"
              >
                <path
                  fill="currentColor"
                  d="M12 22c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9 4.03 9 9 9zm0-18c4.41 0 8 3.59 8 8s-3.59 8-8 8-8-3.59-8-8 3.59-8 8-8zm.5 4H11v5l4.28 2.54.72-1.21-3.5-2.08V8z"
                />
              </svg>
              No events for today. <br />
              <span className="text-sm opacity-70">Stay productive!</span>
            </li>
          )}
        </ul>
      </section>
      {/* QUICK ACTIONS */}
      <section className="relative z-20 mb-12">
        <h2 className="text-xl font-semibold mb-4"> Quick Actions</h2>
        <div className="flex gap-4 flex-wrap">
          {[
            { label: "➕ Add Event", href: "/event" },
            { label: "Go to Notices", href: "/notices" }
          ].map((action) => (
            <div
              key={action.href}
              className="p-[2px] rounded-xl transition-all duration-300 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 hover:from-purple-600 hover:via-pink-500 hover:to-purple-600"
            >
              <Link
                href={action.href}
                className="block px-6 py-3 rounded-[0.85rem] text-lg font-semibold bg-black text-white border-none focus:outline-none transition-all duration-300"
              >
                {action.label}
              </Link>
            </div>
          ))}
        </div>
      </section>
      {/* "Cards" SECTION */}
      <section className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-4 relative z-10">
        <div className="bg-black/60 rounded-xl p-5 shadow backdrop-blur-2xl border border-purple-900/30 w-full flex flex-col gap-2">
          <h3 className="text-lg font-semibold mb-1">🎓 Campus Tip</h3>
          <p className="text-white-200 text-sm mb-1">
            Check your clubs regularly for updates and activities!
          </p>
        </div>
        <div className="bg-black/60 rounded-xl p-5 shadow backdrop-blur-2xl border border-pink-900/30 w-full flex flex-col gap-2">
          <h3 className="text-lg font-semibold mb-1">📝 To-do</h3>
          <ul className="list-disc ml-5 text-white/90">
            <li>Attend today's events</li>
            <li>Check new notices</li>
            <li>Sync your calendar</li>
          </ul>
        </div>
        <div className="bg-black/60 rounded-xl p-5 shadow backdrop-blur-2xl border border-cyan-900/30 w-full flex flex-col gap-2">
          <h3 className="text-lg font-semibold mb-1">📣 Announcements</h3>
          {loadingNotices ? (
            <p className="text-gray-400 text-sm">Loading…</p>
          ) : notices.length > 0 ? (
            <ul className="space-y-3">
              {notices.map((notice) => (
                <li key={notice.id}>
                  <p className="text-blue-200 text-sm font-medium">{notice.title}</p>
                  <p className="text-white/90 text-xs mt-1">{notice.content}</p>
                  {notice.createdAt && (
                    <div className="text-xs text-gray-400">{notice.createdAt}</div>
                  )}
                  <hr className="my-2 border-pink-900/20" />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-sm">No current announcements.</p>
          )}
        </div>
      </section>
      <footer className="z-30 w-full pt-12 text-center text-xs text-gray-600 opacity-70">
        Campus Copilot &copy; {new Date().getFullYear()} • For Students, By Students
      </footer>
    </main>
  );
}
