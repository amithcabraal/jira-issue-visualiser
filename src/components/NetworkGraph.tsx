import React, { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { useJiraStore } from '../store';
import { GraphNode, GraphLink } from '../types';
import { Maximize2, Minimize2, Upload } from 'lucide-react';

const getSeverityColor = (severity: string, isDark: boolean): string => {
  const darkMode = {
    critical: '#ef4444',
    high: '#f97316',
    medium: '#facc15',
    low: '#4ade80',
    default: '#cbd5e1'
  };

  const lightMode = {
    critical: '#dc2626',
    high: '#ea580c',
    medium: '#ca8a04',
    low: '#16a34a',
    default: '#64748b'
  };

  const colors = isDark ? darkMode : lightMode;
  
  switch (severity.toLowerCase()) {
    case 'critical':
      return colors.critical;
    case 'high':
      return colors.high;
    case 'medium':
      return colors.medium;
    case 'low':
      return colors.low;
    default:
      return colors.default;
  }
};

export const NetworkGraph: React.FC = () => {
  console.log('🎨 Rendering NetworkGraph component');
  const tickets = useJiraStore((state) => state.tickets);
  const filteredTickets = useJiraStore((state) => state.filteredTickets);
  const hasActiveFilters = useJiraStore((state) => state.hasActiveFilters);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [isDarkMode, setIsDarkMode] = useState(() => 
    document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    console.log('🌓 Dark mode changed:', isDarkMode);
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const newDarkMode = document.documentElement.classList.contains('dark');
          console.log('🌓 Dark mode updated:', newDarkMode);
          setIsDarkMode(newDarkMode);
          // Force graph update when theme changes
          if (graphRef.current) {
            // Reheat the simulation to trigger a re-render with new colors
            graphRef.current.d3ReheatSimulation();
          }
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        const newDimensions = {
          width: width,
          height: isFullscreen ? window.innerHeight : 600
        };
        console.log('📐 Graph dimensions updated:', newDimensions);
        setDimensions(newDimensions);
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [isFullscreen]);

  const toggleFullscreen = () => {
    console.log('🖥️ Toggling fullscreen mode');
    if (!isFullscreen) {
      const element = containerRef.current;
      if (element?.requestFullscreen) {
        element.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const { nodes, links } = useMemo(() => {
    console.log('🔄 Recalculating graph data', {
      totalTickets: tickets.length,
      filteredTickets: filteredTickets.length,
      hasActiveFilters
    });
    
    const displayTickets = hasActiveFilters ? filteredTickets : tickets;
    const nodesMap = new Map<string, GraphNode>();

    displayTickets.forEach(ticket => {
      nodesMap.set(ticket.key, {
        id: ticket.key,
        color: getSeverityColor(ticket.severity, isDarkMode),
        val: 1,
        data: ticket
      });
    });

    displayTickets.forEach(ticket => {
      ticket.links.forEach(link => {
        if (!nodesMap.has(link.key)) {
          nodesMap.set(link.key, {
            id: link.key,
            color: isDarkMode ? '#475569' : '#94a3b8',
            val: 0.7,
            data: {
              key: link.key,
              summary: link.summary,
              status: link.status,
              severity: '-',
              id: '',
              issuetype: '',
              priorityRank: '',
              priorityName: '',
              created: '',
              updated: '',
              assignee: '',
              reporter: '',
              components: [],
              labels: [],
              supplier: [],
              project: '',
              links: []
            }
          });
        }
      });
    });

    const links: GraphLink[] = displayTickets.flatMap(ticket =>
      ticket.links
        .filter(link => nodesMap.has(link.key))
        .map(link => ({
          source: ticket.key,
          target: link.key,
          type: link.type
        }))
    );

    console.log('📊 Graph data calculated:', {
      nodes: nodesMap.size,
      links: links.length,
      displayTickets: displayTickets.length
    });

    return {
      nodes: Array.from(nodesMap.values()),
      links
    };
  }, [tickets, filteredTickets, hasActiveFilters, isDarkMode]);

  useEffect(() => {
    if (graphRef.current) {
      console.log('🔄 Reheating graph simulation');
      graphRef.current.d3Force('link').distance(50);
      graphRef.current.d3Force('charge').strength(-100);
      graphRef.current.d3ReheatSimulation();
    }
  }, [nodes, links]);

  const handleNodeHover = useCallback((node: GraphNode | null) => {
    if (!node) return;
    console.log('🔍 Node hover:', node.id);
    
    const ticket = node.data;
    const tooltip = document.getElementById('graph-tooltip');
    if (!tooltip) return;

    tooltip.innerHTML = `
      <div class="p-4">
        <h3 class="font-bold">${ticket.key}</h3>
        <p class="text-sm">${ticket.summary}</p>
        <p class="text-sm mt-2">
          Status: ${ticket.status}<br>
          Severity: ${ticket.severity}<br>
          ${ticket.priorityName ? `Priority: ${ticket.priorityName}` : ''}
        </p>
        <a href="https://jira.example.com/browse/${ticket.key}" 
           class="text-blue-500 hover:underline text-sm mt-2 block" 
           target="_blank" 
           rel="noopener noreferrer">
          View in JIRA
        </a>
      </div>
    `;
    tooltip.style.display = 'block';
  }, []);

  if (tickets.length === 0) {
    console.log('ℹ️ No tickets to display');
    return (
      <div 
        ref={containerRef}
        className="relative bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 flex flex-col items-center justify-center min-h-[400px]"
      >
        <Upload className="w-16 h-16 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Data to Display</h3>
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
          Upload a JIRA data file to visualize the network of ticket relationships.
        </p>
      </div>
    );
  }

  if (hasActiveFilters && filteredTickets.length === 0) {
    console.log('ℹ️ No tickets match current filters');
    return (
      <div 
        ref={containerRef}
        className="relative bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 flex flex-col items-center justify-center min-h-[400px]"
      >
        <Upload className="w-16 h-16 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Matching Tickets</h3>
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
          No tickets match the current filter criteria. Try adjusting the filters to see more results.
        </p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`relative bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50' : ''
      }`}
    >
      <button
        onClick={toggleFullscreen}
        className="absolute top-6 right-6 z-10 p-2 bg-white dark:bg-gray-700 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
        aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
      >
        {isFullscreen ? (
          <Minimize2 className="w-5 h-5" />
        ) : (
          <Maximize2 className="w-5 h-5" />
        )}
      </button>
      <div id="graph-tooltip" className="absolute hidden shadow-lg rounded-lg z-10" />
      <ForceGraph2D
        ref={graphRef}
        graphData={{ nodes, links }}
        nodeLabel="id"
        nodeColor="color"
        nodeVal={node => (node as GraphNode).val}
        linkDirectionalArrowLength={3}
        linkDirectionalArrowRelPos={1}
        onNodeHover={handleNodeHover}
        width={dimensions.width - 32}
        height={dimensions.height - 32}
        backgroundColor={isDarkMode ? '#1f2937' : '#ffffff'}
        linkColor={isDarkMode ? 'red' : 'blue'}
      />
    </div>
  );
};

export default NetworkGraph;