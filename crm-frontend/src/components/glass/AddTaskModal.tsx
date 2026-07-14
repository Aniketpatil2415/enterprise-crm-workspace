import { useState, useEffect } from 'react';
import { X, CheckSquare, Calendar, AlertCircle, Target, Loader2, AlignLeft } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { auth } from '../../lib/firebase';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskAdded: () => void;
}

export default function AddTaskModal({ isOpen, onClose, onTaskAdded }: AddTaskModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [deals, setDeals] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    dueDate: '',
    dealId: ''
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (isOpen) fetchDeals();
  }, [isOpen]);

  const fetchDeals = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const res = await axios.get(`${API_URL}/deals`, { headers: { 'x-user-id': currentUser.uid } });
      if (res.data.success) setDeals(res.data.data);
    } catch (error) {
      console.error('Failed to fetch deals for task linking', error);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Unauthorized');

      const response = await axios.post(
        `${API_URL}/tasks`,
        formData,
        { headers: { 'x-user-id': currentUser.uid } }
      );

      if (response.data.success) {
        toast.success('Action item scheduled successfully!');
        setFormData({ title: '', description: '', priority: 'MEDIUM', dueDate: '', dealId: '' });
        onTaskAdded();
        onClose();
      }
    } catch (error: any) {
      console.error('Failed to create task:', error);
      toast.error(error.response?.data?.message || 'Failed to connect to backend.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 fade-in">
      <div className="absolute inset-0 bg-brand-900/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-lg bg-brand-900 border border-glass-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-glass-border bg-brand-800/30 shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-brand-400" />
            Schedule New Task
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto custom-scrollbar p-6">
          <form id="task-form" onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase flex items-center gap-2">Task Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full bg-brand-900/50 border border-glass-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-400 transition-colors"
                placeholder="e.g. Follow up on proposal"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase flex items-center gap-2">
                <AlignLeft className="w-3.5 h-3.5" /> Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full bg-brand-900/50 border border-glass-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-400 transition-colors resize-none custom-scrollbar"
                placeholder="Add context or notes..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5" /> Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  className="w-full bg-brand-900/50 border border-glass-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-400 appearance-none cursor-pointer"
                >
                  <option value="LOW" className="bg-brand-900">Low</option>
                  <option value="MEDIUM" className="bg-brand-900">Medium</option>
                  <option value="HIGH" className="bg-brand-900">High</option>
                </select>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" /> Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  className="w-full bg-brand-900/50 border border-glass-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-400 transition-colors [color-scheme:dark]"
                />
              </div>
            </div>

            <div className="border-t border-glass-border/50 pt-5 mt-2 space-y-1.5">
              <label className="text-xs font-bold text-brand-400 uppercase tracking-wider flex items-center gap-2">
                <Target className="w-3.5 h-3.5" /> Link to Revenue Deal
              </label>
              <select
                value={formData.dealId}
                onChange={(e) => setFormData({...formData, dealId: e.target.value})}
                className="w-full bg-brand-900/50 border border-glass-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-400 appearance-none cursor-pointer"
              >
                <option value="" className="bg-brand-900 text-gray-500">-- Independent Task (No Deal) --</option>
                {deals.map(d => (
                  <option key={d.id} value={d.id} className="bg-brand-900 text-white">{d.title}</option>
                ))}
              </select>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-glass-border bg-brand-900 shrink-0">
          <button
            type="submit"
            form="task-form"
            disabled={isLoading}
            className="w-full bg-brand-400 hover:bg-white text-brand-900 font-bold py-3.5 rounded-lg transition-colors flex justify-center items-center gap-2 shadow-lg shadow-brand-400/20"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  );
}