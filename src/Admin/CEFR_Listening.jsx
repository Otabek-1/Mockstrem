import React, { useEffect, useState } from "react";
import { Pencil, Trash2, Plus, Share2, Check } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api";

export default function CEFR_Listening() {
  const [listenings, setListenings] = useState([]);
  const [userPermissions, setUserPermissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null); // 🧪 Track which link was copied

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
    api
      .get("/cefr/listening/all")
      .then((res) => {
        // backend: return array
        setListenings(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.log(err);
        setListenings([]);
      });
  }

  const deleteListening = (id) => {
    // ✅ Permission check
    if (!hasPermission("update_delete")) {
      alert("You don't have permission to delete listening mocks");
      return;
    }

    api
      .delete(`/cefr/listening/mock/${id}`)
      .then((res) => {
        if (res.status === 200) {
          alert("Deleted successfully.");
          getMocks();
        }
      })
      .catch((err) => {
        console.log(err);
        alert("Error in deleting listening mock.");
      });
  };

  // ✅ Permission check function
  const hasPermission = (permission) => {
    if (!userPermissions) return false;
    return userPermissions.cefr?.listening?.includes(permission) || false;
  };

  // ✅ Check if user has any listening permissions
  const hasAnyListeningPermission = () => {
    if (!userPermissions) return false;
    return userPermissions.cefr?.listening?.length > 0;
  };

  // 🧪 Generate test link with test=true parameter
  const generateTestLink = (mockId) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/mock/cefr/listening/${mockId}?part=all&test=true`;
  };

  // 🧪 Copy test link to clipboard
  const handleShareTestLink = (mockId) => {
    const testLink = generateTestLink(mockId);
    navigator.clipboard.writeText(testLink).then(() => {
      setCopiedId(mockId);
      // Reset after 2 seconds
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(() => {
      alert("Failed to copy link");
    });
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
      <h1 className="text-2xl font-bold text-white mb-6">CEFR Listening</h1>

      {!hasAnyListeningPermission() && (
        <div className="bg-amber-500/15 border border-amber-500/30 text-amber-200 p-4 rounded-xl mb-6">
          <p className="font-semibold">⚠️ Cheklangan kirish</p>
          <p className="text-sm text-white/80 mt-1">Listening mocklarni boshqarish ruxsati yo&apos;q. Administrator bilan bog&apos;laning.</p>
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 mb-6">
        <h2 className="text-lg font-semibold text-white mb-3">Yangi listening</h2>
        <Link
          to={hasPermission("add") ? "/mock/cefr/listening/form" : "#"}
          onClick={(e) => {
            if (!hasPermission("add")) {
              e.preventDefault();
              alert("Yangi listening qo&apos;shish ruxsati yo&apos;q");
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
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
        <h2 className="text-lg font-semibold text-white px-5 py-4 border-b border-white/10">Listening ro&apos;yxati</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.04]">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Title</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Level</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {Array.isArray(listenings) &&
                listenings.map((l) => (
                  <tr key={l.id} className="hover:bg-white/[0.04] transition-colors">
                    <td className="px-5 py-4 text-gray-200">{l.title || `Listening #${l.id}`}</td>
                    <td className="px-5 py-4 text-gray-400">B2</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleShareTestLink(l.id)}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-cyan-500/30 text-cyan-200 hover:bg-cyan-500/40 transition"
                          title="Copy test link"
                        >
                          {copiedId === l.id ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                        </button>
                        <Link
                          to={hasPermission("update_delete") ? `/mock/cefr/listening/form?edit=true&id=${l.id}` : "#"}
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
                          onClick={() => deleteListening(l.id)}
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
        {Array.isArray(listenings) && listenings.length === 0 && (
          <p className="text-gray-400 text-center py-8">Hali listeninglar yo&apos;q</p>
        )}
      </div>
    </div>
  );
}