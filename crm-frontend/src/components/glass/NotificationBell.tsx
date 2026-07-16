import { useState, useEffect, useRef } from 'react';
import { Bell, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import axios from 'axios';

// Replace this with your actual Auth hook path
import { auth } from '../../lib/firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Announcement {
    id: string;
    title: string;
    message: string;
    type: 'INFO' | 'WARNING' | 'SUCCESS';
    createdAt: string;
}

export default function NotificationBell() {
   const currentUser = auth.currentUser;
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Announcement[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            if (!currentUser) return;
            try {
                const response = await axios.get(`${API_URL}/announcements`, {
                    headers: { 'x-user-id': currentUser.uid }
                });
                if (response.data.success) {
                    setNotifications(response.data.data);
                    setUnreadCount(response.data.data.length); // Simple logic for unread count
                }
            } catch (error) {
                console.error('Failed to load notifications', error);
            }
        };
        fetchAnnouncements();
    }, [currentUser]);

    // Close dropdown if clicked outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'WARNING': return <AlertTriangle size={18} className="text-yellow-400 mt-1" />;
            case 'SUCCESS': return <CheckCircle size={18} className="text-emerald-400 mt-1" />;
            default: return <Info size={18} className="text-blue-400 mt-1" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon Button */}
            <button 
                onClick={() => {
                    setIsOpen(!isOpen);
                    setUnreadCount(0); // Reset count on open
                }}
                className="relative p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300"
            >
                <Bell size={20} className="text-gray-300" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-[#0B0F19] rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Glassmorphism Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-[#0B0F19]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden transform transition-all">
                    <div className="p-4 border-b border-white/5 bg-white/5">
                        <h3 className="text-sm font-semibold text-white tracking-wide">System Notifications</h3>
                    </div>
                    
                    <div className="max-h-80 overflow-y-auto scrollbar-hide">
                        {notifications.length === 0 ? (
                            <div className="p-6 text-center text-sm text-gray-500">
                                No new announcements.
                            </div>
                        ) : (
                            notifications.map((note) => (
                                <div key={note.id} className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors flex gap-3 items-start">
                                    {getIcon(note.type)}
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-200">{note.title}</h4>
                                        <p className="text-xs text-gray-400 mt-1 leading-relaxed">{note.message}</p>
                                        <span className="text-[10px] text-gray-500 mt-2 block">
                                            {new Date(note.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}