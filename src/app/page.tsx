import React from "react";
import Link from "next/link";
import Image from "next/image"; // Add this import

export default function Home() {
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex flex-col items-center justify-center px-6">
      {/* Glowing ellipse background */}
      <div className="absolute bottom-[-200px] left-1/2 transform -translate-x-1/2 w-[1000px] h-[600px] bg-purple-700 opacity-30 blur-[200px] rounded-full z-0" />

      {/* Hero content */}
      <div className="relative z-20 text-center text-white max-w-4xl mt-[-160px]">
        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6 bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 text-transparent bg-clip-text drop-shadow-md">
          A Fast & Smart Campus Assistant
        </h1>
        <p className="text-sm md:text-sm text-gray-300 mb-10">
          Campus Copilot helps students stay on top of classes, club events, notices, and deadlines — all in one place with calendar sync and smart reminders.
        </p>

        <div className="flex justify-center gap-6 flex-wrap">
          <Link href="/dashboard">
            <button className="px-4 py-2 rounded-xl text-lg font-semibold border border-purple-500 text-purple-300 bg-black hover:bg-gradient-to-r hover:from-purple-600 hover:via-pink-500 hover:to-purple-600 hover:text-white transition-all duration-300 shadow-[0_0_10px_rgba(192,132,252,0.3)] hover:shadow-[0_0_25px_rgba(192,132,252,0.7)] hover:animate-bounce">
              Get Started
            </button>
          </Link>
          <Link href="/event">
            <button className="px-4 py-2 rounded-xl text-lg font-semibold border border-purple-500 text-purple-300 bg-black hover:bg-gradient-to-r hover:from-purple-600 hover:via-pink-500 hover:to-purple-600 hover:text-white transition-all duration-300 shadow-[0_0_10px_rgba(192,132,252,0.3)] hover:shadow-[0_0_25px_rgba(192,132,252,0.7)] hover:animate-bounce">
              Create Schedule
            </button>
          </Link>
        </div>
      </div>

      {/* Hero Image */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 z-10">
        <Image
          src="/images/Home.png"
          alt="Hero"
          width={1100}
          height={600} // Adjust to actual image height if known
          className="w-[1100px] max-w-none object-contain pointer-events-none select-none"
          priority
        />
      </div>
    </div>
  );
}
