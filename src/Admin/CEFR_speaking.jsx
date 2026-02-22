import React, { useEffect, useState } from "react";
import { Pencil, Trash2, Plus, FileCheck } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api";

export default function CEFR_Speaking() {
  const [speaking, setSpeaking] = useState([]);
  const [userPermissions, setUserPermissions] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Current user va permissions olish
  const fetchUserAndPermissions = async () => {
    try {
      const userRes = await api.get("/user/me");
      const userId = userRes.data.id;

      const permRes = await api.get(`/permissions/${userId}`);
      console.log("User permissions:", permRes.data);

      if (permRes.data.data !== "not_added") {
        setUserPermissions(permRes.data.data.permissions);
      } else {
        setUserPermissions({
          users: [],
          cefr: {
            reading: [],
            listening: [],
            speaking: [],
            writing: []
          }
        });
      }
    } catch (err) {
      console.error("Error fetching permissions:", err);
      setUserPermissions({
        users: [],
        cefr: {
          reading: [],
          listening: [],
          speaking: [],
          writing: []
        }
      });
    } finally {
      setLoading(false);
    }
  };

  function getMocks() {
    api.get("/mock/speaking/all")
      .then(res => {
        setSpeaking(res.data);
      })
      .catch(err => {
        console.log(err);
      });
  }

  const deleteSpeaking = async (id) => {
    // ✅ Permission check
    if (!hasPermission("update_delete")) {
      alert("You don't have permission to delete speaking mocks");
      return;
    }

    api.delete(`/mock/speaking/delete/${id}`)
      .then(res => {
        if (res.status === 200) {
          alert("Deleted successfully.");
          getMocks();
        }
      })
      .catch(err => {
        console.log(err);
        alert("Error in deleting mock. (See console)");
      });
  };

  // ✅ Permission check function
  const hasPermission = (permission) => {
    if (!userPermissions) return false;
    return userPermissions.cefr?.speaking?.includes(permission) || false;
  };

  // ✅ Check if user has any speaking permissions
  const hasAnySpeakingPermission = () => {
    if (!userPermissions) return false;
    return userPermissions.cefr?.speaking?.length > 0;
  };

  useEffect(() => {
    fetchUserAndPermissions();
    getMocks();
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-white/10 border-t-violet-500 mx-auto mb-3" />
          <p className="text-gray-400">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">CEFR Speaking</h1>

      {!hasAnySpeakingPermission() && (
        <div className="bg-amber-500/15 border border-amber-500/30 text-amber-200 p-4 rounded-xl mb-6">
          <p className="font-semibold">⚠️ Cheklangan kirish</p>
          <p className="text-sm text-white/80 mt-1">Speaking mocklarni boshqarish ruxsati yo&apos;q. Administrator bilan bog&apos;laning.</p>
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 mb-6">
        <h2 className="text-lg font-semibold text-white mb-3">Yangi speaking</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            to={hasPermission("add") ? "/mock/cefr/speaking/form" : "#"}
            onClick={(e) => {
              if (!hasPermission("add")) {
                e.preventDefault();
                alert("Yangi speaking qo&apos;shish ruxsati yo&apos;q");
              }
            }}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition ${
              hasPermission("add")
                ? "bg-violet-600 text-white hover:bg-violet-500"
                : "bg-white/10 text-gray-500 cursor-not-allowed opacity-60"
            }`}
          >
            <Plus className="w-4 h-4" /> Add
          </Link>
          <Link
            to={hasPermission("check_result") ? "/mock/cefr/speaking/check-list" : "#"}
            target="_blank"
            onClick={(e) => {
              if (!hasPermission("check_result")) {
                e.preventDefault();
                alert("Mocklarni tekshirish ruxsati yo&apos;q");
              }
            }}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition ${
              hasPermission("check_result")
                ? "bg-cyan-600 text-white hover:bg-cyan-500"
                : "bg-white/10 text-gray-500 cursor-not-allowed opacity-60"
            }`}
          >
            <FileCheck className="w-4 h-4" /> Check mocks
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
        <h2 className="text-lg font-semibold text-white px-5 py-4 border-b border-white/10">Speaking ro&apos;yxati</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.04]">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Title</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Questions</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {speaking.map((s) => (
                <tr key={s.id} className="hover:bg-white/[0.04] transition-colors">
                  <td className="px-5 py-4 text-gray-200">{s.title}</td>
                  <td className="px-5 py-4 text-gray-400">8 Questions</td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={hasPermission("update_delete") ? `/mock/cefr/speaking/form?edit=true&id=${s.id}` : "#"}
                        onClick={(e) => {
                          if (!hasPermission("update_delete")) {
                            e.preventDefault();
                            alert("Tahrirlash ruxsati yo&apos;q");
                          }
                        }}
                        className={`inline-flex items-center justify-center w-9 h-9 rounded-lg transition ${
                          hasPermission("update_delete")
                            ? "bg-amber-500/30 text-amber-200 hover:bg-amber-500/40"
                            : "bg-white/10 text-gray-500 cursor-not-allowed opacity-60"
                        }`}
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => deleteSpeaking(s.id)}
                        disabled={!hasPermission("update_delete")}
                        className={`inline-flex items-center justify-center w-9 h-9 rounded-lg transition ${
                          hasPermission("update_delete")
                            ? "bg-red-500/30 text-red-200 hover:bg-red-500/40"
                            : "bg-white/10 text-gray-500 cursor-not-allowed opacity-60"
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {speaking.length === 0 && (
          <p className="text-gray-400 text-center py-8">Hali speakinglar yo&apos;q</p>
        )}
      </div>
    </div>
  );
}