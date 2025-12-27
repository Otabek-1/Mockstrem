import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { RiReceiptFill } from "react-icons/ri";
import { Link } from "react-router-dom";
import api from "../api";

export default function CEFR_Writing() {
  const [writings, setWritings] = useState([]);
  const [userPermissions, setUserPermissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  // ✅ Current user va permissions olish
  const fetchUserAndPermissions = async () => {
    try {
      // Get current user ID
      const userRes = await api.get("/user/me");
      const userId = userRes.data.id;
      setCurrentUserId(userId);

      // Get user permissions
      const permRes = await api.get(`/permissions/${userId}`);
      console.log("User permissions:", permRes.data);

      if (permRes.data.data !== "not_added") {
        setUserPermissions(permRes.data.data.permissions);
      } else {
        // No permissions assigned
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
      // Default permissions (none)
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
    api.get("/mock/writing/all")
      .then(res => {
        setWritings(res.data);
      })
      .catch(err => {
        console.log(err);
      });
  }

  const deleteWriting = async (id) => {
    // ✅ Permission check
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

  // ✅ Permission check function
  const hasPermission = (permission) => {
    if (!userPermissions) return false;
    return userPermissions.cefr?.writing?.includes(permission) || false;
  };

  // ✅ Check if user has any writing permissions
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
      <h1 className="text-2xl font-bold mb-6">CEFR Writing</h1>

      {/* ✅ Permission warning */}
      {!hasAnyWritingPermission() && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg mb-6">
          <p className="font-semibold">⚠️ Limited Access</p>
          <p className="text-sm">You don't have permissions to manage writing mocks. Please contact an administrator.</p>
        </div>
      )}

      {/* Create New Writing */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-3">Create New Writing</h2>

        <div className="flex gap-3">
          {/* ✅ Add button - requires "add" permission */}
          <Link
            to={hasPermission("add") ? "/mock/cefr/writing/form" : "#"}
            onClick={(e) => {
              if (!hasPermission("add")) {
                e.preventDefault();
                alert("You don't have permission to add new writings");
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

          {/* ✅ Check mocks button */}
          <Link
            to={hasPermission("check_result") ? "/mock/cefr/writing/check-list" : "#"}
            target="_blank"
            onClick={(e) => {
              if (!hasPermission("check_result")) {
                e.preventDefault();
                alert("You don't have permission to check mocks");
              }
            }}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
              hasPermission("check_result")
                ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                : "bg-gray-300 text-gray-500 cursor-not-allowed opacity-50"
            }`}
          >
            <RiReceiptFill /> Check mocks
          </Link>
        </div>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Writing List</h2>

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
              {writings.map((w) => (
                <tr key={w.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="p-2">Writing #{w.id}</td>
                  <td className="p-2">B2</td>
                  <td className="p-2 flex gap-3">
                    {/* ✅ Edit button - requires "update_delete" permission */}
                    <Link
                      to={
                        hasPermission("update_delete")
                          ? `/mock/cefr/writing/form?edit=true&id=${w.id}`
                          : "#"
                      }
                      onClick={(e) => {
                        if (!hasPermission("update_delete")) {
                          e.preventDefault();
                          alert("You don't have permission to edit writings");
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
                      onClick={() => deleteWriting(w.id)}
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

        {writings.length === 0 && (
          <p className="text-gray-400 text-center py-4">No writings yet…</p>
        )}
      </div>
    </div>
  );
}