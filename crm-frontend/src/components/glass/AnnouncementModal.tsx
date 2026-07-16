import React, { useState } from 'react';
import { X, Send, Megaphone } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { auth } from '../../lib/firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface AnnouncementModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AnnouncementModal({ isOpen, onClose }: AnnouncementModalProps) {
    const currentUser = auth.currentUser;
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [type, setType] = useState('INFO');
    const [targetEmail, setTargetEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await axios.post(
                `${API_URL}/announcements`,
                { title, message, type, targetEmail: targetEmail || null },
                { headers: { 'x-user-id': currentUser?.uid } }
            );

            if (response.data.success) {
                toast.success('Broadcast launched successfully!');
                setTitle('');
                setMessage('');
                setTargetEmail('');
                onClose();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to send broadcast.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[#0B0F19]/90 border border-white/10 backdrop-blur-xl rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/5">
                    <div className="flex items-center gap-2 text-white">
                        <Megaphone size={20} className="text-emerald-400" />
                        <h2 className="text-lg font-semibold tracking-wide">Launch Broadcast</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Title</label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none"
                            placeholder="System Update v2.0"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Type</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:border-emerald-500 outline-none appearance-none"
                            >
                                <option value="INFO">Info (Blue)</option>
                                <option value="SUCCESS">Success (Green)</option>
                                <option value="WARNING">Warning (Yellow)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Target Email (Optional)</label>
                            <input
                                type="email"
                                value={targetEmail}
                                onChange={(e) => setTargetEmail(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:border-emerald-500 outline-none"
                                placeholder="Leave blank for all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Message</label>
                        <textarea
                            required
                            rows={4}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:border-emerald-500 outline-none resize-none"
                            placeholder="Enter the broadcast message here..."
                        />
                    </div>

                    {/* Actions */}
                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500 hover:text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? 'Launching...' : 'Fire Broadcast'}
                            <Send size={16} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}