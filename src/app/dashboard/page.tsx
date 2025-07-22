"use client";
import { useUser } from "@clerk/nextjs";
import {
  collection,
  query,
  orderBy,
  where,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import Link from "next/link";
import Image from "next/image";

// Utils
function getLocalTodayString() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// Interfaces
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

// Helper for status badge: basic time check
function getEventStatus(event: Event): "upcoming" | "ongoing" | "done" {
  const now = new Date();
  const eventStart = new Date(event.date + "T" + event.time);
  if (now < eventStart) return "upcoming";
  const eventEnd = new Date(eventStart.getTime() + 60 * 60 * 1000);
  if (now >= eventStart && now < eventEnd) return "ongoing";
  return "done";
}
const statusBadgeColor = {
  upcoming: "bg-sky-700 text-sky-200",
  ongoing: "bg-yellow-700 text-yellow-200",
  done:    "bg-gray-700 text-gray-300",
};
const statusBadgeLabel = {
  upcoming: "Upcoming",
  ongoing:  "Ongoing",
  done:     "Done",
};

// Main page
export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loadingNotices, setLoadingNotices] = useState(true);

  // Fetch today's events
  useEffect(() => {
    if (!user) return;
    setLoadingEvents(true);
    const todayStr = getLocalTodayString();
    const q = query(
      collection(db, "events"),
      where("userId", "==", user.id),
      where("date", "==", todayStr),
      orderBy("createdAt", "desc"),
      limit(EVENTS_PAGE_SIZE)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const fetched: Event[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        fetched.push({
          id: doc.id,
          title: data.title,
          time: data.time,
          date: data.date,
        });
      });
      setEvents(fetched);
      setLoadingEvents(false);
    });
    return () => unsub();
  }, [user]);

  // Fetch notices
  useEffect(() => {
    setLoadingNotices(true);
    const q = query(
      collection(db, "notices"),
      orderBy("createdAt", "desc"),
      limit(NOTICES_PAGE_SIZE)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const fetched: Notice[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        let createdAt = "";
        if (data.createdAt?.toDate) {
          createdAt = data.createdAt.toDate().toLocaleString();
        } else {
          createdAt = "(pending)";
        }
        fetched.push({
          id: doc.id,
          title: data.title,
          content: data.content,
          postedBy: data.postedBy,
          createdAt,
        });
      });
      setNotices(fetched);
      setLoadingNotices(false);
    });
    return () => unsub();
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
      {/* BACKGROUND */}
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
            <span className="bg-gradient-to-r from-[#d356a5]  via-[#e978e9] to-[#22d3ee] bg-clip-text text-transparent">
              {getGreeting()}
            </span>
            , <span className="ml-2">{displayName}</span>
          </h1>
          <p className="text-md text-gray-300 mt-1">{today}</p>
        </div>
      </header>

      {/* EVENTS SECTION (ENHANCED) */}
      <section className="mb-10 relative z-20">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 bg-gradient-to-r from-purple-400 via-pink-400 to-sky-400 bg-clip-text text-transparent">
          <svg viewBox="0 0 24 24" className="w-6 h-6 flex-shrink-0 text-pink-300 inline" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" className="text-purple-600" />
            <path d="M16 12A4 4 0 1 1 8 12a4 4 0 0 1 8 0z" fill="currentColor" />
          </svg>
          Today&apos;s Events
        </h2>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loadingEvents ? (
            Array.from({ length: 3 }).map((_, i) => (
              <li key={i} className="rounded-xl bg-black/60 p-6 animate-pulse shadow">
                <div className="h-5 bg-white/30 rounded w-32 mb-2" />
                <div className="w-16 h-3 rounded bg-purple-200/30 mb-1" />
                <div className="w-24 h-3 rounded bg-cyan-200/20" />
              </li>
            ))
          ) : events.length > 0 ? (
            events.map((event) => (
              <li
                key={event.id}
                tabIndex={0}
                className="flex flex-col justify-between rounded-xl p-6 bg-gradient-to-br from-black/80 via-purple-950/70 to-black/80 shadow-2xl border border-purple-700/30
                  hover:scale-[1.03] hover:ring-2 hover:ring-cyan-400 focus:scale-[1.03] transition cursor-pointer group"
              >
                <div className="flex flex-col gap-1 mb-4">
                  <span className="text-lg font-bold flex items-center gap-2 group-hover:text-purple-200">{event.title}</span>
                  <span className="text-xs text-pink-200">{event.date}</span>
                </div>
                <div className="flex items-center gap-3 mt-auto">
                  <span className="bg-gray-900 font-mono text-pink-300 px-4 py-1 rounded-lg drop-shadow">
                    {event.time}
                  </span>
                  <span className={`ml-auto px-2 py-1 rounded text-xs font-semibold ${statusBadgeColor[getEventStatus(event)]}`}>
                    {statusBadgeLabel[getEventStatus(event)]}
                  </span>
                </div>
              </li>
            ))
          ) : (
            <li className="flex flex-col col-span-full items-center py-10">
              <p className="text-lg text-pink-300 font-bold mb-2">No events for today.</p>
              <span className="text-sm text-gray-400 mt-2">Stay productive 🎯</span>
            </li>
          )}
        </ul>
      </section>

      {/* QUICK ACTIONS */}
      <section className="relative z-20 mb-12">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-cyan-300" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M12 7v5l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Quick Actions
        </h2>
        <div className="flex gap-4 flex-wrap">
          {[
            { label: "➕ Add Event", href: "/event" },
            { label: "🔔 Go to Notices", href: "/notices" }
          ].map((action) => (
            <div
              key={action.href}
              className="p-[2px] rounded-xl bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600"
            >
              <Link
                href={action.href}
                className="block px-6 py-3 rounded-lg text-lg font-semibold bg-black text-white border-none focus:outline-none focus:ring-2 focus:ring-sky-400 shadow transition-all"
              >
                {action.label}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CARDS/NOTICES */}
      <section className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-4 relative z-10">
        {/* CAMPUS TIP */}
        <div className="bg-black/60 rounded-xl p-5 shadow backdrop-blur-2xl border border-purple-900/30 w-full flex flex-col gap-2">
          <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">🎓 Campus Tip</h3>
          <p className="text-white-200 text-sm mb-1">
            Check your clubs regularly for updates and activities!
          </p>
        </div>
        {/* TODO LIST */}
        <div className="bg-black/60 rounded-xl p-5 shadow backdrop-blur-2xl border border-pink-900/30 w-full flex flex-col gap-2">
          <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">📝 To-do</h3>
          <ul className="list-disc ml-5 text-white/90">
            <li>{"Attend today&apos;s events"}</li>
            <li>Check new notices</li>
            <li>Sync your calendar</li>
          </ul>
        </div>
        {/* ANNOUNCEMENTS */}
        <div className="bg-black/60 rounded-xl p-5 shadow backdrop-blur-2xl border border-cyan-900/30 w-full flex flex-col gap-2">
          <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">📣 Announcements</h3>
          {loadingNotices ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-5 bg-white/10 animate-pulse rounded" />
              ))}
            </div>
          ) : notices.length > 0 ? (
            <ul className="space-y-4 overflow-y-auto max-h-56 pr-2">
              {notices.map((notice) => (
                <li key={notice.id} className="mb-2">
                  <div className="text-blue-200 text-sm font-medium">{notice.title}</div>
                  <div className="text-white/90 text-xs mt-1">{notice.content}</div>
                  <div className="text-xs text-gray-400">{notice.createdAt}</div>
                  <hr className="my-2 border-pink-900/20" />
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center text-gray-400 text-center mt-6">
              <span className="text-4xl mb-2">📢</span>
              <span>No current announcements.</span>
            </div>
          )}
        </div>
      </section>

      <footer className="z-30 w-full pt-12 text-center text-xs text-gray-600 opacity-70">
        Campus Copilot &copy; {new Date().getFullYear()} • For Students, By Students
      </footer>
    </main>
  );
}
