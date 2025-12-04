import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { RiReceiptFill } from "react-icons/ri";
import { Link } from "react-router-dom";
import api from "../api";

export default function CEFR_Writing() {
  const [writings, setWritings] = useState([
  ]);

  function getMocks() {
    api.get("/mock/writing/all").then(res => {
      setWritings(res.data);
    }).catch(err => {
      console.log(err);
    })
  }

  const deleteWriting = async (id) => {
    api.delete(`/mock/writing/delete/${id}`).then(async res => {
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
      <h1 className="text-2xl font-bold mb-6">CEFR Writing</h1>

      {/* Create New Writing */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-3">Create New Writing</h2>

        <div className="flex gap-3">
          <Link to="/mock/cefr/writing/form"
            className="px-4 bg-blue-600 text-white rounded-lg flex items-center gap-2"
          >
            <FaPlus /> Add
          </Link>

          <Link to="/mock/cefr/writing/check-list"
            target="_blank"
            className="px-4 bg-blue-600 text-white rounded-lg flex items-center gap-2"
          >
            <RiReceiptFill /> Check mocks
          </Link>
        </div>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Writing List</h2>

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
              <tr key={w.id} className="border-b dark:border-gray-700">
                <td className="p-2">Writing #{w.id}</td>
                <td className="p-2">B2</td>
                <td className="p-2 flex gap-3">
                  <Link to={`/mock/cefr/writing/form?edit=true&id=${w.id}`} className="p-2 bg-yellow-500 text-white rounded-lg">
                    <FaEdit />
                  </Link>

                  <button
                    onClick={() => deleteWriting(w.id)}
                    className="p-2 bg-red-600 text-white rounded-lg"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {writings.length === 0 && (
          <p className="text-gray-400 text-center py-4">No writings yet…</p>
        )}
      </div>
    </div>
  );
}
