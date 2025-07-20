"use client";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import React, { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase"; 

export default function Navbar() {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("Your Firebase UID is:", user.uid);
      } else {
        console.log("No user is signed in.");
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full flex justify-between items-center px-8 py-4 text-white z-50 bg-transparent ">
      <Link href="/" className="text-lg font-bold cursor-pointer">
        Campus Copilot
      </Link>
      <ul className="flex items-center gap-5 text-sm sm:text-base font-small">
        <li className="hover:text-[#6c47ff] cursor-pointer">
          <Link href="/dashboard">Dashboard</Link>
        </li>
        <li className="hover:text-[#6c47ff] cursor-pointer">
          <Link href="/event">Events</Link>
        </li>
        <li className="hover:text-[#6c47ff] cursor-pointer">
          <Link href="/notices">Notices</Link>
        </li>
        <li className="hover:text-[#6c47ff] cursor-pointer">
          <Link href="/calendar">Calendar</Link>
        </li>
        <li className="hover:text-[#6c47ff] cursor-pointer">
          <Link href="/aboutUs">About Us</Link>
        </li>
      </ul>
      <div className="flex items-center gap-4">
        <SignedOut>
          <SignInButton>
            <button className="bg-[#6c47ff] hover:bg-[#5a38e6] transition-colors text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton>
            <button className="bg-[#6c47ff] hover:bg-[#5a38e6] transition-colors text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
              Sign Up
            </button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </div>
  );
}
