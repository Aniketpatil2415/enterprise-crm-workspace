import React from 'react';
import { Mail, Phone, Clock } from 'lucide-react';
import type { DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import type { Lead } from './KanbanBoard';

interface LeadCardProps {
  lead: Lead;
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
}

const LeadCard = ({ lead, provided, snapshot }: LeadCardProps) => {
  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      style={{ 
        ...provided.draggableProps.style 
      }}
      role="button"
      aria-label={`Drag Lead: ${lead.firstName}`}
      // 🔥 THE FIX: Completely removed backdrop-blur and any transition that delays movement
      className={`mb-3 p-4 rounded-lg border shadow-lg ${
        snapshot.isDragging 
          ? 'bg-brand-800 border-brand-400 shadow-brand-400/30 z-[9999]' 
          : 'bg-brand-900 border-glass-border hover:border-gray-500'
      }`}
    >
      <h4 className="font-bold text-white mb-1">
        {lead.firstName} {lead.lastName || ''}
      </h4>
      <div className="space-y-1.5 mt-3">
        {lead.email && (
          <div className="flex items-center text-xs text-gray-400">
            <Mail className="w-3.5 h-3.5 mr-2 text-gray-500" />
            <span className="truncate">{lead.email}</span>
          </div>
        )}
        {lead.phone && (
          <div className="flex items-center text-xs text-gray-400">
            <Phone className="w-3.5 h-3.5 mr-2 text-gray-500" />
            <span>{lead.phone}</span>
          </div>
        )}
        <div className="flex items-center text-xs text-gray-500 mt-2 pt-2 border-t border-glass-border/50">
          <Clock className="w-3.5 h-3.5 mr-2" />
          {new Date(lead.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default React.memo(LeadCard);