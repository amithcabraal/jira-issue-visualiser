import { create } from 'zustand';
import { JiraTicket, Filters } from './types';

interface JiraStore {
  tickets: JiraTicket[];
  filters: Filters;
  setTickets: (tickets: JiraTicket[]) => void;
  setFilters: (filters: Partial<Filters>) => void;
  resetFilters: () => void;
  filteredTickets: JiraTicket[];
  hasActiveFilters: boolean;
}

export const useJiraStore = create<JiraStore>((set, get) => ({
  tickets: [],
  filters: {
    severity: [],
    labels: [],
    components: [],
    supplier: []
  },
  setTickets: (tickets) => {
    console.log('🎫 Setting tickets:', { count: tickets.length });
    set({ tickets });
  },
  setFilters: (newFilters) => {
    console.log('🔍 Updating filters:', newFilters);
    
    set((state) => {
      const updatedFilters = { ...state.filters, ...newFilters };
      console.log('🔍 Updated filters:', updatedFilters);
      
      // Calculate filtered tickets with the new filters
      const activeFilters = Object.entries(updatedFilters)
        .filter(([_, values]) => values.length > 0)
        .reduce((acc, [key, values]) => ({ ...acc, [key]: values }), {});
      
      const matchingTickets = state.tickets.filter(ticket => {
        const severityMatch = updatedFilters.severity.length === 0 || 
          updatedFilters.severity.includes(ticket.severity);
        
        const labelsMatch = updatedFilters.labels.length === 0 || 
          ticket.labels.some(label => updatedFilters.labels.includes(label));
        
        const componentsMatch = updatedFilters.components.length === 0 || 
          ticket.components.some(component => updatedFilters.components.includes(component));
        
        const supplierMatch = updatedFilters.supplier.length === 0 ||
          (Array.isArray(ticket.supplier) && ticket.supplier.length > 0 && 
           ticket.supplier.some(s => updatedFilters.supplier.includes(s)));

        return severityMatch && labelsMatch && componentsMatch && supplierMatch;
      });

      const linkedKeys = new Set<string>();
      matchingTickets.forEach(ticket => {
        ticket.links.forEach(link => {
          linkedKeys.add(link.key);
        });
      });

      const linkedTickets = state.tickets.filter(ticket => 
        linkedKeys.has(ticket.key) && !matchingTickets.some(t => t.key === ticket.key)
      );

      const filteredCount = matchingTickets.length + linkedTickets.length;
      
      console.log('🔄 Recalculating filtered tickets after filter update');
      console.log('📊 Active filters:', activeFilters);
      console.log(`📈 Filtered dataset size: ${filteredCount} tickets`);
      
      return { filters: updatedFilters };
    });
  },
  resetFilters: () => {
    console.log('🔄 Resetting all filters');
    set({
      filters: {
        severity: [],
        labels: [],
        components: [],
        supplier: []
      }
    });
  },
  get filteredTickets() {
    const state = get();
    const activeFilters = Object.entries(state.filters)
      .filter(([_, values]) => values.length > 0)
      .reduce((acc, [key, values]) => ({ ...acc, [key]: values }), {});
    
    if (Object.keys(activeFilters).length === 0) {
      return state.tickets;
    }
    
    console.log('📊 Calculating filtered tickets with active filters:', activeFilters);
    
    const matchingTickets = state.tickets.filter(ticket => {
      const severityMatch = state.filters.severity.length === 0 || 
        state.filters.severity.includes(ticket.severity);
      
      const labelsMatch = state.filters.labels.length === 0 || 
        ticket.labels.some(label => state.filters.labels.includes(label));
      
      const componentsMatch = state.filters.components.length === 0 || 
        ticket.components.some(component => state.filters.components.includes(component));
      
      const supplierMatch = state.filters.supplier.length === 0 ||
        (Array.isArray(ticket.supplier) && ticket.supplier.length > 0 && 
         ticket.supplier.some(s => state.filters.supplier.includes(s)));

      const matches = severityMatch && labelsMatch && componentsMatch && supplierMatch;
      
      if (matches) {
        console.log('✅ Ticket matches filters:', {
          key: ticket.key,
          severity: ticket.severity,
          labels: ticket.labels,
          components: ticket.components,
          supplier: ticket.supplier
        });
      }

      return matches;
    });

    // Get all linked tickets for the matching tickets
    const linkedKeys = new Set<string>();
    matchingTickets.forEach(ticket => {
      ticket.links.forEach(link => {
        linkedKeys.add(link.key);
      });
    });

    // Add any tickets that are linked to our matching tickets
    const linkedTickets = state.tickets.filter(ticket => 
      linkedKeys.has(ticket.key) && !matchingTickets.some(t => t.key === ticket.key)
    );

    const result = [...matchingTickets, ...linkedTickets];
    console.log('📊 Filter results:', {
      totalTickets: state.tickets.length,
      matchingTickets: matchingTickets.length,
      linkedTickets: linkedTickets.length,
      totalFiltered: result.length,
      activeFilters: Object.keys(activeFilters).length > 0
    });

    return result;
  },
  get hasActiveFilters() {
    const state = get();
    const hasFilters = Object.values(state.filters).some(filterArray => filterArray.length > 0);
    console.log('🔍 Checking active filters:', hasFilters);
    return hasFilters;
  }
}));