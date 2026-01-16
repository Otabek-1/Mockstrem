import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaPlus, FaShare, FaCopy, FaCheck } from "react-icons/fa";
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
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">CEFR Listening</h1>

      {/* ✅ Permission warning */}
      {!hasAnyListeningPermission() && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg mb-6">
          <p className="font-semibold">⚠️ Limited Access</p>
          <p className="text-sm">You don't have permissions to manage listening mocks. Please contact an administrator.</p>
        </div>
      )}

      {/* Create New Listening */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-3">Create New Listening</h2>

        <div className="flex gap-3">
          {/* ✅ Add button - requires "add" permission */}
          <Link
            to={hasPermission("add") ? "/mock/cefr/listening/form" : "#"}
            onClick={(e) => {
              if (!hasPermission("add")) {
                e.preventDefault();
                alert("You don't have permission to add new listening mocks");
              }
            }}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
              hasPermission("add")
                ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                : "bg-gray-300 text-gray-500 cursor-not-allowed opacity-50"
            }`}
          >
            <FaPlus /> Add
          </Link>
        </div>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Listening List</h2>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left border-b dark:border-gray-700">
                <th className="p-2">Title</th>
                <th className="p-2">Level</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>

            <tbody>
              {Array.isArray(listenings) &&
                listenings.map((l) => (
                  <tr key={l.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="p-2">
                      {l.title || `Listening #${l.id}`}
                    </td>
                    <td className="p-2">B2</td>
                    <td className="p-2 flex gap-3">
                      {/* 🧪 Share for Testing button */}
                      <button
                        onClick={() => handleShareTestLink(l.id)}
                        className="p-2 rounded-lg transition bg-cyan-500 text-white hover:bg-cyan-600 flex items-center gap-1"
                        title="Copy test link with ?test=true"
                      >
                        {copiedId === l.id ? (
                          <FaCheck size={16} />
                        ) : (
                          <FaShare size={16} />
                        )}
                      </button>

                      {/* ✅ Edit button - requires "update_delete" permission */}
                      <Link
                        to={
                          hasPermission("update_delete")
                            ? `/mock/cefr/listening/form?edit=true&id=${l.id}`
                            : "#"
                        }
                        onClick={(e) => {
                          if (!hasPermission("update_delete")) {
                            e.preventDefault();
                            alert("You don't have permission to edit listening mocks");
                          }
                        }}
                        className={`p-2 rounded-lg transition ${
                          hasPermission("update_delete")
                            ? "bg-yellow-500 text-white hover:bg-yellow-600 cursor-pointer"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed opacity-50"
                        }`}
                      >
                        <FaEdit />
                      </Link>

                      {/* ✅ Delete button - requires "update_delete" permission */}
                      <button
                        onClick={() => deleteListening(l.id)}
                        disabled={!hasPermission("update_delete")}
                        className={`p-2 rounded-lg transition ${
                          hasPermission("update_delete")
                            ? "bg-red-600 text-white hover:bg-red-700 cursor-pointer"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed opacity-50"
                        }`}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {Array.isArray(listenings) && listenings.length === 0 && (
          <p className="text-gray-400 text-center py-4">
            No listening mocks yet…
          </p>
        )}
      </div>
    </div>
  );
}