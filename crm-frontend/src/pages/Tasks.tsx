import { useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import axios from 'axios';
import toast from 'react-hot-toast';
import { CheckSquare, Plus, Loader2, Calendar, Target, Clock, CheckCircle2, Trash2, AlertCircle } from 'lucide-react';
import AddTaskModal from '../components/glass/AddTaskModal';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  deal: { title: string } | null;
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const currentUser = auth.currentUser;
      const res = await axios.get(`${API_URL}/tasks`, { headers: { 'x-user-id': currentUser?.uid } });
      setTasks(res.data.data);
    } catch (e) {
      toast.error('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (taskId: string, newStatus: string) => {
    try {
      const currentUser = auth.currentUser;
      await axios.patch(`${API_URL}/tasks/${taskId}/status`, { status: newStatus }, {
        headers: { 'x-user-id': currentUser?.uid }
      });
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      if (newStatus === 'COMPLETED') toast.success('Task marked as complete!');
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!window.confirm('Archive this task?')) return;
    try {
      const currentUser = auth.currentUser;
      await axios.delete(`${API_URL}/tasks/${taskId}`, { headers: { 'x-user-id': currentUser?.uid } });
      setTasks(prev => prev.filter(t => t.id !== taskId));
      toast.success('Task archived.');
    } catch (e) {
      toast.error('Failed to delete task');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      case 'MEDIUM': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      default: return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    }
  };

  return (
    <div className="p-8 h-full max-w-7xl mx-auto w-full fade-in flex flex-col">
      <div className="flex justify-between items-center mb-8 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3 tracking-tight">
            <CheckSquare className="w-6 h-6 text-brand-400" /> Action Hub
          </h1>
          <p className="text-gray-400 text-sm mt-1">Manage your pipeline tasks, follow-ups, and deadlines.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-400 hover:bg-white text-brand-900 px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-lg shadow-brand-400/20"
        >
          <Plus className="w-5 h-5" /> Schedule Task
        </button>
      </div>

      {isLoading ? (
        <div className="flex-1 flex justify-center items-center">
          <Loader2 className="animate-spin text-brand-400 w-8 h-8" />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-10">
          {tasks.length === 0 ? (
            <div className="glass-panel border border-glass-border rounded-xl p-10 text-center flex flex-col items-center justify-center h-64">
              <CheckSquare className="w-12 h-12 text-gray-500 mb-4 opacity-30" />
              <p className="text-gray-400 font-medium">Inbox zero! Your task list is completely clear.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tasks.map(task => (
                <div key={task.id} className={`glass-panel border rounded-xl p-5 flex flex-col transition-all ${task.status === 'COMPLETED' ? 'border-emerald-500/30 bg-emerald-900/10 opacity-70' : 'border-glass-border hover:border-brand-500/50'}`}>
                  
                  <div className="flex justify-between items-start mb-3">
                    <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded border ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <button onClick={() => handleDelete(task.id)} className="text-gray-500 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className={`font-bold text-lg mb-2 ${task.status === 'COMPLETED' ? 'text-gray-400 line-through' : 'text-white'}`}>
                    {task.title}
                  </h3>
                  
                  {task.description && (
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-1">{task.description}</p>
                  )}

                  <div className="mt-auto space-y-2 pt-4 border-t border-glass-border/50">
                    {task.deal && (
                      <div className="flex items-center text-xs text-brand-400">
                        <Target className="w-3.5 h-3.5 mr-2" /> {task.deal.title}
                      </div>
                    )}
                    {task.dueDate && (
                      <div className="flex items-center text-xs text-amber-400/80">
                        <Calendar className="w-3.5 h-3.5 mr-2" /> {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-5 flex gap-2">
                    {task.status !== 'COMPLETED' ? (
                      <>
                        <button onClick={() => handleStatusUpdate(task.id, 'IN_PROGRESS')} className={`flex-1 py-2 text-xs font-bold rounded border transition-colors ${task.status === 'IN_PROGRESS' ? 'bg-brand-500/20 text-brand-400 border-brand-500/30' : 'border-glass-border text-gray-400 hover:text-white'}`}>
                          In Progress
                        </button>
                        <button onClick={() => handleStatusUpdate(task.id, 'COMPLETED')} className="flex-1 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 rounded text-xs font-bold transition-colors flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" /> Done
                        </button>
                      </>
                    ) : (
                      <button onClick={() => handleStatusUpdate(task.id, 'PENDING')} className="w-full py-2 border border-glass-border text-gray-400 hover:text-white rounded text-xs font-bold transition-colors flex items-center justify-center gap-1.5">
                        <Clock className="w-4 h-4" /> Reopen Task
                      </button>
                    )}
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <AddTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onTaskAdded={fetchTasks} />
    </div>
  );
}