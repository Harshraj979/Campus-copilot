"use client";
import { useState, useEffect, useRef } from "react";
import emailjs from "@emailjs/browser";
import Image from "next/image";

// Loading skeleton for images
function SocialImage({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="flex items-center justify-center rounded-full bg-white/10 backdrop-blur w-14 h-14 mb-1 shadow">
      {!loaded && (
        <div className="w-8 h-8 bg-white/20 animate-pulse rounded-full" />
      )}
      <Image
        src={src}
        alt={alt}
        width={32}
        height={32}
        draggable={false}
        className={`w-8 h-8 object-contain transition-opacity duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}

const SOCIAL_LINKS = [
  {
    label: "GitHub",
    url: "https://github.com/Harshraj979",
    iconPath: "/images/github.png",
  },
  {
    label: "Gmail",
    url: "mailto:hr5300439@gmail.com",
    iconPath: "/images/gmail.png",
  },
  {
    label: "Instagram",
    url: "https://www.instagram.com/harshraj_979/?hl=en",
    iconPath: "/images/insta.png",
  },
  {
    label: "Linkedin",
    url: "https://www.linkedin.com/in/harsh-raj-2aa866320/",
    iconPath: "/images/linkedin.png",
  },
];

function emailValid(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function validateForm(form: { name: string; email: string; message: string }) {
  return (
    form.name.trim().length > 1 &&
    emailValid(form.email) &&
    form.message.trim().length > 5
  );
}

// ------ Toast component ------
function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) {
  useEffect(() => {
    const id = setTimeout(onClose, 3000);
    return () => clearTimeout(id);
  }, [onClose]);
  return (
    <div
      className={`fixed bottom-6 left-1/2 px-6 py-3 rounded-lg shadow-lg transition-all z-50
        ${
          type === "success"
            ? "bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 text-white"
            : "bg-gray-900 text-pink-200 border border-pink-400"
        }`}
      style={{ transform: "translateX(-50%)" }}
      role="alert"
    >
      {message}
    </div>
  );
}

export default function AboutPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<null | { msg: string; type: "success" | "error" }>(null);

  // Reset toast as soon as user types again (success or error)
  useEffect(() => {
    setToast(null);
  }, [form]);

  const isValid = validateForm(form);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      setToast({ msg: "Please fill all fields with valid data.", type: "error" });
      return;
    }
    setSubmitting(true);
    emailjs
      .send(
        "service_vq43ovi",
        "template_ixyd1ak",
        form,
        "i3iuOFxfRpH-z6eoG"
      )
      .then(
        () => {
          setSubmitting(false);
          setForm({ name: "", email: "", message: "" });
          setToast({ msg: "Thank you! We'll be in touch soon.", type: "success" });
        },
        (error) => {
          setSubmitting(false);
          setToast({ msg: "Sending failed! Please try again later.", type: "error" });
          console.error("EmailJS error:", error);
        }
      );
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden p-6">
      {/* Background Glow */}
      <div className="fixed bottom-[-200px] left-1/2 transform -translate-x-1/2 w-[1000px] h-[600px] bg-purple-600 opacity-30 blur-[200px] rounded-full z-0" />
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none select-none">
        <Image
          src="/images/image1.png"
          alt="About Page Decoration"
          width={1550}
          height={800}
          className="w-[1550px] max-w-none object-contain"
          priority
        />
      </div>

      <div className="z-20 w-full max-w-2xl mx-auto bg-white/10 p-8 rounded-2xl shadow-xl backdrop-blur-lg border border-white/15 mt-16">
        <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-pink-400 via-purple-500  to-cyan-500 text-transparent bg-clip-text">
          About Campus Copilot
        </h1>
        <p className="text-white text-opacity-80 text-center mt-4">
          Campus Copilot is your all-in-one student productivity dashboard—designed and built by students, for students.
        </p>
        <div className="mt-8 flex flex-col items-center">
          <h2 className="text-2xl font-semibold mb-4 text-purple-300">
            Connect With Us
          </h2>
          <div className="flex gap-6 mb-6">
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center transition hover:scale-105"
              >
                <SocialImage src={link.iconPath} alt={`${link.label} Icon`} />
                <span className="mt-1 text-sm text-white">{link.label}</span>
              </a>
            ))}
          </div>
        </div>
        <div className="mt-10">
          <h3 className="text-xl font-semibold mb-2 text-center text-cyan-300">
            Contact Us
          </h3>
          <p className="text-sm text-white/80 mb-2 text-center">
            Have feedback, questions or partnership ideas? Fill out the form below:
          </p>
          <form className="space-y-4" onSubmit={handleSubmit} autoComplete="off" noValidate>
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-xs font-medium text-white mb-1">Name</label>
                <input
                  name="name"
                  type="text"
                  required
                  maxLength={40}
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                  className="w-full rounded-lg px-4 py-2 bg-black/70 text-white placeholder-white/50 border border-purple-500 focus:ring-2 focus:ring-purple-700 outline-none"
                />
              </div>
              <div className="w-1/2">
                <label className="block text-xs font-medium text-white mb-1">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Your Email"
                  className="w-full rounded-lg px-4 py-2 bg-black/70 text-white placeholder-white/50 border border-pink-500 focus:ring-2 focus:ring-pink-700 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-white mb-1">Message</label>
              <textarea
                name="message"
                required
                maxLength={500}
                value={form.message}
                onChange={handleChange}
                placeholder="Your Message"
                className="w-full rounded-lg px-4 py-2 bg-black/70 text-white placeholder-white/50 border border-cyan-500 focus:ring-2 focus:ring-cyan-700 outline-none resize-none min-h-[80px]"
              />
            </div>
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={submitting || !validateForm(form)}
                className="bg-black border-2 border-purple-500 rounded-xl px-8 py-2 text-lg font-bold text-purple-500 shadow transition disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-purple-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  "Send"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* Toast Overlay */}
      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </main>
  );
}
