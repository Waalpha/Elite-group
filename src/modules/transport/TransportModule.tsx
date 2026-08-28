import React, { useState, useEffect } from 'react';
import {
  Bus,
  Search,
  Plus,
  Phone,
  MapPin,
  Users,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import {
  listenToTransportRoutes,
  addTransportRoute,
} from '../../services/firebaseService';
import { TransportRoute } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

export const TransportModule: React.FC = () => {
  const { currentUser, isAdmin, isTransportManager } = useAuth();
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    routeName: 'Route 3 - Kilimani & Adams Arcade',
    vehicleRegistration: 'KDA 740Z',
    driverName: 'Erick Onyango',
    driverPhone: '+254721889900',
    capacity: 33,
    termFee: 14000,
    stops: ['Adams Arcade (6:50 AM)', 'Yaya Centre (7:05 AM)', 'Dennis Pritt (7:20 AM)', 'Uwezo Campus (7:35 AM)'],
  });

  useEffect(() => {
    const unsub = listenToTransportRoutes((data) => setRoutes(data));
    return () => unsub();
  }, []);

  const handleSaveRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addTransportRoute({
        ...formData,
        capacity: Number(formData.capacity),
        termFee: Number(formData.termFee),
        studentsAllocated: 0,
        active: true,
      } as any);
      setIsAddModalOpen(false);
    } catch (err: any) {
      alert(`Error saving route: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black font-serif text-slate-900 tracking-tight flex items-center gap-2">
            <Bus className="w-6 h-6 text-emerald-600" />
            School Transport & Bus Fleet
          </h1>
          <p className="text-xs text-slate-500">
            NTSA-certified school buses, GPS tracked routes, dedicated drivers, and morning/evening pickup zones.
          </p>
        </div>

        {(isAdmin || isTransportManager) && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Route / Bus</span>
          </button>
        )}
      </div>

      {/* Routes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {routes.map((r: any) => {
          const reg = r.vehicleRegistration || r.vehicleReg || 'BUS-001';
          const name = r.routeName || r.name || 'Unnamed Route';
          const driver = r.driverName || 'Designated School Driver';
          const phone = r.driverPhone || '+254 700 000 000';
          const allocated = r.studentsAllocated ?? r.assignedStudentsCount ?? 0;
          const cap = r.capacity || 50;
          const stops = Array.isArray(r.stops) ? r.stops : [];
          const fee = Number(r.termFee || (stops[0]?.monthlyFee ? stops[0].monthlyFee * 3 : 15000));

          return (
            <div
              key={r.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-black text-slate-900 bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-lg border border-amber-300">
                    {reg}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    NTSA Compliant
                  </span>
                </div>

                <h2 className="text-sm font-bold text-slate-900 mb-2">{name}</h2>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-xs text-slate-700 mb-3">
                  <p className="flex items-center justify-between">
                    <span className="text-slate-500">Driver:</span>
                    <span className="font-bold">{driver}</span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span className="text-slate-500">Driver Phone:</span>
                    <span className="font-mono font-bold text-emerald-700">{phone}</span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span className="text-slate-500">Term Bus Fee:</span>
                    <span className="font-mono font-bold text-slate-900">KES {fee.toLocaleString()}</span>
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Pickup Schedule & Stops</p>
                  <div className="space-y-1">
                    {stops.map((stop: any, sIdx: number) => {
                      const stopLabel = typeof stop === 'string' ? stop : `${stop.stopName || 'Stop'} (${stop.pickupTime || ''})`;
                      return (
                        <div key={sIdx} className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                          <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{stopLabel}</span>
                        </div>
                      );
                    })}
                    {stops.length === 0 && (
                      <p className="text-[11px] text-slate-400">Direct Express Run</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500">Allocated: {allocated} / {cap}</span>
                <span className="text-emerald-700 font-bold font-mono text-[10px]">Active Daily Run</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Route Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add School Transport Route & Vehicle"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSaveRoute} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Route Name *</label>
            <input
              type="text"
              required
              value={formData.routeName}
              onChange={(e) => setFormData({ ...formData, routeName: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bus Number Plate</label>
              <input
                type="text"
                required
                value={formData.vehicleRegistration}
                onChange={(e) => setFormData({ ...formData, vehicleRegistration: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono uppercase font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Seating Capacity</label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Driver Full Name</label>
              <input
                type="text"
                required
                value={formData.driverName}
                onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Driver Phone</label>
              <input
                type="tel"
                required
                value={formData.driverPhone}
                onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
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
              Save Transport Route
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
