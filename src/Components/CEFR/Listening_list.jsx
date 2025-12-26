"use client"

import { useState, useEffect } from "react"
import { FaRandom, FaVolumeUp, FaCrown } from "react-icons/fa"
import { MdClose } from "react-icons/md"
import api from "../../api"


export default function ListeningList({ isPremium = false }) {
  const [mocks, setMocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedMock, setSelectedMock] = useState(null)
  const [selectedPart, setSelectedPart] = useState(null)

  // ================= FETCH =================
  useEffect(() => {
    async function loadMocks() {
      try {
        setLoading(true)
        const res = await api.get("/cefr/listening/all")
        setMocks(Array.isArray(res.data) ? res.data : [])
      } catch (e) {
        console.log(e)
        setError("Failed to load listening mocks")
      } finally {
        setLoading(false)
      }
    }
    loadMocks()
  }, [])

  // ================= HELPERS =================
  const openMock = (mock) => {
    setSelectedMock(mock)
    setSelectedPart(null)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelectedMock(null)
    setSelectedPart(null)
  }

  const selectRandomMock = () => {
    if (!mocks.length) return
    const random = mocks[Math.floor(Math.random() * mocks.length)]
    openMock(random)
  }

  const getParts = (mock) => {
    if (!mock) return []
    return [
      { num: 1, audio: mock.audio_part_1 },
      { num: 2, audio: mock.audio_part_2 },
      { num: 3, audio: mock.audio_part_3 },
      { num: 4, audio: mock.audio_part_4 },
      { num: 5, audio: mock.audio_part_5 },
      { num: 6, audio: mock.audio_part_6 },
    ].filter((p) => Boolean(p.audio))
  }

  // ================= RENDER =================
  return (
    <div className="w-full min-h-screen p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
        CEFR Listening
      </h1>

      {/* TOOLBAR */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={selectRandomMock}
          disabled={loading || !mocks.length}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full font-semibold hover:scale-105 transition disabled:opacity-50"
        >
          <FaRandom /> Random Mock
        </button>
      </div>

      {/* CONTENT */}
      {loading && (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-100 border border-red-300 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mocks.map((mock) => (
            <div
              key={mock.id}
              onClick={() => openMock(mock)}
              className="cursor-pointer p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow hover:shadow-lg transition"
            >
              <div className="flex items-center gap-3">
                <FaVolumeUp className="text-blue-600 text-xl" />
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">
                    {mock.title || `Listening Mock #${mock.id}`}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {getParts(mock).length} parts available
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL BACKDROP */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[998]"
          onClick={closeModal}
        />
      )}

      {/* MODAL */}
      {modalOpen && selectedMock && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[999] w-full max-w-xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
          {/* HEADER */}
          <div className="p-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <FaCrown />
              <div>
                <p className="font-bold">{selectedMock.title}</p>
                <p className="text-xs opacity-90">
                  Select a part or take full mock
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                isPremium
                  ? (window.location.href = `/mock/cefr/listening/${selectedMock.id}?part=all`)
                  : (window.location.href = "/plans")
              }
              className="bg-white text-blue-600 px-4 py-1 rounded font-semibold"
              style={{color:"blue"}}
            >
              Full Mock
            </button>
          </div>

          {/* BODY */}
          <div className="p-6">
            {!selectedPart ? (
              <div className="space-y-3">
                {getParts(selectedMock).map((p) => (
                  <div
                    key={p.num}
                    onClick={() => setSelectedPart(p.num)}
                    className="flex items-center justify-between p-3 border rounded cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700"
                  >
                    <div className="flex items-center gap-3">
                      <FaVolumeUp className="text-blue-500" />
                      <span className="font-semibold">
                        Part {p.num}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">Start</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <button
                  onClick={() => setSelectedPart(null)}
                  className="text-blue-600 font-semibold"
                >
                  ← Back
                </button>

                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded">
                  <h3 className="font-bold mb-2">
                    Part {selectedPart}
                  </h3>

                  {/* <audio
                    controls
                    className="w-full"
                    src={selectedMock[`audio_part_${selectedPart}`]}
                  /> */}
                </div>

                <button
                  onClick={() =>
                    (window.location.href = `/mock/cefr/listening/${selectedMock.id}?part=${selectedPart}`)
                  }
                  className="w-full py-2 bg-blue-600 text-white rounded font-semibold"
                >
                  Start Part {selectedPart}
                </button>
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="p-4 border-t flex justify-end">
            <button
              onClick={closeModal}
              className="px-4 py-1 bg-gray-200 dark:bg-gray-700 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
