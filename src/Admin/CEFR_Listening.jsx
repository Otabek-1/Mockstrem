import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { Link } from "react-router-dom";
import api from "../api";

export default function CEFR_Listening() {
  const [listenings, setListenings] = useState([]);

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

  useEffect(() => {
    getMocks();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">CEFR Listening</h1>

      {/* Create New Listening */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-3">Create New Listening</h2>

        <div className="flex gap-3">
          <Link
            to="/mock/cefr/listening/form"
            className="px-4 bg-blue-600 text-white rounded-lg flex items-center gap-2"
          >
            <FaPlus /> Add
          </Link>
        </div>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Listening List</h2>

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
                <tr key={l.id} className="border-b dark:border-gray-700">
                  <td className="p-2">
                    {l.title || `Listening #${l.id}`}
                  </td>
                  <td className="p-2">B2</td>
                  <td className="p-2 flex gap-3">
                    <Link
                      to={`/mock/cefr/listening/form?edit=true&id=${l.id}`}
                      className="p-2 bg-yellow-500 text-white rounded-lg"
                    >
                      <FaEdit />
                    </Link>

                    <button
                      onClick={() => deleteListening(l.id)}
                      className="p-2 bg-red-600 text-white rounded-lg"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {Array.isArray(listenings) && listenings.length === 0 && (
          <p className="text-gray-400 text-center py-4">
            No listening mocks yet…
          </p>
        )}
      </div>
    </div>
  );
}
