import React, { useState, useEffect } from 'react'
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa'
import api from '../api'

// Simple Rich Text Editor Component
function SimpleRichEditor({ value, onChange }) {
  const handleBold = () => {
    const textarea = document.querySelector('.rich-textarea')
    if (!textarea) return
    
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = value
    const selectedText = text.substring(start, end)
    const newText = text.substring(0, start) + `<b>${selectedText}</b>` + text.substring(end)
    onChange(newText)
  }

  const handleItalic = () => {
    const textarea = document.querySelector('.rich-textarea')
    if (!textarea) return
    
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = value
    const selectedText = text.substring(start, end)
    const newText = text.substring(0, start) + `<i>${selectedText}</i>` + text.substring(end)
    onChange(newText)
  }

  const handleLink = () => {
    const url = prompt('Enter URL:')
    if (!url) return
    
    const textarea = document.querySelector('.rich-textarea')
    if (!textarea) return
    
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = value
    const selectedText = text.substring(start, end)
    const newText = text.substring(0, start) + `<a href="${url}">${selectedText}</a>` + text.substring(end)
    onChange(newText)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 flex-wrap bg-gray-100 dark:bg-slate-600 p-2 rounded-t-lg border-b-2 border-gray-300 dark:border-gray-500">
        <button
          type="button"
          onClick={handleBold}
          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded text-sm transition-all"
          title="Bold"
        >
          B
        </button>
        <button
          type="button"
          onClick={handleItalic}
          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white italic rounded text-sm transition-all"
          title="Italic"
        >
          I
        </button>
        <button
          type="button"
          onClick={handleLink}
          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-all"
          title="Link"
        >
          🔗
        </button>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rich-textarea w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-500 rounded-b-lg dark:bg-slate-700 dark:text-white min-h-[250px] font-mono text-sm"
        placeholder="Enter news body with HTML tags or use toolbar buttons..."
      />
    </div>
  )
}

export default function Main_admin() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ title: '', body: '' })
  const [showForm, setShowForm] = useState(false)

  // Fetch news
  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    try {
      setLoading(true)
      const res = await api.get('/news/')
      setNews(res.data || [])
    } catch (err) {
      console.error('Error fetching news:', err)
      setNews([])
    } finally {
      setLoading(false)
    }
  }

  // Handle Add/Update
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      alert('Title is required')
      return
    }

    try {
      if (editingId) {
        // Update
        await api.put(`/news/${editingId}`, formData)
        alert('News updated successfully')
      } else {
        // Create
        await api.post('/news/create', formData)
        alert('News created successfully')
      }
      setFormData({ title: '', body: '' })
      setEditingId(null)
      setShowForm(false)
      fetchNews()
    } catch (err) {
      console.error('Error saving news:', err)
      alert('Error saving news')
    }
  }

  // Handle Edit
  const handleEdit = (item) => {
    setEditingId(item.id)
    setFormData({ title: item.title, body: item.body || '' })
    setShowForm(true)
  }

  // Handle Delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this news?')) return

    try {
      await api.delete(`/news/${id}`)
      alert('News deleted successfully')
      fetchNews()
    } catch (err) {
      console.error('Error deleting news:', err)
      alert('Error deleting news')
    }
  }

  // Reset Form
  const handleCancel = () => {
    setFormData({ title: '', body: '' })
    setEditingId(null)
    setShowForm(false)
  }

  // Helper function to strip HTML tags for preview
  const stripHtmlTags = (html) => {
    const temp = document.createElement('div')
    temp.innerHTML = html
    return temp.textContent || temp.innerText || ''
  }

  // Get preview text from HTML
  const getPreview = (body) => {
    if (!body) return 'No body'
    const plainText = stripHtmlTags(body)
    return plainText.substring(0, 80) + (plainText.length > 80 ? '...' : '')
  }

  return (
    <div className='w-full h-full bg-white dark:bg-slate-700 rounded-xl'>
      <div className="news w-full h-max p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h3 className="text-slate-700 dark:text-white text-3xl font-bold">Manage News</h3>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all"
          >
            <FaPlus /> Add News
          </button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-gray-100 dark:bg-slate-600 p-6 rounded-lg border-2 border-blue-500">
            <h4 className="text-lg font-bold text-slate-700 dark:text-white mb-4">
              {editingId ? 'Edit News' : 'Add New News'}
            </h4>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-slate-700 dark:text-gray-300 font-semibold mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter news title"
                  className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-500 rounded-lg dark:bg-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-gray-300 font-semibold mb-2">
                  body
                </label>
                <div className="tiptap-editor border-2 border-gray-300 dark:border-gray-500 rounded-lg overflow-hidden">
                  <SimpleRichEditor
                    value={formData.body}
                    onChange={(body) => setFormData({ ...formData, body })}
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all"
                >
                  {editingId ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* News Table */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-slate-600 dark:text-gray-400">Loading...</p>
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-600 dark:text-gray-400 text-lg">No news found. Create your first news!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-200 dark:bg-slate-600">
                  <th className="px-6 py-3 text-left text-slate-700 dark:text-white font-bold border-b-2 border-slate-300 dark:border-slate-500">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-slate-700 dark:text-white font-bold border-b-2 border-slate-300 dark:border-slate-500">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-slate-700 dark:text-white font-bold border-b-2 border-slate-300 dark:border-slate-500">
                    body Preview
                  </th>
                  <th className="px-6 py-3 text-center text-slate-700 dark:text-white font-bold border-b-2 border-slate-300 dark:border-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {news.map((item, idx) => (
                  <tr
                    key={item.id}
                    className={`border-b border-slate-300 dark:border-slate-500 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors ${
                      idx % 2 === 0 ? 'bg-white dark:bg-slate-700' : 'bg-gray-50 dark:bg-slate-650'
                    }`}
                  >
                    <td className="px-6 py-4 text-slate-700 dark:text-gray-300 font-semibold">
                      {item.id}
                    </td>
                    <td className="px-6 py-4 text-slate-700 dark:text-gray-300 font-semibold max-w-xs">
                      {item.title}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-gray-400 max-w-md">
                      <div 
                        className="line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: item.body ? item.body.substring(0, 150) + (item.body.length > 150 ? '...' : '') : 'No body' }}
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => handleEdit(item)}
                          className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all text-sm"
                        >
                          <FaEdit /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all text-sm"
                        >
                          <FaTrash /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
