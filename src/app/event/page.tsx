"use client";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Image from "next/image"; // <-- Add this!

export default function CreateEventPage() {
  const { user } = useUser();
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const startISO = `${date}T${time}:00`;
      const startDate = new Date(startISO);

      await addDoc(collection(db, "events"), {
        userId: user.id,
        title,
        date,
        time,
        startdate: Timestamp.fromDate(startDate),
        enddate: Timestamp.fromDate(startDate),
        createdAt: serverTimestamp(),
      });

      setTitle("");
      setTime("");
      setDate("");
      alert("✅ Event added successfully!");
      router.push("/dashboard");
    } catch (error) {
      console.error("❌ Error adding event:", error);
      alert("Failed to add event.");
    } finally {
      setLoading(false);
    }
  };

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
      <form
        onSubmit={handleSubmit}
        className="
          relative 
          bg-white/10 
          backdrop-blur-md 
          border border-white/20 
          text-white 
          p-6 
          rounded-xl 
          shadow-xl 
          w-full max-w-md z-20
          animate-fade-in-up 
          transition-shadow
          hover:shadow-2xl
          focus-within:shadow-purple-700/30
        "
      >
        <h2 className="text-2xl font-semibold mb-4 text-center">
          📆 Create New Event
        </h2>
        <div className="mb-4 p-[2px] rounded-md bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-400 transition-all duration-300">
          <input
            type="text"
            placeholder="Event Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-black w-full rounded-md p-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 border-none"
            required
          />
        </div>
        <div className="mb-4 p-[2px] rounded-md bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-400 transition-all duration-300">
          <input
            type="date"
            placeholder="Event Date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-black w-full rounded-md p-3 text-white placeholder-white/60
                focus:outline-none focus:ring-2 focus:ring-purple-500 border-none"
            required
          />
        </div>
        <div className="mb-4 p-[2px] rounded-md bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-400 transition-all duration-300">
          <input
            type="time"
            placeholder="Event Time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="bg-black w-full rounded-md p-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 border-none"
            required
          />
        </div>
        <div className="p-[2px] rounded-xl bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 transition-all duration-300 mt-2">
          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              px-4 py-2
              rounded-xl
              text-lg font-semibold
              bg-black text-purple-300
              hover:bg-gradient-to-r
              hover:from-purple-600 hover:via-sky-400 hover:to-cyan-400 
              hover:text-white
              transition-all duration-300
              shadow-[0_0_10px_rgba(192,132,252,0.3)] 
              hover:shadow-[0_0_25px_rgba(192,132,252,0.7)]
              border-none
              disabled:opacity-60 disabled:cursor-not-allowed
              focus:outline-none
            "
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
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
                Adding...
              </span>
            ) : (
              "Add Event"
            )}
          </button>
        </div>
      </form>
    </main>
  );
}
