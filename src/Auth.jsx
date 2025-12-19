import React, { useEffect, useState } from "react";
import api from "./api";
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
        const res = await api.post("/auth/register", {
          username,
          email,
          password,
        });

        localStorage.setItem("access_token", res.data.access_token);
        localStorage.setItem("refresh_token", res.data.refresh_token);

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

  useEffect(()=>{
    const access_token = localStorage.getItem("access_token")
    if(access_token){
      api.get("/user/me").then(res=>{
        if(res.status === 200){
          nav("/dashboard")
        }
      }).catch(err=>{
        console.log(err);
      })
    }
  },[])

  // ============================================
  // UI
  // ============================================
  const renderForgotBox = () => (
    <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-md">
      <h2 className="text-3xl font-bold text-center text-slate-800 mb-6">
        Forgot Password
      </h2>

      {step === 1 && (
        <form onSubmit={handleCheckEmail} className="flex flex-col gap-5">
          <input
            type="email"
            placeholder="Enter your email"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            className="px-4 py-3 border rounded-xl"
            required
          />

          <button
            type="submit"
            className="px-4 py-3 bg-blue-500 text-white rounded-xl"
          >
            Send Code
          </button>

          <p className="text-blue-500 text-center" onClick={() => setIsForgot(false)}>
            Back to login
          </p>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyCode} className="flex flex-col gap-5">
          <input
            type="text"
            placeholder="Enter 5-digit code"
            maxLength={5}
            value={resetCode}
            onChange={(e) => setResetCode(e.target.value)}
            className="px-4 py-3 border rounded-xl text-center text-lg tracking-[0.3em]"
            required
          />

          <button
            type="submit"
            className="px-4 py-3 bg-blue-500 text-white rounded-xl"
          >
            Verify Code
          </button>

          <p className="text-blue-500 text-center" onClick={() => setStep(1)}>
            Back
          </p>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleNewPassword} className="flex flex-col gap-5">
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="px-4 py-3 border rounded-xl"
            required
          />

          <button
            type="submit"
            className="px-4 py-3 bg-blue-500 text-white rounded-xl"
          >
            Save Password
          </button>

          <p className="text-blue-500 text-center" onClick={() => setIsForgot(false)}>
            Back to login
          </p>
        </form>
      )}
    </div>
  );

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-400 to-cyan-500 px-4">
      <title>MockStream: Auth</title>

      {isForgot ? (
        renderForgotBox()
      ) : (
        <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-md">
          <span className="text-red-600">{errM ? errM : null}</span>

          <h2 className="text-3xl font-bold text-center text-slate-800 mb-6">
            {isRegister ? "Register" : "Login"}
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {isRegister && (
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="px-4 py-3 border rounded-xl"
                required
              />
            )}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-3 border rounded-xl"
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-4 py-3 border rounded-xl"
              required
            />

            <button
              
              type="submit"
              className={`px-4 py-3 bg-blue-500 text-white rounded-xl ${loading? "opacity-50" : null} flex items-center justify-center gap-5`}
            >
              {loading? <div className={`w-5 h-5 rounded-full border-2 border-white border-b-0 border-l-0 animate-spin`}></div> : null}
              {isRegister ? "Sign Up" : "Sign In"}
            </button>
          </form>

          <p className="text-sm text-center text-slate-500 mt-4">
            {!isRegister && (
              <span
                className="text-blue-600 cursor-pointer"
                onClick={() => {
                  setIsForgot(true);
                  setStep(1);
                }}
              >
                Forgot password?
                <br />
                <br />
              </span>
            )}

            {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
            <span
              className="text-blue-500 cursor-pointer font-semibold"
              onClick={() => setIsRegister(!isRegister)}
            >
              {isRegister ? "Login" : "Register"}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
