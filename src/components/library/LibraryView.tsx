import React, { useState, useMemo } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { Book } from '../../types';
import { fileToBase64, formatDate } from '../../lib/formatters';
import { ConfirmDialog } from '../ConfirmDialog';
import {
  BookOpen,
  Plus,
  Search,
  FileText,
  Download,
  Calendar,
  Layers,
  Edit2,
  Trash2,
  X,
  Upload,
  Check,
  Eye,
  Bookmark,
} from 'lucide-react';

export const LibraryView: React.FC = () => {
  const { db, addBook, updateBook, deleteBook, isAdmin, setIsLoginModalOpen, openDocumentViewer } = useDatabase();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeBookModal, setActiveBookModal] = useState<Book | null>(null);

  // Form states for adding/editing book
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    category: 'Qur’anic Studies & Tafsir',
    publisher: 'An Noor Academic Publications',
    publishYear: '2026',
    pages: 250,
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    pdfFileName: 'Publication.pdf',
    pdfUrl: '',
    pdfContentPreview: '',
  });

  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null);

  const categories = useMemo(() => {
    const set = Array.from(new Set(db.books.map((b) => b.category)));
    return ['all', ...set];
  }, [db.books]);

  const filteredBooks = useMemo(() => {
    return db.books.filter((b) => {
      const matchesSearch =
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === 'all' || b.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [db.books, searchQuery, selectedCategory]);

  const openAddForm = () => {
    setEditingBookId(null);
    setFormData({
      title: '',
      author: 'Muhammad Saiful Azam Babar Al-Azhari',
      description: '',
      category: 'Qur’anic Studies & Tafsir',
      publisher: 'An Noor Academic Publications',
      publishYear: '2026',
      pages: 200,
      coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
      pdfFileName: 'An-Noor-Publication.pdf',
      pdfUrl: '',
      pdfContentPreview: `Bismillahir Rahmanir Rahim.
An Noor Digital Library Series.
Authorized publication on Islamic heritage and contemporary research.`,
    });
    setIsFormOpen(true);
  };

  const openEditForm = (book: Book) => {
    setEditingBookId(book.id);
    setFormData({
      title: book.title,
      author: book.author,
      description: book.description,
      category: book.category,
      publisher: book.publisher,
      publishYear: book.publishYear,
      pages: book.pages,
      coverUrl: book.coverUrl,
      pdfFileName: book.pdfFileName || 'Book.pdf',
      pdfUrl: book.pdfUrl || '',
      pdfContentPreview: book.pdfContentPreview || '',
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBookId) {
      updateBook(editingBookId, formData);
    } else {
      addBook(formData);
    }
    setIsFormOpen(false);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const b64 = await fileToBase64(e.target.files[0]);
      setFormData((prev) => ({ ...prev, coverUrl: b64 }));
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const b64 = await fileToBase64(file);
      setFormData((prev) => ({
        ...prev,
        pdfUrl: b64,
        pdfFileName: file.name,
      }));
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#0E4D34]/10 text-[#0E4D34] flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold font-cinzel text-stone-900">
              Digital Library & Publications
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Authentic treatises, Qur'anic commentaries, Seerah studies, and research publications
          </p>
        </div>

        {isAdmin ? (
          <button
            id="btn-add-book"
            onClick={openAddForm}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0E4D34] hover:bg-[#093322] text-white text-xs font-semibold rounded-xl transition shadow-xs"
          >
            <Plus className="w-4 h-4 text-[#E4BC52]" />
            <span>Add New Publication</span>
          </button>
        ) : (
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="text-stone-500 hover:text-stone-700 text-xs font-medium underline"
          >
            Admin Sign-in to Upload / Manage Books
          </button>
        )}
      </div>

      {/* Search and Category Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="input-search-books"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search publications by title, author, or keywords..."
            className="w-full pl-9 pr-3 py-2 bg-white text-xs rounded-xl border border-stone-200 focus:border-[#0E4D34] outline-hidden shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap text-xs font-medium transition ${
                selectedCategory === cat
                  ? 'bg-[#7A1224] text-white shadow-2xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              {cat === 'all' ? 'All Subjects' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Book Grid */}
      {filteredBooks.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-stone-200 text-stone-500">
          <BookOpen className="w-10 h-10 mx-auto text-stone-300 mb-2" />
          <p className="font-semibold text-stone-700">No books found in this category</p>
          <p className="text-xs text-stone-400 mt-1">Try another category or clear your search query</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group"
            >
              <div className="p-3">
                {/* Book Cover */}
                <div
                  onClick={() => setActiveBookModal(book)}
                  className="relative aspect-3/4 rounded-xl overflow-hidden cursor-pointer bg-stone-100 border border-stone-200 shadow-xs group-hover:shadow-md transition"
                >
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 left-2 bg-[#7A1224]/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-xs">
                    {book.publishYear}
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-200">
                    <span className="bg-white text-stone-900 text-xs font-bold px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-[#0E4D34]" />
                      <span>Details & PDF</span>
                    </span>
                  </div>
                </div>

                {/* Metadata */}
                <div className="mt-2.5">
                  <span className="text-[10px] uppercase font-bold text-[#C59B27] block truncate">
                    {book.category}
                  </span>
                  <h4
                    onClick={() => setActiveBookModal(book)}
                    className="text-xs font-bold text-stone-900 line-clamp-2 mt-0.5 cursor-pointer hover:text-[#7A1224]"
                  >
                    {book.title}
                  </h4>
                  <p className="text-[11px] text-stone-500 truncate mt-0.5 font-medium">
                    {book.author}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="px-3 py-2 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => {
                    openDocumentViewer({
                      title: book.title,
                      url: book.pdfUrl || '',
                      type: 'pdf',
                      subtitle: `${book.author} • ${book.pages} pages • ${book.publisher}`,
                      textContent: book.pdfContentPreview,
                    });
                  }}
                  className="text-[11px] font-bold text-[#0E4D34] hover:underline flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Read / PDF</span>
                </button>

                {isAdmin && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditForm(book)}
                      title="Edit Book Information"
                      className="p-1 text-stone-500 hover:text-[#7A1224] rounded-md transition"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(book)}
                      title="Remove Book"
                      className="p-1 text-stone-500 hover:text-rose-600 rounded-md transition"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Book Details Modal */}
      {activeBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
            <div className="bg-[#0E4D34] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#E4BC52]" />
                <h3 className="font-bold text-sm font-cinzel">Publication Overview</h3>
              </div>
              <button
                onClick={() => setActiveBookModal(null)}
                className="text-stone-300 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="flex gap-4">
                <img
                  src={activeBookModal.coverUrl}
                  alt={activeBookModal.title}
                  className="w-24 h-36 rounded-xl object-cover border-2 border-stone-200 shadow-md shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#C59B27] bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/50">
                    {activeBookModal.category}
                  </span>
                  <h4 className="text-base font-bold font-cinzel text-stone-900 mt-1">
                    {activeBookModal.title}
                  </h4>
                  <p className="text-xs text-[#7A1224] font-semibold">
                    Author: {activeBookModal.author}
                  </p>
                  <p className="text-stone-500 text-[11px]">
                    Publisher: {activeBookModal.publisher} ({activeBookModal.publishYear})
                  </p>
                  <p className="text-stone-500 text-[11px]">
                    Volume: {activeBookModal.pages} pages • Added {formatDate(activeBookModal.dateAdded)}
                  </p>
                </div>
              </div>

              <div>
                <h5 className="font-bold text-stone-800 uppercase tracking-wider text-[11px] mb-1">
                  Synopsis & Scholarly Summary
                </h5>
                <p className="text-stone-600 leading-relaxed whitespace-pre-line text-xs">
                  {activeBookModal.description}
                </p>
              </div>

              {activeBookModal.pdfContentPreview && (
                <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/60">
                  <span className="text-[10px] uppercase font-bold text-[#7A1224] tracking-wider block mb-1">
                    Excerpt / Table of Contents
                  </span>
                  <p className="text-stone-700 whitespace-pre-wrap font-serif text-[11px] leading-relaxed">
                    {activeBookModal.pdfContentPreview}
                  </p>
                </div>
              )}

              <div className="pt-2 flex flex-wrap gap-2 justify-end border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => {
                    openDocumentViewer({
                      title: activeBookModal.title,
                      url: activeBookModal.pdfUrl || '',
                      type: 'pdf',
                      subtitle: `${activeBookModal.author} • ${activeBookModal.pages} pages`,
                      textContent: activeBookModal.pdfContentPreview,
                    });
                  }}
                  className="px-4 py-2 bg-[#0E4D34] hover:bg-[#093322] text-white font-bold rounded-xl flex items-center gap-1.5 transition shadow-xs"
                >
                  <BookOpen className="w-4 h-4 text-[#E4BC52]" />
                  <span>Open Interactive Reader</span>
                </button>
                <button
                  onClick={() => setActiveBookModal(null)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Book Form (Admin CMS) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
            <div className="bg-[#0E4D34] text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm font-cinzel">
                {editingBookId ? 'Edit Book Details' : 'Add Publication to Digital Library'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-stone-300 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-4 overflow-y-auto space-y-3 flex-1 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Book Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Ma’arif al-Qur’an: Reflections"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:border-[#0E4D34] outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Author Name *</label>
                <input
                  type="text"
                  required
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="e.g. Muhammad Saiful Azam Babar Al-Azhari"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:border-[#0E4D34] outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Category *</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Qur’anic Studies, Hadith, etc."
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Publisher</label>
                  <input
                    type="text"
                    value={formData.publisher}
                    onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                    placeholder="An Noor Academic Publications"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Publish Year</label>
                  <input
                    type="text"
                    value={formData.publishYear}
                    onChange={(e) => setFormData({ ...formData, publishYear: e.target.value })}
                    placeholder="2026"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Total Pages</label>
                  <input
                    type="number"
                    value={formData.pages}
                    onChange={(e) => setFormData({ ...formData, pages: Number(e.target.value) })}
                    placeholder="250"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Book Cover Image (URL or Device Upload)
                </label>
                <div className="flex items-center gap-3">
                  <img
                    src={formData.coverUrl}
                    alt="Cover Preview"
                    className="w-10 h-14 rounded object-cover border border-stone-300 shrink-0"
                  />
                  <div className="flex-1 space-y-1">
                    <input
                      type="url"
                      value={formData.coverUrl}
                      onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
                      placeholder="Cover Image URL"
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-300 outline-hidden"
                    />
                    <label className="inline-flex items-center gap-1 px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg cursor-pointer transition">
                      <Upload className="w-3 h-3" />
                      <span>Upload Cover Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  PDF or Digital Document Attachment
                </label>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-stone-600">
                    <span className="font-semibold flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-[#0E4D34]" />
                      File: {formData.pdfFileName || 'No PDF attached'}
                    </span>
                  </div>
                  <label className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 rounded-lg cursor-pointer transition text-xs font-semibold">
                    <Upload className="w-3 h-3" />
                    <span>Upload or Replace PDF File</span>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handlePdfUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Book Description & Synopsis *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Overview of the content, target audience, and key takeaways"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:border-[#0E4D34] outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Reader Text Excerpt / Sample Chapters
                </label>
                <textarea
                  rows={3}
                  value={formData.pdfContentPreview}
                  onChange={(e) => setFormData({ ...formData, pdfContentPreview: e.target.value })}
                  placeholder="Paste excerpt or preface for digital reading"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 outline-hidden font-serif"
                />
              </div>

              <div className="pt-3 flex gap-2 justify-end border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-save-book"
                  className="px-4 py-2 font-semibold text-white bg-[#0E4D34] hover:bg-[#093322] rounded-xl flex items-center gap-1.5 transition shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingBookId ? 'Update Book' : 'Publish to Library'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Book Confirmation */}
      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="Remove Book from Library"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action will remove the publication and its attached digital files.`}
        confirmLabel="Delete Book"
        onConfirm={() => {
          if (deleteTarget) {
            deleteBook(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
