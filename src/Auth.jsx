import React, { useEffect, useState } from "react";
import api, { createSession } from "./api";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const nav = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [errM, setErrM] = useState();
  const [loading, setLoading] = useState(false);

  // Auth states
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ============================================
  // AUTH SUBMIT — BACKENDGA ULANGAN QISMI
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrM(null);
    setLoading(true); // <-- loading boshlandi

    try {
      if (isRegister) {
        // ============= REGISTER REQUEST =============
        // Backend should return:
        // {
        //   access_token: "...",
        //   refresh_token: "...",
        //   user: {
        //     id: "...",
        //     username: "...",
        //     email: "...",
        //     is_new_user: true,
        //     premium_duration: "2025-01-17T...",  <- 5 days from now
        //     ...
        //   }
        // }
        const res = await api.post("/auth/register", {
          username,
          email,
          password,
        });

        localStorage.setItem("access_token", res.data.access_token);
        localStorage.setItem("refresh_token", res.data.refresh_token);

        // ✅ Register qilgandan keyin session yaratish
        try {
          await createSession();
        } catch (sessionErr) {
          console.warn("Session creation failed - user may not appear in device list:", sessionErr);
          // Non-critical: user is authenticated even if session wasn't tracked
        }

        nav("/dashboard");

      }

      else {
        // ============= LOGIN REQUEST =============
        const res = await api.post("/auth/login", {
          email,
          password,
        });

        localStorage.setItem("access_token", res.data.access_token);
        localStorage.setItem("refresh_token", res.data.refresh_token);

        // ✅ Login qilgandan keyin session yaratish
        try {
          await createSession();
        } catch (sessionErr) {
          console.warn("Session creation failed - user may not appear in device list:", sessionErr);
          // Non-critical: user is authenticated even if session wasn't tracked
        }

        nav("/dashboard");
      }
    } catch (err) {
      console.log(err);
      setErrM(err.response?.data?.detail || "Something went wrong.");
    } finally {
      setLoading(false); // <-- har doim loading false qilinadi
    }
  };

  // ============================================
  // FORGOT PASSWORD — O‘Z HOLICHA QOLDI
  // ============================================

  const [step, setStep] = useState(1);
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleCheckEmail = (e) => {
    e.preventDefault();

    if (!resetEmail.includes("@")) {
      alert("Email not found!");
      return;
    }

    const code = Math.floor(10000 + Math.random() * 90000).toString();
    setGeneratedCode(code);

    alert("5 xonali kod emailga yuborildi (fake): " + code);

    setStep(2);
  };

  const handleVerifyCode = (e) => {
    e.preventDefault();

    if (resetCode === generatedCode) {
      setStep(3);
    } else {
      alert("Kod noto‘g‘ri!");
    }
  };

  const handleNewPassword = (e) => {
    e.preventDefault();

    if (newPassword.length < 5) {
      alert("Parol juda qisqa!");
      return;
    }

    alert("Parol o‘zgartirildi! Endi login qiling.");
    setIsForgot(false);
    setStep(1);
  };

useEffect(() => {
  // 1️⃣ Google OAuth'dan qaytganda
  const params = new URLSearchParams(window.location.search);
  const access = params.get("access");
  const refresh = params.get("refresh");

  if (access && refresh) {
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    nav("/dashboard");
    return;
  }

  // 2️⃣ Oddiy login bo‘lsa
  const access_token = localStorage.getItem("access_token");
  if (access_token) {
    api.get("/user/me")
      .then(res => {
        if (res.status === 200) {
          nav("/dashboard");
        }
      })
      .catch(err => {
        console.log(err);
      });
  }
}, []);


  // ============================================
  // UI
  // ============================================
  const renderForgotBox = () => (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 md:p-10">
      {/* BACK BUTTON */}
      <button
        onClick={() => {
          setIsForgot(false);
          setStep(1);
          setResetEmail("");
          setResetCode("");
          setNewPassword("");
        }}
        className="mb-6 text-indigo-600 hover:text-indigo-700 font-semibold text-sm flex items-center gap-2"
      >
        ← Back to Login
      </button>

      <h2 className="text-3xl font-bold text-slate-800 mb-2">
        🔑 Reset Password
      </h2>
      <p className="text-slate-500 text-sm mb-8">
        {step === 1 && "Enter your email to receive a code"}
        {step === 2 && "Enter the verification code"}
        {step === 3 && "Create your new password"}
      </p>

      {/* PROGRESS BAR */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map(s => (
          <div key={s} className={`h-1 flex-1 rounded-full transition-all ${s <= step ? 'bg-indigo-500' : 'bg-gray-200'}`}></div>
        ))}
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <form onSubmit={handleCheckEmail} className="space-y-4">
          <input
            type="email"
            placeholder="your.email@example.com"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            required
          />
          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-all"
          >
            Send Code
          </button>
        </form>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <input
            type="text"
            placeholder="00000"
            maxLength={5}
            value={resetCode}
            onChange={(e) => setResetCode(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-center text-2xl tracking-widest font-bold"
            required
          />
          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-all"
          >
            Verify Code
          </button>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="w-full py-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
          >
            Change email
          </button>
        </form>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <form onSubmit={handleNewPassword} className="space-y-4">
          <input
            type="password"
            placeholder="New password (min 5 characters)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            required
          />
          <button
            type="submit"
            className="w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all"
          >
            Save New Password
          </button>
          <button
            type="button"
            onClick={() => setStep(2)}
            className="w-full py-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
          >
            Back to verification
          </button>
        </form>
      )}
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center px-4 py-8">
      <title>MockStream: Auth</title>

      {isForgot ? (
        renderForgotBox()
      ) : (
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 md:p-10">
          {/* LOGO */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-2xl">
              📚
            </div>
          </div>

          {/* TITLE & SUBTITLE */}
          <h1 className="text-3xl font-bold text-slate-800 text-center mb-2">
            {isRegister ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="text-slate-500 text-center text-sm mb-8">
            {isRegister ? "Join our learning community" : "Sign in to continue"}
          </p>

          {/* ERROR MESSAGE */}
          {errM && (
            <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-lg flex items-start gap-3">
              <span className="text-xl">⚠️</span>
              <span className="text-red-700 text-sm">{errM}</span>
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                required
              />
            )}

            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
              required
            />

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  {isRegister ? "Create Account" : "Sign In"}
                  <span>→</span>
                </>
              )}
            </button>
          </form>

          {/* DIVIDER */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-gray-500 text-xs">OR</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* GOOGLE LOGIN */}
          <button
            onClick={() => {
              window.location.href = "https://english-server-p7y6.onrender.com/auth/google/login";
            }}
            className="w-full flex items-center justify-center gap-3 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-all font-semibold"
          >
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              className="w-5 h-5"
            />
            Continue with Google
          </button>


          {/* FOOTER */}
          <div className="space-y-3 text-center">
            {!isRegister && (
              <button
                type="button"
                onClick={() => {
                  setIsForgot(true);
                  setStep(1);
                }}
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium hover:underline block w-full"
              >
                🔑 Forgot password?
              </button>
            )}

            <p className="text-slate-600 text-sm">
              {isRegister ? "Already have an account? " : "Don't have an account? "}
              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="text-indigo-600 font-bold hover:text-indigo-700 hover:underline"
              >
                {isRegister ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </div>

          {/* BOTTOM TEXT */}
          <p className="text-center text-gray-500 text-xs mt-6 border-t border-gray-200 pt-4">
            🌍 MockStream - Learn English with Confidence
          </p>
        </div>
      )}
    </div>
  );
}
