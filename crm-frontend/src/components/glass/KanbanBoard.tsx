import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd'; // 🔥 TypeScript Strict Mode Fix
import { Mail, Phone, Clock } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { auth } from '../../lib/firebase';

// Strictly defining our Pipeline Stages based on our MySQL Prisma Schema
const PIPELINE_STAGES = [
  { id: 'NEW', title: 'New Leads', color: 'bg-blue-500' },
  { id: 'CONTACTED', title: 'Contacted', color: 'bg-amber-500' },
  { id: 'QUALIFIED', title: 'Qualified', color: 'bg-indigo-500' },
  { id: 'PROPOSAL', title: 'Proposal Sent', color: 'bg-purple-500' },
  { id: 'WON', title: 'Closed Won', color: 'bg-emerald-500' },
  { id: 'LOST', title: 'Closed Lost', color: 'bg-red-500' }
];

interface KanbanBoardProps {
  leads: any[];
  onLeadsUpdated: () => void; // Function to refresh data after a successful drop
}

export default function KanbanBoard({ leads, onLeadsUpdated }: KanbanBoardProps) {
  
  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // If dropped outside a valid column, do nothing
    if (!destination) return;

    // If dropped in the exact same column and position, do nothing
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const leadId = draggableId;
    const newStatus = destination.droppableId;
    

    // Optimistic UI update could go here, but for strict enterprise data integrity, 
    // we wait for the server confirmation first.
    
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Unauthorized');

      // Call our secure Backend API to update the status in MySQL
      const response = await axios.patch(
        `http://localhost:5000/api/leads/${leadId}/status`,
        { status: newStatus },
        {
          headers: { 'x-user-id': currentUser.uid }
        }
      );

      if (response.data.success) {
        toast.success(`Lead moved to ${newStatus}`);
        onLeadsUpdated(); // Refresh the dashboard data
      }
    } catch (error: any) {
      console.error('Drag & Drop Error:', error);
      toast.error('Failed to move lead. Reverting position.');
      onLeadsUpdated(); // Refresh to revert UI to server state
    }
  };

  // Helper to group leads by their current status
  const getLeadsByStatus = (status: string) => {
    return leads.filter((lead) => lead.status === status);
  };

  return (
    <div className="flex h-full w-full overflow-x-auto pb-4 gap-6 custom-scrollbar">
      <DragDropContext onDragEnd={handleDragEnd}>
        {PIPELINE_STAGES.map((stage) => (
          <div key={stage.id} className="min-w-[320px] max-w-[320px] flex flex-col">
            
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${stage.color}`}></span>
                {stage.title}
              </h3>
              <span className="bg-brand-800/80 text-gray-300 text-xs font-bold px-2 py-1 rounded-md">
                {getLeadsByStatus(stage.id).length}
              </span>
            </div>

            {/* Droppable Area (The Column) */}
            <Droppable droppableId={stage.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-1 p-3 rounded-xl border border-glass-border transition-colors duration-200 ${
                    snapshot.isDraggingOver ? 'bg-brand-500/10 border-brand-400/50' : 'bg-glass-light'
                  }`}
                >
                  {getLeadsByStatus(stage.id).map((lead, index) => (
                    
                    /* Draggable Card (The Lead) */
                    <Draggable key={lead.id} draggableId={lead.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`mb-3 p-4 rounded-lg border shadow-lg backdrop-blur-md transition-all ${
                            snapshot.isDragging ? 'bg-brand-800 border-brand-400 shadow-brand-400/20 scale-105 z-50' : 'bg-brand-900/80 border-glass-border hover:border-gray-500'
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
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </DragDropContext>
    </div>
  );
}