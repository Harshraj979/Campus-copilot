// src/app/calendar/page.tsx
"use client";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { text } from "node:stream/consumers";

// Calendar Setup
const localizer = momentLocalizer(moment);

type CalendarEvent = {
  title: string;
  start: Date;
  end: Date;
};

const EVENTS_PAGE_SIZE = 100;

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      const eventList: CalendarEvent[] = [];
      const q = query(
        collection(db, "events"),
        orderBy("createdAt", "desc"),
        limit(EVENTS_PAGE_SIZE)
      );
      const snapshot = await getDocs(q);
      snapshot.forEach((doc) => {
        const data = doc.data();
        let start: Date, end: Date;
        if (data.startdate && typeof data.startdate.toDate === "function") {
          start = data.startdate.toDate();
          end = data.enddate ? data.enddate.toDate() : start;
        } else if (data.date && data.time) {
          const iso = `${data.date}T${data.time}:00`;
          start = new Date(iso);
          end = start;
        } else {
          start = new Date();
          end = new Date();
        }
        eventList.push({ title: data.title, start, end });
      });
      setEvents(eventList);
      setLoading(false);
    };

    fetchEvents();
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden">
      {/* Background glow & image */}
      <div className="fixed bottom-[-200px] left-1/2 transform -translate-x-1/2 w-[1000px] h-[600px] bg-purple-600 opacity-30 blur-[200px] rounded-full z-0" />
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 z-0">
        <img
          src="/images/image1.png"
          alt="Background Hero"
          className="w-[1550px] max-w-none object-contain pointer-events-none select-none"
        />
      </div>
      <div className="z-10 w-full max-w-6xl px-5 md:px-8">
        <div className="backdrop-blur-md bg-transparent rounded-2xl border border-white/30 shadow-2xl p-6 md:p-10 mt-20">
          <h1 className="text-center text-4xl md:text-5xl font-bold leading-tight mb-6 bg-gradient-to-r from-pink-400 via-purple-500  to-sky-500 text-transparent bg-clip-text drop-shadow-md">
            My Calendar
          </h1>
          <div className="bg-transparent rounded-xl p-4 shadow-lg relative ">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 400,
                fontFamily: "Inter, sans-serif",
                fontSize: "0.9rem",
                fontWeight: "500",
                }}
              className="text-blue-400 custom-calendar-theme"
              eventPropGetter={() => ({
    style: {
      backgroundColor: 'rgba(168,139,250,0.7)', // Purple glassy
      color: 'black', // White text
      borderRadius: '20px',
      border: 'none',
      boxShadow: '0 1px 7px 0 rgba(168,139,250,0.9)',
      textAlign: 'center',
      fontSize: '0.9rem',
      fontWeight: '500',
      fontStyle: 'oblique'

      // any other inline CSS styles you want to apply
    },
  })}
 
            />
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-20 rounded-xl">
                {/* Loading spinner */}
                <div className="animate-spin border-4 border-purple-500 border-t-transparent rounded-full w-8 h-8" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
