// ===== FILE 1: CEFR_Speaking.jsx (Main Page) =====
import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { RiReceiptFill } from "react-icons/ri";
import { Link } from "react-router-dom";
import api from "../api";

export default function CEFR_Speaking() {
  const [speaking, setSpeaking] = useState([]);

  function getMocks() {
    api.get("/mock/speaking/all").then(res => {
      setSpeaking(res.data);
    }).catch(err => {
      console.log(err);
    })
  }

  const deleteSpeaking = async (id) => {
    api.delete(`/mock/speaking/delete/${id}`).then(async res => {
      if (res.status === 200) {
        alert("Deleted successfully.")
        getMocks()
      }
    }).catch(err => {
      console.log(err);
      alert("Error in deleting mock. (See console)")
    })
  };

  useEffect(() => {
    getMocks();
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">CEFR Speaking</h1>

      {/* Create New Speaking */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-3">Create New Speaking Mock</h2>

        <div className="flex gap-3">
          <Link to="/mock/cefr/speaking/form"
            className="px-4 bg-blue-600 text-white rounded-lg flex items-center gap-2"
          >
            <FaPlus /> Add
          </Link>

          <Link to="/mock/cefr/speaking/check-list"
            target="_blank"
            className="px-4 bg-blue-600 text-white rounded-lg flex items-center gap-2"
          >
            <RiReceiptFill /> Check mocks
          </Link>
        </div>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Speaking Mocks List</h2>

        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left border-b dark:border-gray-700">
              <th className="p-2">Title</th>
              <th className="p-2">Questions</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {speaking.map((s) => (
              <tr key={s.id} className="border-b dark:border-gray-700">
                <td className="p-2">{s.title}</td>
                <td className="p-2">8 Questions</td>
                <td className="p-2 flex gap-3">
                  <Link to={`/mock/cefr/speaking/form?edit=true&id=${s.id}`} className="p-2 bg-yellow-500 text-white rounded-lg">
                    <FaEdit />
                  </Link>

                  <button
                    onClick={() => deleteSpeaking(s.id)}
                    className="p-2 bg-red-600 text-white rounded-lg"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {speaking.length === 0 && (
          <p className="text-gray-400 text-center py-4">No speaking mocks yet…</p>
        )}
      </div>
    </div>
  );
}
