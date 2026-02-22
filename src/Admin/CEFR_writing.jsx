import React, { useEffect, useState } from "react";
import { Pencil, Trash2, Plus, FileCheck } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api";

export default function CEFR_Writing() {
  const [writings, setWritings] = useState([]);
  const [userPermissions, setUserPermissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  const fetchUserAndPermissions = async () => {
    try {
      const userRes = await api.get("/user/me");
      const userId = userRes.data.id;
      setCurrentUserId(userId);
      const permRes = await api.get(`/permissions/${userId}`);
      if (permRes.data.data !== "not_added") {
        setUserPermissions(permRes.data.data.permissions);
      } else {
        setUserPermissions({
          users: [],
          cefr: { reading: [], listening: [], speaking: [], writing: [] },
        });
      }
    } catch (err) {
      console.error("Error fetching permissions:", err);
      setUserPermissions({
        users: [],
        cefr: { reading: [], listening: [], speaking: [], writing: [] },
      });
    } finally {
      setLoading(false);
    }
  };

  function getMocks() {
    api.get("/mock/writing/all").then(res => setWritings(res.data || [])).catch(err => console.log(err));
  }

  const deleteWriting = async (id) => {
    if (!hasPermission("update_delete")) {
      alert("You don't have permission to delete writings");
      return;
    }
    api.delete(`/mock/writing/delete/${id}`)
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

  const hasPermission = (permission) => {
    if (!userPermissions) return false;
    return userPermissions.cefr?.writing?.includes(permission) || false;
  };

  const hasAnyWritingPermission = () => {
    if (!userPermissions) return false;
    return userPermissions.cefr?.writing?.length > 0;
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
      <h1 className="text-2xl font-bold text-white mb-6">CEFR Writing</h1>

      {!hasAnyWritingPermission() && (
        <div className="bg-amber-500/15 border border-amber-500/30 text-amber-200 p-4 rounded-xl mb-6">
          <p className="font-semibold">⚠️ Cheklangan kirish</p>
          <p className="text-sm text-white/80 mt-1">Writing mocklarni boshqarish ruxsati yo&apos;q. Administrator bilan bog&apos;laning.</p>
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 mb-6">
        <h2 className="text-lg font-semibold text-white mb-3">Yangi yozuv</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            to={hasPermission("add") ? "/mock/cefr/writing/form" : "#"}
            onClick={(e) => {
              if (!hasPermission("add")) {
                e.preventDefault();
                alert("Yangi writing qo&apos;shish ruxsati yo&apos;q");
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
            to={hasPermission("check_result") ? "/mock/cefr/writing/check-list" : "#"}
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
        <h2 className="text-lg font-semibold text-white px-5 py-4 border-b border-white/10">Writing ro&apos;yxati</h2>
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
              {writings.map((w) => (
                <tr key={w.id} className="hover:bg-white/[0.04] transition-colors">
                  <td className="px-5 py-4 text-gray-200">Writing #{w.id}</td>
                  <td className="px-5 py-4 text-gray-400">B2</td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={hasPermission("update_delete") ? `/mock/cefr/writing/form?edit=true&id=${w.id}` : "#"}
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
                        onClick={() => deleteWriting(w.id)}
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
        {writings.length === 0 && (
          <p className="text-gray-400 text-center py-8">Hali writinglar yo&apos;q</p>
        )}
      </div>
    </div>
  );
}
