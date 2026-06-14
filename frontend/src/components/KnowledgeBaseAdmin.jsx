import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Upload, FileText } from 'lucide-react'
import {
  fetchKnowledgeBase,
  fetchKnowledgeBaseDoc,
  createKnowledgeBaseDoc,
  updateKnowledgeBaseDoc,
  deleteKnowledgeBaseDoc,
  uploadKnowledgeBaseFile,
} from '../services/api.js'

export default function KnowledgeBaseAdmin() {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadDocs()
  }, [])

  async function loadDocs() {
    setLoading(true)
    try {
      const data = await fetchKnowledgeBase()
      setDocs(data || [])
    } catch (err) {
      console.error('Failed to load KB:', err)
      setError('Unable to load knowledge base documents.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSelectDoc(docId) {
    setIsCreating(false)
    setError(null)
    try {
      const doc = await fetchKnowledgeBaseDoc(docId)
      setSelectedDoc(doc)
      setEditTitle(doc.title)
      setEditContent(doc.content)
    } catch (err) {
      console.error('Failed to load document:', err)
      setError('Unable to load document.')
    }
  }

  function handleNewDoc() {
    setIsCreating(true)
    setSelectedDoc(null)
    setEditTitle('')
    setEditContent('')
    setError(null)
  }

  async function handleSave() {
    if (!editTitle.trim() || !editContent.trim()) {
      setError('Title and content are required.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      if (isCreating) {
        await createKnowledgeBaseDoc(editTitle.trim(), editContent.trim())
      } else if (selectedDoc) {
        await updateKnowledgeBaseDoc(selectedDoc.doc_id, editTitle.trim(), editContent.trim())
      }
      await loadDocs()
      setIsCreating(false)
      setSelectedDoc(null)
      setEditTitle('')
      setEditContent('')
    } catch (err) {
      console.error('Save failed:', err)
      setError('Failed to save document.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(docId) {
    if (!window.confirm('Delete this knowledge base document?')) return
    try {
      await deleteKnowledgeBaseDoc(docId)
      if (selectedDoc?.doc_id === docId) {
        setSelectedDoc(null)
        setEditTitle('')
        setEditContent('')
      }
      await loadDocs()
    } catch (err) {
      console.error('Delete failed:', err)
      setError('Failed to delete document.')
    }
  }

  async function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.txt')) {
      setError('Only .txt text documents are allowed for knowledge base uploads.')
      e.target.value = ''
      return
    }

    setSaving(true)
    setError(null)
    try {
      await uploadKnowledgeBaseFile(file)
      await loadDocs()
      e.target.value = ''
    } catch (err) {
      console.error('Upload failed:', err)
      setError('Failed to upload document. Only .txt files are accepted.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-gray-200 bg-white">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Knowledge Base</h3>
          <p className="text-sm text-slate-500">Upload and manage text knowledge documents (.txt only)</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer transition">
            <Upload size={16} />
            Upload .txt
            <input
              type="file"
              accept=".txt"
              className="hidden"
              onChange={handleFileUpload}
              disabled={saving}
            />
          </label>
          <button
            onClick={handleNewDoc}
            className="inline-flex items-center gap-2 rounded-full bg-capgemini-darkblue px-4 py-2 text-sm font-semibold text-white hover:bg-capgemini-navy transition"
          >
            <Plus size={16} /> New Document
          </button>
        </div>
      </div>

      {error && (
        <div className="px-6 py-2 bg-red-50 border-b border-red-100">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[280px_1fr] overflow-hidden">
        <div className="border-r border-gray-200 overflow-y-auto bg-slate-50 p-4">
          {loading && <p className="text-sm text-slate-500">Loading documents...</p>}
          {!loading && docs.length === 0 && (
            <p className="text-sm text-slate-500">No documents yet. Upload or create one.</p>
          )}
          <div className="space-y-2">
            {docs.map((doc) => (
              <button
                key={doc.doc_id}
                onClick={() => handleSelectDoc(doc.doc_id)}
                className={`w-full text-left rounded-2xl border px-4 py-3 bg-white transition ${
                  selectedDoc?.doc_id === doc.doc_id
                    ? 'border-capgemini-darkblue shadow-sm'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-2">
                  <FileText size={16} className="text-capgemini-darkblue mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{doc.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {new Date(doc.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col overflow-hidden">
          {(isCreating || selectedDoc) ? (
            <>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Document title"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-slate-900 focus:border-capgemini-darkblue focus:outline-none"
                />
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={16}
                  placeholder="Document content..."
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-slate-800 focus:border-capgemini-darkblue focus:outline-none leading-relaxed"
                />
              </div>
              <div className="border-t border-gray-200 bg-white px-6 py-4 flex items-center justify-between gap-3">
                {selectedDoc && !isCreating && (
                  <button
                    onClick={() => handleDelete(selectedDoc.doc_id)}
                    className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                )}
                <div className="flex-1" />
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-full bg-capgemini-darkblue px-5 py-2 text-sm font-semibold text-white disabled:opacity-40 hover:bg-capgemini-navy transition"
                >
                  <Pencil size={16} />
                  {saving ? 'Saving...' : isCreating ? 'Create Document' : 'Save Changes'}
                </button>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center p-10 text-slate-500">
              <div className="text-center max-w-sm">
                <FileText size={40} className="mx-auto text-capgemini-darkblue mb-4" />
                <p className="text-sm">
                  Select a document to edit, or create a new one. Only text (.txt) documents are supported.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
