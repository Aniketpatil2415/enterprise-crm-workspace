import { useState, useMemo, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import axios from 'axios';
import toast from 'react-hot-toast';
import { auth } from '../../lib/firebase';
import MemoizedLeadCard from './LeadCard';

export interface Lead {
  id: string;
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  status: string;
  order: number;
  createdAt: string;
}

const PIPELINE_STAGES = [
  { id: 'NEW', title: 'New Leads', color: 'bg-blue-500' },
  { id: 'CONTACTED', title: 'Contacted', color: 'bg-amber-500' },
  { id: 'QUALIFIED', title: 'Qualified', color: 'bg-indigo-500' },
  { id: 'PROPOSAL', title: 'Proposal Sent', color: 'bg-purple-500' },
  { id: 'WON', title: 'Closed Won', color: 'bg-emerald-500' },
  { id: 'LOST', title: 'Closed Lost', color: 'bg-red-500' }
];

interface KanbanBoardProps {
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
}

export default function KanbanBoard({ leads, setLeads }: KanbanBoardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // 🔥 Optimization: Group and sort leads dynamically without 6x filtering on every render
  const groupedLeads = useMemo(() => {
    const groups: Record<string, Lead[]> = {};
    PIPELINE_STAGES.forEach(stage => { groups[stage.id] = []; });
    
    leads.forEach(lead => {
      if (groups[lead.status]) groups[lead.status].push(lead);
    });

    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => a.order - b.order); // Stable sorting by exact position
    });

    return groups;
  }, [leads]);

  // Refactored Method 1: Local State Reordering
  const reorderColumns = useCallback((
    sourceId: string, 
    destId: string, 
    sourceIndex: number, 
    destIndex: number
  ): Lead[] => {
    const newGroups = { ...groupedLeads };
    const sourceItems = Array.from(newGroups[sourceId] || []);
    const destItems = sourceId === destId ? sourceItems : Array.from(newGroups[destId] || []);

    const [movedLead] = sourceItems.splice(sourceIndex, 1);
    movedLead.status = destId;
    destItems.splice(destIndex, 0, movedLead);

    newGroups[sourceId] = sourceItems;
    newGroups[destId] = destItems;

    // Recalculate sequential orders for the affected destination column
    newGroups[destId] = newGroups[destId].map((lead, index) => ({ ...lead, order: index }));

    // Flatten back to a single array for the main state
    return Object.values(newGroups).flat();
  }, [groupedLeads]);

  // Refactored Method 2: Backend Sync
  const syncWithBackend = async (leadId: string, newStatus: string, newOrder: number) => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Authentication required');

    console.log(`[DND LOG] Syncing Lead ${leadId} -> Status: ${newStatus}, Order: ${newOrder}`);

    const response = await axios.patch(
      `${API_URL}/leads/${leadId}/status`,
      { status: newStatus, order: newOrder },
      { headers: { 'x-user-id': currentUser.uid } }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Backend validation failed');
    }
    return response.data.data; // Merging updated backend state if needed
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    console.log(`[DND LOG] Moved Lead ${draggableId} from ${source.droppableId} to ${destination.droppableId}`);

    setIsUpdating(true); // 🔥 Loading Protection: Disable subsequent drags during API call
    const previousLeadsState = [...leads];

    // Optimistic Update execution
    const newlyOrderedLeads = reorderColumns(
      source.droppableId, 
      destination.droppableId, 
      source.index, 
      destination.index
    );
    setLeads(newlyOrderedLeads);

    try {
      await syncWithBackend(draggableId, destination.droppableId, destination.index);
    } catch (error: any) {
      console.error('[DND ERROR]', error);
      toast.error(error.response?.data?.message || 'Update failed. Rolling back.');
      setLeads(previousLeadsState); // Strict Rollback
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex h-full w-full overflow-x-auto pb-4 gap-6 custom-scrollbar">
      <DragDropContext onDragEnd={handleDragEnd}>
        {PIPELINE_STAGES.map((stage) => {
          const columnLeads = groupedLeads[stage.id] || [];

          return (
            <div key={stage.id} className="min-w-[320px] max-w-[320px] flex flex-col">
              <div className="flex items-center justify-between mb-4 px-2 shrink-0">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${stage.color}`}></span>
                  {stage.title}
                </h3>
                <span className="bg-brand-800/80 text-gray-300 text-xs font-bold px-2 py-1 rounded-md">
                  {columnLeads.length}
                </span>
              </div>

              <Droppable droppableId={stage.id} isDropDisabled={isUpdating}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{ minHeight: '500px' }}
                    // 🔥 THE FIX: Removed backdrop-blur-sm from the Droppable column to prevent CSS Stacking Context offset bugs
className={`flex-1 p-3 rounded-xl border border-glass-border ${
  snapshot.isDraggingOver ? 'bg-brand-500/10 border-brand-400/50' : 'bg-brand-900/60'
}`}
                  >
                    {columnLeads.map((lead, index) => (
                      <Draggable 
                        key={String(lead.id)} 
                        draggableId={String(lead.id)} 
                        index={index}
                        isDragDisabled={isUpdating}
                      >
                        {(provided, snapshot) => (
                          <MemoizedLeadCard 
                            lead={lead} 
                            provided={provided} 
                            snapshot={snapshot} 
                          />
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </DragDropContext>
    </div>
  );
}