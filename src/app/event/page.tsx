"use client";
import { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Toast component
function Toast({ msg, type, onClose }: { msg: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2200);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-md text-white shadow-lg z-50
      ${type === "success" ? "bg-green-700/90" : "bg-red-700/90"} animate-fade-in`}>
      {msg}
    </div>
  );
}

// Confirmation Modal
function ConfirmModal({ visible, onCancel, onConfirm }: { visible: boolean; onCancel: () => void; onConfirm: () => void }) {
  if (!visible) return null;
  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
    >
      <div className="bg-black rounded-xl shadow-lg p-7 border border-white/15 max-w-xs w-full text-center text-white relative">
        <button
          aria-label="Close modal"
          className="absolute top-2 right-4 text-white/60 hover:text-white text-xl"
          onClick={onCancel}
        >×</button>
        <div className="mb-2 text-2xl font-bold">Add Event?</div>
        <div className="mb-4 text-white/80 text-sm">
          Are you sure you want to add this event? This cannot be undone.
        </div>
        <div className="flex justify-center gap-4 mt-2">
          <button
            onClick={onCancel}
            aria-label="Cancel adding event"
            className="px-4 py-2 rounded bg-neutral-700 hover:bg-neutral-600 text-white/90"
          >Cancel</button>
          <button
            onClick={onConfirm}
            aria-label="Confirm adding event"
            className="px-4 py-2 rounded bg-gradient-to-r from-purple-500 via-sky-500 to-cyan-400 text-white font-bold hover:brightness-110 shadow"
          >Add</button>
        </div>
      </div>
    </div>
  );
}

export default function CreateEventPage() {
  const { user } = useUser();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  // Accessibility: autofocus on first input
  const titleRef = useRef<HTMLInputElement>(null);
  useEffect(() => { titleRef.current?.focus(); }, []);

  // Validation logic
  const validTitle = title.trim().length > 0;
  const validDate = !!date;
  const validTime = !!time;
  const eventDate = date && time ? new Date(`${date}T${time}:00`) : null;
  const isInFuture = eventDate ? eventDate.getTime() > Date.now() : false;
  const formValid = validTitle && validDate && validTime && isInFuture && user;

  // Prevent duplicate submits
  const [submitKey, setSubmitKey] = useState("");

  async function actuallySubmit() {
    if (!formValid) return;
    setLoading(true);
    setShowModal(false);
    try {
      setSubmitKey(""); // reset
      await addDoc(collection(db, "events"), {
        userId: user!.id,
        title: title.trim(), // <-- No length slice
        date,
        time,
        startdate: Timestamp.fromDate(eventDate!),
        enddate: Timestamp.fromDate(eventDate!),
        createdAt: serverTimestamp(),
      });
      setTitle("");
      setDate("");
      setTime("");
      setShowToast({ msg: "Event added!", type: "success" });
      setTimeout(() => router.push("/calendar"), 1500); // softer redirect
    } catch (error) {
      console.error("Error adding event:", error);
      setShowToast({ msg: "Failed to add event.", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formValid || loading || submitKey === date+time+title) return;
    setSubmitKey(date+time+title);
    setShowModal(true);
  }

  if (!user)
    return (
      <main className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center text-lg">
          Please sign in to create events.
        </div>
      </main>
    );

  return (
    <main className="relative w-full min-h-screen flex items-center justify-center bg-black overflow-hidden p-6">
      {/* Glowing background ellipse */}
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
      {/* Toast */}
      {showToast && (
        <Toast
          msg={showToast.msg}
          type={showToast.type}
          onClose={() => setShowToast(null)}
        />
      )}
      {/* Confirmation modal */}
      <ConfirmModal
        visible={showModal}
        onCancel={() => { setShowModal(false); setSubmitKey(""); }}
        onConfirm={actuallySubmit}
      />
      {/* The Form */}
      <form
        onSubmit={handleFormSubmit}
        className="
          relative 
          bg-white/10 
          backdrop-blur-md 
          border border-white/20 
          text-white 
          p-7 
          rounded-xl 
          shadow-xl 
          w-full max-w-md z-20
          animate-fade-in-up 
          transition-shadow
          hover:shadow-2xl
          focus-within:shadow-purple-700/30
        "
        aria-labelledby="create-event-heading"
        tabIndex={0}
      >
        <h2
          id="create-event-heading"
          className="text-2xl font-semibold mb-6 text-center bg-gradient-to-r from-pink-400 via-purple-400 to-sky-400 bg-clip-text text-transparent"
        >
           Create New Event
        </h2>
        {/* --- Title --- */}
        <div className="mb-5 p-[2px] rounded-md bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-400 transition-all duration-300">
          <input
            ref={titleRef}
            type="text"
            aria-label="Event Title"
            placeholder="Event Title"
            value={title}
            autoComplete="off"
            onChange={e => setTitle(e.target.value)}
            className="
              bg-black w-full rounded-md p-3 text-white placeholder-white/60
              focus:outline-none focus:ring-2 focus:ring-purple-400 border-none
              text-base"
            required
            style={{ color: "#fff", caretColor: "#93c5fd" }}
          />
        </div>
        {/* --- Date --- */}
        <div className="mb-5 p-[2px] rounded-md bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-400 transition-all duration-300">
          <input
            aria-label="Event Date"
            type="date"
            placeholder="Event Date"
            value={date}
            min={new Date().toISOString().slice(0, 10)}
            onChange={e => setDate(e.target.value)}
            className="
              bg-black w-full rounded-md p-3 text-white placeholder-white/60
              focus:outline-none focus:ring-2 focus:ring-cyan-400 border-none"
            required
            style={{ color: "#fff" }}
          />
        </div>
        {/* --- Time --- */}
        <div className="mb-5 p-[2px] rounded-md bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-400 transition-all duration-300">
          <input
            aria-label="Event Time"
            type="time"
            placeholder="Event Time"
            value={time}
            onChange={e => setTime(e.target.value)}
            className="
              bg-black w-full rounded-md p-3 text-white placeholder-white/60
              focus:outline-none focus:ring-2 focus:ring-cyan-400 border-none"
            required
            style={{ color: "#fff" }}
          />
        </div>
        {/* --- Validation errors --- */}
        <div className="text-rose-300 text-sm mb-2 min-h-[1em]" aria-live="polite" role="status">
          {!validTitle && title.length > 0 && "Title required."}
          {validTitle && date && time && !isInFuture && "Please enter a future date and time."}
        </div>
        {/* --- Submit button and spinner overlay --- */}
        <div className="p-[2px] rounded-xl bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 mt-3">
          <button
            type="submit"
            disabled={!formValid || loading}
            aria-label="Submit event"
            className={`
              w-full px-4 py-2 rounded-xl text-lg font-semibold
              bg-black text-purple-100
              hover:bg-gradient-to-r hover:from-purple-600 hover:via-sky-400 hover:to-cyan-400 
              hover:text-white
              transition-all duration-200
              shadow-[0_0_10px_rgba(192,132,252,0.3)] 
              hover:shadow-[0_0_25px_rgba(192,132,252,0.7)]
              border-none
              disabled:opacity-60 disabled:cursor-not-allowed
              focus:outline-none focus:ring-2 focus:ring-sky-400
              `}
            style={{ color: loading ? "#a3e635" : undefined, backgroundColor: loading ? "#020617" : undefined }}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-cyan-300"
                  viewBox="0 0 24 24"
                >
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
                Adding…
              </span>
            ) : (
              "Add Event"
            )}
          </button>
        </div>
        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center z-30" aria-hidden>
            <span className="text-cyan-200 text-2xl font-semibold animate-pulse">Saving Your Event…</span>
          </div>
        )}
      </form>
    </main>
  );
}
