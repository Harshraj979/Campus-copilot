"use client";
import { useUser } from "@clerk/nextjs";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  where,
  limit
} from "firebase/firestore";
import { useEffect, useState } from "react";

interface Event {
  id: string;
  title: string;
  time: string;
  date: string;
  startdate?: any; // optional, for calendar logic
  enddate?: any;
}

const EVENTS_PAGE_SIZE = 60;

export default function CalendarPage() {
  const { user, isLoaded } = useUser();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    setLoading(true);

    // 👉 Fetch all events for the current user, ordered by date and time (or createdAt)
    const q = query(
      collection(db, "events"),
      where("userId", "==", user.id),
      orderBy("date", "desc"),
      orderBy("time", "desc"),
      limit(EVENTS_PAGE_SIZE)
    );
    // Real-time updates!
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: Event[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        fetched.push({
          id: doc.id,
          title: data.title,
          time: data.time,
          date: data.date,
          startdate: data.startdate,
          enddate: data.enddate
        });
      });
      setEvents(fetched);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  if (!isLoaded)
    return <div className="text-white text-center">Loading...</div>;

  return (
    <main className="relative min-h-screen w-full px-2 sm:px-6 md:px-12 pt-24 pb-16 bg-black flex flex-col items-center">
      {/* BG Glow */}
      <div className="absolute bottom-[-200px] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-purple-600 opacity-30 blur-[200px] rounded-full z-0"/>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10 pointer-events-none select-none">
        <img src="/images/image1.png"
             alt="Hero"
             className="w-[1550px] max-w-none object-contain"/>
      </div>

      <div className="relative z-20 w-full max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-white mb-10">Your Event Calendar</h1>
        {/* All events */}
        {loading ? (
          <div className="text-white/60 text-center py-10">Loading events…</div>
        ) : events.length === 0 ? (
          <div className="text-white/70 text-center py-10">No events found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-black/70 rounded-xl p-5 shadow backdrop-blur-2xl border border-purple-900/30 w-full flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">{event.title}</h2>
                </div>
                <div className="text-pink-200 text-sm">{event.date}</div>
                <div className="text-cyan-400 text-xs">{event.time}</div>
                {/* Optional: show startdate/enddate for calendar apps */}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
