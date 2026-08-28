import React, { useState, useEffect } from 'react';
import {
  Library,
  BookOpen,
  Search,
  Plus,
  ArrowRightLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import {
  listenToLibraryBooks,
  listenToBookLoans,
  addLibraryBook,
  borrowBook,
  returnBook,
  listenToStudents,
} from '../../services/firebaseService';
import { LibraryBook, BookLoan, Student } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

export const LibraryModule: React.FC = () => {
  const { currentUser, isAdmin, isLibrarian } = useAuth();
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [loans, setLoans] = useState<BookLoan[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'CATALOG' | 'LOANS'>('CATALOG');

  // Modals
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<LibraryBook | null>(null);

  // Form State for Add Book
  const [bookForm, setBookForm] = useState({
    isbn: '978-9966-25-104-2',
    title: '',
    author: '',
    publisher: 'Kenya Literature Bureau (KLB)',
    category: 'CBC_TEXTBOOK',
    gradeLevel: 'GRADE_1',
    totalCopies: 40,
    availableCopies: 40,
    shelfLocation: 'Shelf A3 - Primary Section',
  });

  // Borrow Form
  const [borrowStudentId, setBorrowStudentId] = useState('');
  const [borrowDueDate, setBorrowDueDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );

  useEffect(() => {
    const unsubB = listenToLibraryBooks((data) => setBooks(data));
    const unsubL = listenToBookLoans((data) => setLoans(data));
    const unsubS = listenToStudents((data) => setStudents(data));
    return () => {
      unsubB();
      unsubL();
      unsubS();
    };
  }, []);

  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookForm.title || !bookForm.author) {
      alert('Please fill book title and author');
      return;
    }
    try {
      await addLibraryBook({
        ...bookForm,
        availableCopies: Number(bookForm.totalCopies),
        totalCopies: Number(bookForm.totalCopies),
      } as any);
      setIsAddBookOpen(false);
    } catch (err: any) {
      alert(`Error adding book: ${err.message}`);
    }
  };

  const handleExecuteBorrow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook || !borrowStudentId) {
      alert('Please select a learner');
      return;
    }

    const st = students.find((s) => s.id === borrowStudentId);
    if (!st) return;

    try {
      await borrowBook({
        bookId: selectedBook.id,
        bookTitle: selectedBook.title,
        isbn: selectedBook.isbn,
        borrowerId: st.id,
        borrowerName: `${st.firstName} ${st.lastName}`,
        borrowerType: 'STUDENT',
        borrowDate: new Date().toISOString().split('T')[0],
        dueDate: borrowDueDate,
        status: 'BORROWED',
      });
      setIsBorrowModalOpen(false);
      setSelectedBook(null);
    } catch (err: any) {
      alert(`Error checking out book: ${err.message}`);
    }
  };

  const handleExecuteReturn = async (loan: BookLoan) => {
    if (confirm(`Mark "${loan.bookTitle}" as returned by ${loan.borrowerName}?`)) {
      try {
        await returnBook(loan.id, loan.bookId);
      } catch (err: any) {
        alert(`Error returning book: ${err.message}`);
      }
    }
  };

  const filteredBooks = books.filter(
    (b) =>
      (b.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.author || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.isbn || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black font-serif text-slate-900 tracking-tight flex items-center gap-2">
            <Library className="w-6 h-6 text-emerald-600" />
            Library Catalog & Book Circulation
          </h1>
          <p className="text-xs text-slate-500">
            KICD approved textbooks, CBC readers, digital learning resources, and circulation loan tracking.
          </p>
        </div>

        {(isAdmin || isLibrarian) && (
          <button
            onClick={() => setIsAddBookOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Catalog New Book</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-bold">
        <button
          onClick={() => setActiveTab('CATALOG')}
          className={`pb-3 px-3 transition cursor-pointer border-b-2 ${
            activeTab === 'CATALOG'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Book Catalog ({books.length})
        </button>
        <button
          onClick={() => setActiveTab('LOANS')}
          className={`pb-3 px-3 transition cursor-pointer border-b-2 ${
            activeTab === 'LOANS'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Active Loans & Returns ({loans.filter((l) => l.status === 'BORROWED').length})
        </button>
      </div>

      {/* TAB 1: Catalog */}
      {activeTab === 'CATALOG' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="relative w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search title, author, ISBN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBooks.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] text-slate-400 font-bold">{b.isbn}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        b.availableCopies > 0
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {b.availableCopies} Available
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mb-1">{b.title}</h3>
                  <p className="text-xs text-slate-600 mb-2">By {b.author}</p>
                  <p className="text-[11px] text-slate-500">{b.publisher} • {b.shelfLocation}</p>
                </div>

                <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Total: {b.totalCopies} Copies</span>
                  {(isAdmin || isLibrarian) && b.availableCopies > 0 && (
                    <button
                      onClick={() => {
                        setSelectedBook(b);
                        setIsBorrowModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
                      <span>Issue Book</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Loans */}
      {activeTab === 'LOANS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                  <th className="py-3 px-4">Book Title / ISBN</th>
                  <th className="py-3 px-4">Borrower Name</th>
                  <th className="py-3 px-4">Issued Date</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{loan.bookTitle}</p>
                      <span className="text-[10px] font-mono text-slate-400">{loan.isbn}</span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{loan.borrowerName}</td>
                    <td className="py-3 px-4 text-slate-600">{loan.borrowDate}</td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-700">{loan.dueDate}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          loan.status === 'RETURNED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : loan.status === 'OVERDUE'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {loan.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {loan.status === 'BORROWED' && (
                        <button
                          onClick={() => handleExecuteReturn(loan)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs cursor-pointer"
                        >
                          Mark Returned
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Book Modal */}
      <Modal
        isOpen={isAddBookOpen}
        onClose={() => setIsAddBookOpen(false)}
        title="Catalog New Library Resource / Reader"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSaveBook} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Book Title *</label>
            <input
              type="text"
              required
              value={bookForm.title}
              onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
              placeholder="e.g. Mentor CBC Mathematics Learner's Guide Grade 1"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Author *</label>
              <input
                type="text"
                required
                value={bookForm.author}
                onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">ISBN Number</label>
              <input
                type="text"
                value={bookForm.isbn}
                onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Publisher</label>
              <input
                type="text"
                value={bookForm.publisher}
                onChange={(e) => setBookForm({ ...bookForm, publisher: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Total Copies Received</label>
              <input
                type="number"
                value={bookForm.totalCopies}
                onChange={(e) => setBookForm({ ...bookForm, totalCopies: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddBookOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
            >
              Add to Library
            </button>
          </div>
        </form>
      </Modal>

      {/* Borrow Checkout Modal */}
      {selectedBook && (
        <Modal
          isOpen={isBorrowModalOpen}
          onClose={() => setIsBorrowModalOpen(false)}
          title={`Check Out Book: ${selectedBook.title}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleExecuteBorrow} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Select Borrower (Student) *</label>
              <select
                required
                value={borrowStudentId}
                onChange={(e) => setBorrowStudentId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
              >
                <option value="">-- Choose Learner --</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.admissionNumber} — {s.firstName} {s.lastName} ({(s.grade || s.gradeLevel || '').replace('_', ' ')})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Return Due Date</label>
              <input
                type="date"
                value={borrowDueDate}
                onChange={(e) => setBorrowDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsBorrowModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
              >
                Confirm Loan
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
