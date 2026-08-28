import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  Plus,
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  CheckCircle2,
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import {
  listenToInventoryItems,
  addInventoryItem,
  adjustInventoryStock,
} from '../../services/firebaseService';
import { InventoryItem } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

export const InventoryModule: React.FC = () => {
  const { currentUser, isAdmin, isStorekeeper } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Add Form
  const [addForm, setAddForm] = useState({
    itemCode: 'UNIF-01',
    itemName: 'Official School Blazer (Navy Blue)',
    category: 'UNIFORM',
    quantity: 120,
    unit: 'Pieces',
    reorderLevel: 25,
    unitPrice: 2800,
    supplier: 'Uwezo Outfitters Ltd',
  });

  // Adjust Form
  const [adjustQty, setAdjustQty] = useState(10);
  const [adjustType, setAdjustType] = useState<'IN' | 'OUT'>('IN');
  const [adjustReason, setAdjustReason] = useState('New batch delivery from supplier');

  useEffect(() => {
    const unsub = listenToInventoryItems((data) => setItems(data));
    return () => unsub();
  }, []);

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.itemName) return;
    try {
      await addInventoryItem({
        ...addForm,
        quantity: Number(addForm.quantity),
        reorderLevel: Number(addForm.reorderLevel),
        unitPrice: Number(addForm.unitPrice),
      } as any);
      setIsAddModalOpen(false);
    } catch (err: any) {
      alert(`Error saving item: ${err.message}`);
    }
  };

  const handleExecuteAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    try {
      const change = adjustType === 'IN' ? Number(adjustQty) : -Number(adjustQty);
      await adjustInventoryStock(selectedItem.id, change, adjustReason);
      setIsAdjustModalOpen(false);
      setSelectedItem(null);
    } catch (err: any) {
      alert(`Error adjusting stock: ${err.message}`);
    }
  };

  const filteredItems = items.filter((i: any) => {
    const name = i.itemName || i.name || '';
    const code = i.itemCode || i.skuCode || '';
    const cat = i.category || '';
    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      code.toLowerCase().includes(search.toLowerCase()) ||
      cat.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black font-serif text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-emerald-600" />
            School Store & Inventory Stock
          </h1>
          <p className="text-xs text-slate-500">
            Track official uniforms, CBC exercise books, stationery, science apparatus, and sports equipment.
          </p>
        </div>

        {(isAdmin || isStorekeeper) && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Stock Item</span>
          </button>
        )}
      </div>

      {/* Search Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search stock code, item name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-800"
          />
        </div>
      </div>

      {/* Inventory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item: any) => {
          const name = item.itemName || item.name || 'Unnamed Item';
          const code = item.itemCode || item.skuCode || 'SKU-000';
          const qty = Number(item.quantity ?? item.quantityInStock ?? 0);
          const reorder = Number(item.reorderLevel || 10);
          const unit = item.unit || 'Units';
          const price = Number(item.unitPrice ?? item.unitCost ?? 0);
          const supplier = item.supplier || item.supplierName || 'Official Supplier';
          const isLowStock = qty <= reorder;

          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl p-5 border shadow-xs flex flex-col justify-between ${
                isLowStock ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] text-slate-400 font-bold">{code}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isLowStock
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {isLowStock ? 'Low Stock' : 'In Stock'}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mb-1">{name}</h3>
                <p className="text-xs text-slate-500 mb-3">{item.category} • Supplied by {supplier}</p>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Stock Level</span>
                    <span className="text-lg font-black text-slate-900">{qty} {unit}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase">Unit Price</span>
                    <span className="text-sm font-bold text-emerald-700">KES {price.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400">Reorder at: {reorder} {unit}</span>
                {(isAdmin || isStorekeeper) && (
                  <button
                    onClick={() => {
                      setSelectedItem(item);
                      setIsAdjustModalOpen(true);
                    }}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Stock In / Out</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Stock Item Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Inventory / Uniform Item"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSaveItem} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Item Code</label>
              <input
                type="text"
                required
                value={addForm.itemCode}
                onChange={(e) => setAddForm({ ...addForm, itemCode: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={addForm.category}
                onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
              >
                <option value="UNIFORM">Uniforms & Footwear</option>
                <option value="EXERCISE_BOOKS">Exercise Books & Stationery</option>
                <option value="SCIENCE_APPARATUS">Science & Lab Equipment</option>
                <option value="SPORTS_GEAR">Sports & Games Equipment</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Item Name *</label>
            <input
              type="text"
              required
              value={addForm.itemName}
              onChange={(e) => setAddForm({ ...addForm, itemName: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Initial Quantity</label>
              <input
                type="number"
                value={addForm.quantity}
                onChange={(e) => setAddForm({ ...addForm, quantity: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Reorder Alert Level</label>
              <input
                type="number"
                value={addForm.reorderLevel}
                onChange={(e) => setAddForm({ ...addForm, reorderLevel: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Unit Price (KES)</label>
              <input
                type="number"
                value={addForm.unitPrice}
                onChange={(e) => setAddForm({ ...addForm, unitPrice: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
            >
              Save Item
            </button>
          </div>
        </form>
      </Modal>

      {/* Stock Adjustment Modal */}
      {selectedItem && (
        <Modal
          isOpen={isAdjustModalOpen}
          onClose={() => setIsAdjustModalOpen(false)}
          title={`Adjust Stock: ${selectedItem.itemName}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleExecuteAdjust} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Current Quantity</span>
                <p className="text-lg font-black text-slate-900 font-mono">{selectedItem.quantity} {selectedItem.unit}</p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-600 self-center">{selectedItem.itemCode}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Transaction Type</label>
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                >
                  <option value="IN">Stock IN (Receive Batch)</option>
                  <option value="OUT">Stock OUT (Issue to Learner/Class)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-base font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Reason / Voucher Reference</label>
              <input
                type="text"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                placeholder="e.g. Dispatched to Grade 1 learners"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdjustModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
              >
                Confirm Adjustment
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
