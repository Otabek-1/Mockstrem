import React, { useState, useEffect } from 'react'
import { Pencil, Trash2, Plus, Save, X } from 'lucide-react'
import api from '../api'

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
    const url = prompt('URL kiriting:')
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
      <div className="flex gap-2 flex-wrap bg-white/5 border border-white/10 p-2 rounded-t-xl">
        <button type="button" onClick={handleBold} className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-lg text-sm transition-all" title="Qalin">
          B
        </button>
        <button type="button" onClick={handleItalic} className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white italic rounded-lg text-sm transition-all" title="Yotiq">
          I
        </button>
        <button type="button" onClick={handleLink} className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm transition-all" title="Havola">
          Link
        </button>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rich-textarea w-full px-4 py-3 bg-white/5 border border-white/10 rounded-b-xl text-white placeholder-white/30 min-h-[220px] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
        placeholder="Yangilik matni (HTML yoki toolbar tugmalaridan foydalaning)..."
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      alert('Sarlavha kiritilishi shart')
      return
    }
    try {
      if (editingId) {
        await api.put(`/news/${editingId}`, formData)
        alert('Yangilik yangilandi')
      } else {
        await api.post('/news/create', formData)
        alert('Yangilik qo\'shildi')
      }
      setFormData({ title: '', body: '' })
      setEditingId(null)
      setShowForm(false)
      fetchNews()
    } catch (err) {
      console.error('Error saving news:', err)
      alert('Saqlashda xatolik')
    }
  }

  const handleEdit = (item) => {
    setEditingId(item.id)
    setFormData({ title: item.title, body: item.body || '' })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Ushbu yangilikni o\'chirishga ishonchingiz komilmi?')) return
    try {
      await api.delete(`/news/${id}`)
      alert('Yangilik o\'chirildi')
      fetchNews()
    } catch (err) {
      console.error('Error deleting news:', err)
      alert('O\'chirishda xatolik')
    }
  }

  const handleCancel = () => {
    setFormData({ title: '', body: '' })
    setEditingId(null)
    setShowForm(false)
  }

  const stripHtmlTags = (html) => {
    const temp = document.createElement('div')
    temp.innerHTML = html
    return temp.textContent || temp.innerText || ''
  }

  return (
    <div className="w-full h-full">
      <div className="p-6 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-white text-2xl font-bold">Yangiliklarni boshqarish</h3>
            <p className="text-white/50 text-sm mt-0.5">
              Jami {news.length} ta yangilik · Yangilik qo&apos;shish, tahrirlash va o&apos;chirish
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-violet-500/20"
          >
            <Plus className="w-5 h-5" /> Yangilik qo&apos;shish
          </button>
        </div>

        {showForm && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-white">
                {editingId ? 'Yangilikni tahrirlash' : 'Yangi yangilik'}
              </h4>
              <button onClick={handleCancel} className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-white/80 font-semibold mb-2">Sarlavha *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Yangilik sarlavhasi"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
              </div>
              <div>
                <label className="block text-white/80 font-semibold mb-2">Matn</label>
                <div className="tiptap-editor rounded-xl overflow-hidden border border-white/10">
                  <SimpleRichEditor
                    value={formData.body}
                    onChange={(body) => setFormData({ ...formData, body })}
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-all">
                  <Save className="w-4 h-4" /> {editingId ? 'Saqlash' : 'Yaratish'}
                </button>
                <button type="button" onClick={handleCancel} className="px-6 py-2.5 border border-white/20 text-white/80 rounded-xl hover:bg-white/10 transition font-medium">
                  Bekor qilish
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-white/10 border-t-violet-500 mb-4" />
            <p className="text-white/50">Yuklanmoqda...</p>
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-white/5 bg-white/[0.02]">
            <p className="text-white/50 text-lg">Yangiliklar yo&apos;q. Birinchi yangilikni qo&apos;shing.</p>
            <button onClick={() => setShowForm(true)} className="mt-4 text-violet-400 hover:text-violet-300 font-medium">
              Yangilik qo&apos;shish →
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">Sarlavha</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">Matn (qisqacha)</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-white/60 uppercase tracking-wider">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {news.map((item) => (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-mono text-sm text-violet-300">#{item.id}</td>
                      <td className="px-6 py-4 font-medium text-white max-w-xs">{item.title}</td>
                      <td className="px-6 py-4 text-white/60 max-w-md line-clamp-2 text-sm">
                        {item.body ? stripHtmlTags(item.body).substring(0, 120) + (item.body.length > 120 ? '...' : '') : '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-violet-500/20 text-white rounded-lg transition text-sm"
                          >
                            <Pencil className="w-4 h-4" /> Tahrirlash
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="flex items-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition text-sm"
                          >
                            <Trash2 className="w-4 h-4" /> O&apos;chirish
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
