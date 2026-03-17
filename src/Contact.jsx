import React, { useState } from "react";
import { FaTelegramPlane } from "react-icons/fa";
import api from "./api";

export default function Contact() {
  const adminUsername = "mrkhasanoff3"; // <--- o'zing o'zgartirasan

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    api.post("/contact", { full_name: fullName, email, message }).then(res => {
      if (res.status === 200) {
        alert("Message sent! Wait for answer...");
      }
    }).catch(err => {
      alert("Message sent! Wait for answer...");
    })
    e.preventDefault();
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-t from-blue-500 to-cyan-400 flex items-center justify-center px-4">
      <title>MockStream: Contact</title>

      <div className="w-full sm:w-2/3 md:w-1/2 lg:w-1/3 bg-white/20 backdrop-blur-md p-6 rounded-xl shadow-lg border border-white/50">

        <h2 className="text-white text-3xl font-bold text-center mb-4 drop-shadow">
          Contact Us
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Full Name */}
          <div className="flex flex-col text-white">
            <label className="mb-1">Full Name</label>
            <input
              type="text"
              className="p-2 rounded bg-white/70 text-black"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              required
            />
          </div>

          {/* Email */}
          <div className="flex flex-col text-white">
            <label className="mb-1">Email</label>
            <input
              type="email"
              className="p-2 rounded bg-white/70 text-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>

          {/* Message */}
          <div className="flex flex-col text-white">
            <label className="mb-1">Message</label>
            <textarea
              rows={4}
              className="p-2 rounded bg-white/70 text-black resize-none"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Your message..."
              required
            ></textarea>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 transition text-white py-2 rounded-lg shadow-md active:scale-95"
          >
            Send Message
          </button>
        </form>

        {/* OR separator */}
        <div className="flex items-center my-4">
          <div className="flex-grow h-[1px] bg-white/40"></div>
          <span className="text-white/80 px-3">OR</span>
          <div className="flex-grow h-[1px] bg-white/40"></div>
        </div>

        {/* Telegram contact */}
        <a
          href={`https://t.me/${adminUsername}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg shadow-md transition active:scale-95"
        >
          <FaTelegramPlane size={22} />
          Telegram orqali bog‘lanish
        </a>

      </div>
    </div>
  );
}
