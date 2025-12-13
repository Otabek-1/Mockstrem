import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { RiReceiptFill } from "react-icons/ri";
import { Link } from "react-router-dom";
import api from "../api";

export default function CEFR_Reading() {
  const [readings, setReadings] = useState([]);

  function getMocks() {
    api.get("/mock/reading/all").then(res => {
      // Agar res.data array bo'lsa
      setReadings(res.data.mocks);
      
    }).catch(err => {
      console.log(err);
      setReadings([]);
    })
  }

  const deleteReading = async (id) => {
    api.delete(`/mock/reading/${id}`).then(async res => {
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
      <h1 className="text-2xl font-bold mb-6">CEFR Reading</h1>

      {/* Create New Reading */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-3">Create New Reading</h2>

        <div className="flex gap-3">
          <Link to="/mock/cefr/reading/form"
            className="px-4 bg-blue-600 text-white rounded-lg flex items-center gap-2"
          >
            <FaPlus /> Add
          </Link>


        </div>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Reading List</h2>

        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left border-b dark:border-gray-700">
              <th className="p-2">Title</th>
              <th className="p-2">Level</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {Array.isArray(readings) && readings.map((r) => (
              <tr key={r.id} className="border-b dark:border-gray-700">
                <td className="p-2">{r.title || `Reading #${r.id}`}</td>
                <td className="p-2">B2</td>
                <td className="p-2 flex gap-3">
                  <Link to={`/mock/cefr/reading/form?edit=true&id=${r.id}`} className="p-2 bg-yellow-500 text-white rounded-lg">
                    <FaEdit />
                  </Link>

                  <button
                    onClick={() => deleteReading(r.id)}
                    className="p-2 bg-red-600 text-white rounded-lg"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {Array.isArray(readings) && readings.length === 0 && (
          <p className="text-gray-400 text-center py-4">No readings yet…</p>
        )}
      </div>
    </div>
  );
}