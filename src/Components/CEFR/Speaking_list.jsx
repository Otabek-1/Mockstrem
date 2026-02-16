import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from "../../api";

export default function SpeakingList({ isPremium = false }) {
  const navigate = useNavigate();
  const [mockData, setMockData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMocks = async () => {
      try {
        setLoading(true);
        const response = await api.get("/mock/speaking/all").catch((err) => {
          alert("Error loading speaking mocks. Please reload or contact support.");
          throw err;
        });
        // API returns array of mocks
        setMockData(Array.isArray(response.data) ? response.data : []);
        setError(null);
      } catch (err) {
        console.error("[SpeakingList] Failed to fetch mocks:", err);
        setError("Failed to load speaking mocks. Please try again later.");
        setMockData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMocks();
  }, []);

  return (
    <div className="w-full min-h-screen flex flex-col items-start gap-5 p-6 bg-gradient-to-br from-gray-50/50 to-gray-100/50 dark:from-gray-900/50 dark:to-gray-800/50">
      <h3 className="text-4xl font-bold text-gray-800 dark:text-white">CEFR Speaking Mocks</h3>

      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-lg p-5 flex flex-col gap-5">
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-800 dark:text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && mockData.length === 0 && (
          <div className="text-center py-12 text-gray-600 dark:text-gray-400">
            <p>No speaking mocks available</p>
          </div>
        )}

        {!loading && mockData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockData.map((mock,index) => {
              const canAccess = isPremium || index < 4;
              return (
              <Link
                key={mock.id}
                to={`/mock/cefr/speaking/${mock.id}`}
                onClick={(e) => {
                  if (!canAccess) {
                    e.preventDefault();
                    alert("Premium mock. Please upgrade to access this mock.");
                    navigate("/plans");
                  }
                }}
                className={[
                  "block p-5 bg-white dark:bg-gray-800 rounded-lg shadow-md transition-all border border-gray-200 dark:border-gray-700",
                  canAccess ? "hover:shadow-lg cursor-pointer hover:scale-[1.02] transform" : "opacity-60 cursor-not-allowed",
                ].join(" ")}
              >
                <h5 className="font-semibold text-gray-800 dark:text-white text-lg">
                  {`Speaking Mock ${index+1}`}
                </h5>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {mock.questions?.["1.1"]?.[0]?.question_text
                    ? `Sample: ${mock.questions["1.1"][0].question_text.substring(0, 60)}...`
                    : "Click to start speaking practice"}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full font-medium">
                    {mock.questions ? "8 Questions" : "Loading..."}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {canAccess ? "Free" : "Premium"}
                  </span>
                </div>
              </Link>
            )})}
          </div>
        )}
      </div>
    </div>
  );
}
