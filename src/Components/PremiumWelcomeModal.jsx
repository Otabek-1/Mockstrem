import React, { useState, useEffect } from "react";
import { Gift, Zap, Check, X, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PremiumWelcomeModal({ onClose, user }) {
  const navigate = useNavigate();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Animation trigger
    setTimeout(() => setIsAnimating(true), 100);
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleNavigateToPlan = () => {
    onClose();
    navigate("/plans");
  };

  const handleClose = () => {
    onClose();
  };

  const features = [
    "Unlimited mock tests",
    "AI-powered feedback",
    "Advanced analytics",
    "Priority support",
    "Certificate included",
  ];

  return (
    <div
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${
        isAnimating ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-500 ${
          isAnimating ? "scale-100 translate-y-0" : "scale-90 translate-y-8"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
        >
          <X size={24} className="text-white" />
        </button>

        {/* Content */}
        <div className="p-8 md:p-10 text-white">
          {/* Header Icon */}
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white/20 rounded-full animate-bounce">
              <Gift size={48} />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">
            Welcome! 🎉
          </h1>
          <p className="text-center text-white/80 mb-8">
            Hello{" "}
            <span className="font-semibold text-white">
              {user?.username || "user"}
            </span>
            , we have a special gift for you!
          </p>

          {/* Premium Offer Box */}
          <div className="bg-white/10 border border-white/30 rounded-xl p-6 mb-8 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Zap size={32} className="text-yellow-300" />
              <div>
                <p className="text-sm text-white/70">FREE PREMIUM ACCESS</p>
                <p className="text-3xl font-bold text-white">5 Days</p>
              </div>
            </div>

            <p className="text-center text-white/80 text-sm mb-4">
              Enjoy all premium features absolutely free for the next 5 days!
            </p>

            {/* Premium Days Countdown */}
            <div className="bg-white/10 rounded-lg p-3 text-center mb-4">
              <p className="text-xs text-white/60 mb-1">Premium Period</p>
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-yellow-300">Day 1</span>
                <div className="flex-1 mx-3 bg-white/20 rounded-full h-2">
                  <div className="bg-gradient-to-r from-yellow-300 to-pink-300 h-2 rounded-full w-1/5"></div>
                </div>
                <span className="text-xl font-bold text-white/60">Day 5</span>
              </div>
            </div>
          </div>

          {/* Features List */}
          <div className="space-y-3 mb-8">
            <p className="text-sm font-semibold text-white/80 mb-4">
              What You'll Get:
            </p>
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="p-1 bg-white/20 rounded-full">
                  <Check size={16} className="text-green-300" />
                </div>
                <span className="text-sm text-white/90">{feature}</span>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleNavigateToPlan}
              className="w-full bg-white text-purple-600 font-bold py-3 rounded-lg hover:bg-white/90 transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              <span>See All Plans</span>
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>

            <button
              onClick={handleClose}
              className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-3 rounded-lg transition-colors duration-300 border border-white/30"
            >
              Start Exploring
            </button>
          </div>

          {/* Footer Text */}
          <p className="text-center text-white/60 text-xs mt-6">
            Your premium access will expire in 5 days.
            <br />
            We'll remind you before it ends!
          </p>
        </div>
      </div>
    </div>
  );
}
