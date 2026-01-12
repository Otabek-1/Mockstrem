import React, { useState, useEffect } from "react";
import { Clock, AlertCircle, X, ArrowRight, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PremiumRenewalModal({ onClose, daysLeft }) {
  const navigate = useNavigate();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
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

  return (
    <div
      className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${
        isAnimating ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-500 ${
          isAnimating ? "scale-100 translate-y-0" : "scale-90 translate-y-8"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X size={24} className="text-gray-600" />
        </button>

        {/* Content */}
        <div className="p-8 md:p-10">
          {/* Header Icon */}
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-amber-100 rounded-full animate-pulse">
              <Clock size={48} className="text-amber-600" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-2">
            Time's Running Out!
          </h1>

          {/* Alert Box */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6 mb-8">
            <div className="flex gap-3 mb-4">
              <AlertCircle size={28} className="text-amber-600 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-600 mb-1">Premium Period Ending</p>
                <p className="text-2xl font-bold text-amber-700">
                  {daysLeft} {daysLeft === 1 ? "day" : "days"} left
                </p>
              </div>
            </div>

            <p className="text-gray-700 text-sm">
              Your premium subscription will expire soon. Continue enjoying all
              the benefits that help you master English!
            </p>
          </div>

          {/* Benefits Reminder */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 mb-8">
            <p className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Heart size={20} className="text-red-500" />
              Don't miss out on:
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✓ Unlimited mock tests</li>
              <li>✓ Detailed AI feedback</li>
              <li>✓ Performance analytics</li>
              <li>✓ Certificate of completion</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleNavigateToPlan}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              <span>Renew Premium</span>
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>

            <button
              onClick={handleClose}
              className="w-full text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-100 transition-colors duration-300"
            >
              Continue with Free Access
            </button>
          </div>

          {/* Footer */}
          <p className="text-center text-gray-500 text-xs mt-6">
            Upgrade now and enjoy uninterrupted learning!
          </p>
        </div>
      </div>
    </div>
  );
}
