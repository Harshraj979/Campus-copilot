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
} from "firebase/firestore";
import Image from "next/image";

// Calendar Setup
const localizer = momentLocalizer(moment);

type CalendarEvent = {
  id?: string;
  title: string;
  start: Date;
  end: Date;
};

const EVENTS_PAGE_SIZE = 100;

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDayEvents, setSelectedDayEvents] = useState<CalendarEvent[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  // Helper: Return only today and upcoming events
  function filterUpcomingEvents(eventList: CalendarEvent[]) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventList.filter(ev => ev.start >= today);
  }

  // Fetch events from Firestore
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      const eventList: CalendarEvent[] = [];
      try {
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
          } else if (typeof data.startdate === "string") {
            start = new Date(data.startdate);
          } else if (data.date && data.time) {
            start = new Date(`${data.date}T${data.time}:00`);
          } else if (data.date) {
            start = new Date(data.date);
          } else {
            start = new Date();
          }

          if (data.enddate && typeof data.enddate.toDate === "function") {
            end = data.enddate.toDate();
          } else if (typeof data.enddate === "string") {
            end = new Date(data.enddate);
          } else {
            end = start;
          }

          eventList.push({
            id: doc.id,
            title: data.title,
            start,
            end,
          });
        });

        const filteredEvents = filterUpcomingEvents(eventList);
        setEvents(filteredEvents);
      } catch {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Get events for a single calendar day (ignoring time)
  function getEventsForDay(date: Date) {
    return events.filter(ev =>
      ev.start.getFullYear() === date.getFullYear() &&
      ev.start.getMonth() === date.getMonth() &&
      ev.start.getDate() === date.getDate()
    );
  }

  // Handle day click on calendar
  function handleSelectSlot(slotInfo: { start: Date }) {
    const dayEvts = getEventsForDay(slotInfo.start);
    if (dayEvts.length > 0) {
      setSelectedDate(slotInfo.start);
      setSelectedDayEvents([...dayEvts].sort((a, b) => a.start.getTime() - b.start.getTime()));
      setModalOpen(true);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden">
      {/* Background Glow */}
      <div className="fixed bottom-[-200px] left-1/2 transform -translate-x-1/2 w-[1000px] h-[600px] bg-purple-600 opacity-30 blur-[200px] rounded-full z-0" />
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 z-0">
        <Image
          src="/images/image1.png"
          alt="Background Hero"
          width={1550}
          height={800}
          className="w-[1550px] max-w-none object-contain pointer-events-none select-none"
          priority
        />
      </div>
      <div className="z-10 w-full max-w-6xl px-5 md:px-8">
        <div className="backdrop-blur-md bg-transparent rounded-2xl border border-white/30 shadow-2xl p-6 md:p-10 mt-20">
          <h1 className="text-center text-4xl md:text-5xl font-bold leading-tight mb-6 bg-gradient-to-r from-pink-400 via-purple-500 to-sky-500 text-transparent bg-clip-text drop-shadow-md">
            My Calendar
          </h1>
          <div className="bg-transparent rounded-xl p-4 shadow-lg relative">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{
                height: 400,
                fontFamily: "Inter, sans-serif",
                fontSize: "0.9rem",
                fontWeight: "500"
              }}
              className="text-blue-400 custom-calendar-theme"
              eventPropGetter={() => ({
                style: {
                  backgroundColor: "rgba(168,139,250,0.7)",
                  color: "black",
                  borderRadius: "20px",
                  border: "none",
                  boxShadow: "0 1px 7px 0 rgba(168,139,250,0.9)",
                  textAlign: "center",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  fontStyle: "oblique",
                },
              })}
              popup
              selectable
              onSelectSlot={handleSelectSlot}
            />
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-20 rounded-xl">
                <div className="animate-spin border-4 border-purple-500 border-t-transparent rounded-full w-8 h-8" />
              </div>
            )}
            {/* Modal for day events */}
            {modalOpen && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full relative">
                  <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                    onClick={() => setModalOpen(false)}
                  >
                    ×
                  </button>
                  <h2 className="text-lg font-bold mb-4 text-center">
                    Events for {selectedDate && selectedDate.toLocaleDateString()}
                  </h2>
                  {selectedDayEvents.length === 0 ? (
                    <div className="text-center text-gray-500">No events.</div>
                  ) : (
                    <ul>
                      {selectedDayEvents.map((ev, i) => (
                        <li key={ev.id || i} className="mb-2">
                          <div className="font-semibold">{ev.title}</div>
                          <div className="text-sm text-gray-500">
                            {ev.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {ev.end > ev.start && (
                              <> – {ev.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
