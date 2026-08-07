import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import coseBilkent from 'cytoscape-cose-bilkent';
import cytoscape from 'cytoscape';
import { ZoomIn, ZoomOut, Maximize, Circle, Layers, RefreshCw, Search } from 'lucide-react';
import NodePanel from './NodePanel';
import { getRiskTier } from '../../utils/riskHelpers';

try { cytoscape.use(coseBilkent); } catch (e) {}

// Formatter for exact dollar amounts e.g., $500, $2,300, $18,400
const formatExactCurrency = (val) => {
  if (val == null) return '$0';
  return `$${Math.round(val).toLocaleString()}`;
};

// Utility to generate dynamic SVG cards for nodes
const generateNodeSVG = (node) => {
  const isFraud = node.riskScore >= 80;
  const isMedium = node.riskScore >= 50 && node.riskScore < 80;
  
  const ringColor = isFraud ? '#ffb4ab' : isMedium ? '#ffb74d' : '#4cd7f6';
  const bgColor = '#141313';
  const textColor = '#ffffff';
  const subtextColor = '#c4c7c8';
  
  // Clean text to avoid XML errors
  const safeName = (node.customerName || 'Unknown').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeAcc = (node.accountNumber || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const typeStr = (node.accountType || 'Account').toUpperCase();

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="180" height="76" viewBox="0 0 180 76">
      <!-- Card Background -->
      <rect x="2" y="2" width="176" height="72" rx="12" fill="${bgColor}" stroke="${ringColor}" stroke-width="1.5" stroke-opacity="0.6"/>
      
      <!-- Risk Ring -->
      <circle cx="34" cy="38" r="18" fill="none" stroke="${ringColor}" stroke-width="2.5" stroke-dasharray="8 4" />
      <circle cx="34" cy="38" r="14" fill="${ringColor}" fill-opacity="0.15" />
      
      <!-- Avatar Icon -->
      ${node.accountType === 'Business' 
        ? `<rect x="29" y="32" width="10" height="12" fill="none" stroke="${ringColor}" stroke-width="1.5"/><path d="M29 32L34 27L39 32" fill="none" stroke="${ringColor}" stroke-width="1.5"/>`
        : `<circle cx="34" cy="34" r="4" fill="none" stroke="${ringColor}" stroke-width="1.5"/><path d="M26 44 C 26 40, 42 40, 42 44" fill="none" stroke="${ringColor}" stroke-width="1.5"/>`
      }
      
      <!-- Text Content -->
      <text x="64" y="26" font-family="system-ui, sans-serif" font-size="9" font-weight="bold" letter-spacing="1" fill="${subtextColor}" opacity="0.8">${typeStr}</text>
      <text x="64" y="44" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" fill="${textColor}">${safeName}</text>
      <text x="64" y="60" font-family="monospace" font-size="10" fill="${subtextColor}" opacity="0.9">${safeAcc}</text>
    </svg>
  `;
  
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
};

export default function NetworkGraph({ data, nodeLimit = 300, onNodeLimitChange, onRefresh }) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [layoutName, setLayoutName] = useState('cose-bilkent');

  const cyRef = useRef(null);

  const elements = useMemo(() => {
    if (!data?.nodes) return [];

    const nodes = data.nodes.map(node => {
      const tier = getRiskTier(node.riskScore);
      return {
        data: {
          id: node.id,
          customerName: node.customerName,
          accountType: node.accountType,
          accountNumber: node.accountNumber,
          riskScore: node.riskScore,
          degree: node.degree,
          communityId: node.communityId,
          fii: node.fii,
          bds: node.bds,
          nes: node.nes,
          ips: node.ips,
          isFraud: node.isFraud,
          svgImage: generateNodeSVG(node),
          tierColor: tier.color
        }
      };
    });

    const edges = (data.edges || []).map((edge, idx) => {
      const amountLabel = formatExactCurrency(edge.totalAmount);
      const isCycle = edge.isCycle || (edge.isFraud && edge.totalAmount > 10000);
      return {
        data: {
          id: `e-${edge.source}-${edge.target}-${idx}`,
          source: edge.source,
          target: edge.target,
          totalAmount: edge.totalAmount,
          isFraud: edge.isFraud,
          isCycle: isCycle,
          amountLabel,
        }
      };
    });

    return [...nodes, ...edges];
  }, [data]);

  const stylesheet = useMemo(() => [
    {
      selector: 'node',
      style: {
        'shape': 'rectangle',
        'width': 180,
        'height': 76,
        'background-color': 'transparent',
        'background-image': 'data(svgImage)',
        'background-fit': 'contain',
        'border-width': 0,
        'z-index': 50,
      }
    },
    {
      selector: 'edge',
      style: {
        'width': 2.5,
        'line-color': '#e2e8f0',
        'target-arrow-color': '#e2e8f0',
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier',
        'arrow-scale': 1.3,
        'opacity': 0.95,
        'label': 'data(amountLabel)',
        'font-size': '10px',
        'font-weight': '600',
        'color': '#ffffff',
        'text-rotation': 0,
        'text-outline-color': '#0f172a',
        'text-outline-width': 1,
        'text-background-color': '#0f172a',
        'text-background-opacity': 0.95,
        'text-background-padding': '4px 6px',
        'text-background-shape': 'roundrectangle',
        'text-margin-y': -8,
        'z-index': 10,
      }
    },
    {
      selector: 'edge[?isFraud]',
      style: {
        'width': 3,
        'line-color': '#ef4444',
        'line-style': 'dashed',
        'line-dash-pattern': [8, 5],
        'target-arrow-color': '#ef4444',
        'target-arrow-shape': 'triangle',
        'arrow-scale': 1.4,
        'opacity': 1.0,
        'color': '#ffffff',
        'text-background-color': '#450a0a',
        'z-index': 25,
      }
    },
    {
      selector: 'edge[?isCycle]',
      style: {
        'width': 4,
        'line-color': '#f97316',
        'line-style': 'dashed',
        'line-dash-pattern': [10, 4],
        'target-arrow-color': '#f97316',
        'target-arrow-shape': 'triangle',
        'arrow-scale': 1.6,
        'opacity': 1.0,
        'color': '#ffffff',
        'text-background-color': '#431407',
        'z-index': 35,
      }
    },
    {
      selector: 'edge.connected-highlight',
      style: {
        'width': 4.5,
        'opacity': 1.0,
        'z-index': 90,
      }
    },
    {
      selector: 'node.selected',
      style: {
        'underlay-color': '#ffffff',
        'underlay-padding': '6px',
        'underlay-opacity': 0.9,
        'underlay-shape': 'roundrectangle',
        'z-index': 100,
      }
    },
    {
      selector: 'node:active',
      style: {
        'overlay-opacity': 0
      }
    },
    {
      selector: 'node.search-match',
      style: {
        'underlay-color': '#38bdf8',
        'underlay-padding': '8px',
        'underlay-opacity': 1,
        'underlay-shape': 'roundrectangle',
        'z-index': 1000,
      }
    },
    {
      selector: 'node.dimmed',
      style: { 'opacity': 0.12 }
    },
    {
      selector: 'edge.dimmed',
      style: { 'opacity': 0.08 }
    },
    {
      selector: 'node.hover',
      style: {
        'width': 188,
        'height': 80,
        'z-index': 95,
      }
    }
  ], []);

  const layout = useMemo(() => {
    if (layoutName === 'circle') {
      return { name: 'circle', animate: true, padding: 60 };
    }
    return {
      name: 'cose-bilkent',
      idealEdgeLength: 170,
      nodeRepulsion: 14000,
      gravity: 0.15,
      animate: 'end',
      animationDuration: 800,
      fit: true,
      padding: 60,
    };
  }, [layoutName]);

  const handleCyInit = useCallback((cy) => {
    cyRef.current = cy;
    
    // Node selection (tap)
    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      cy.nodes().removeClass('selected');
      node.addClass('selected');
      setSelectedNode(node.data());
      
      // Spotlight connected edges and nodes
      cy.elements().addClass('dimmed').removeClass('connected-highlight');
      node.removeClass('dimmed');
      const connectedEdges = node.connectedEdges();
      const connectedNodes = connectedEdges.connectedNodes();
      connectedNodes.removeClass('dimmed');
      connectedEdges.removeClass('dimmed').addClass('connected-highlight');
    });
    
    // Canvas tap (reset)
    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        setSelectedNode(null);
        cy.elements().removeClass('dimmed search-match hover selected connected-highlight');
      }
    });

    // Hover effect
    cy.on('mouseover', 'node', (evt) => {
      const node = evt.target;
      node.addClass('hover');
      cy.container().style.cursor = 'pointer';

      // Highlight on hover if no node is currently selected
      if (!cy.nodes('.selected').length) {
        const connectedEdges = node.connectedEdges();
        const connectedNodes = connectedEdges.connectedNodes();
        
        cy.elements().addClass('dimmed');
        node.removeClass('dimmed');
        connectedNodes.removeClass('dimmed');
        connectedEdges.removeClass('dimmed').addClass('connected-highlight');
      }
    });

    cy.on('mouseout', 'node', (evt) => {
      const node = evt.target;
      node.removeClass('hover');
      cy.container().style.cursor = 'default';

      // Reset hover highlights if no node is selected
      if (!cy.nodes('.selected').length) {
        cy.elements().removeClass('dimmed connected-highlight');
      }
    });
  }, []);

  // Edge animation loop for suspicious & money laundering cycle edges
  useEffect(() => {
    if (!cyRef.current) return;
    
    let animationFrame;
    let offset = 0;
    let cyclePulse = 0;
    let lastTime = 0;
    
    const animateEdges = (time) => {
      if (time - lastTime > 35) { // ~30fps smooth animation
        offset -= 1.8; // Moving dash offset
        cyclePulse = (cyclePulse + 0.05) % (Math.PI * 2);
        const pulseOpacity = 0.85 + Math.sin(cyclePulse) * 0.15;

        const cy = cyRef.current;
        if (cy) {
          const fraudEdges = cy.edges('[?isFraud]');
          if (fraudEdges.length > 0) {
            fraudEdges.style('line-dash-offset', offset);
          }

          const cycleEdges = cy.edges('[?isCycle]');
          if (cycleEdges.length > 0) {
            cycleEdges.style('line-dash-offset', offset * 1.4);
            cycleEdges.style('opacity', pulseOpacity);
          }
        }
        lastTime = time;
      }
      animationFrame = requestAnimationFrame(animateEdges);
    };
    
    animationFrame = requestAnimationFrame(animateEdges);
    
    return () => cancelAnimationFrame(animationFrame);
  }, [data]);

  const handleZoomIn = () => cyRef.current?.zoom(cyRef.current.zoom() * 1.25);
  const handleZoomOut = () => cyRef.current?.zoom(cyRef.current.zoom() * 0.8);
  const handleFit = () => cyRef.current?.fit(undefined, 60);

  const handleSearch = (e) => {
    e.preventDefault();
    const cy = cyRef.current;
    if (!cy || !searchQuery.trim()) return;

    cy.elements().removeClass('search-match dimmed hover selected connected-highlight');
    const q = searchQuery.toLowerCase();
    const matches = cy.nodes().filter(n => {
      const d = n.data();
      return d.id.toLowerCase().includes(q) || (d.customerName && d.customerName.toLowerCase().includes(q));
    });

    if (matches.length > 0) {
      cy.elements().addClass('dimmed');
      matches.removeClass('dimmed').addClass('search-match');
      matches.connectedEdges().removeClass('dimmed').addClass('connected-highlight');
      matches.connectedEdges().connectedNodes().removeClass('dimmed');
      cy.animate({ fit: { eles: matches, padding: 100 } }, { duration: 600 });
    }
  };

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden h-full min-h-[620px] bg-[#0b1220] radial-gradient-overlay">
      {/* Search & Layout Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between gap-3 bg-[#111827]/80 backdrop-blur-xl p-3 rounded-2xl border border-[#ffffff]/10 shadow-2xl">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#c4c7c8]" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search account ID or name..."
            className="w-full bg-[#1e293b]/50 text-[#ffffff] text-sm py-2 pl-10 pr-4 rounded-xl border border-[#ffffff]/10 focus:border-[#ffffff]/30 focus:bg-[#1e293b] outline-none transition-all placeholder:text-[#64748b]"
          />
        </form>

        <div className="flex items-center gap-3">
          <select
            value={nodeLimit}
            onChange={(e) => onNodeLimitChange(parseInt(e.target.value))}
            className="bg-[#1e293b]/50 text-[#e2e8f0] text-sm py-2 px-4 rounded-xl border border-[#ffffff]/10 outline-none hover:bg-[#1e293b] transition-colors cursor-pointer appearance-none"
          >
            <option value={100}>100 nodes</option>
            <option value={300}>300 nodes</option>
            <option value={500}>500 nodes</option>
            <option value={1000}>1000 nodes</option>
          </select>

          <button onClick={() => onRefresh?.()} className="p-2.5 rounded-xl bg-[#1e293b]/50 hover:bg-[#ffffff] text-[#94a3b8] hover:text-[#0b1220] border border-[#ffffff]/10 transition-all" title="Refresh Graph">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Floating Left Overlay Tools */}
      <div className="absolute top-24 left-4 z-20 flex flex-col gap-3">
        <div className="flex flex-col bg-[#111827]/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-[#ffffff]/10 overflow-hidden">
          <button onClick={handleZoomIn} className="p-3 hover:bg-[#ffffff] transition-colors text-[#94a3b8] hover:text-[#0b1220]" title="Zoom In">
            <ZoomIn size={18} />
          </button>
          <div className="h-px bg-[#ffffff]/10 mx-2" />
          <button onClick={handleZoomOut} className="p-3 hover:bg-[#ffffff] transition-colors text-[#94a3b8] hover:text-[#0b1220]" title="Zoom Out">
            <ZoomOut size={18} />
          </button>
          <div className="h-px bg-[#ffffff]/10 mx-2" />
          <button onClick={handleFit} className="p-3 hover:bg-[#ffffff] transition-colors text-[#94a3b8] hover:text-[#0b1220]" title="Fit to Screen">
            <Maximize size={18} />
          </button>
        </div>

        <div className="flex flex-col bg-[#111827]/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-[#ffffff]/10 overflow-hidden">
          <button onClick={() => setLayoutName('cose-bilkent')} className={`p-3 transition-colors ${layoutName === 'cose-bilkent' ? 'bg-[#ffffff] text-[#0b1220]' : 'text-[#94a3b8] hover:bg-[#ffffff]/10 hover:text-[#ffffff]'}`} title="Force Directed Layout">
            <Layers size={18} />
          </button>
          <div className="h-px bg-[#ffffff]/10 mx-2" />
          <button onClick={() => setLayoutName('circle')} className={`p-3 transition-colors ${layoutName === 'circle' ? 'bg-[#ffffff] text-[#0b1220]' : 'text-[#94a3b8] hover:bg-[#ffffff]/10 hover:text-[#ffffff]'}`} title="Circular Layout">
            <Circle size={18} />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        <CytoscapeComponent
          elements={elements}
          layout={layout}
          stylesheet={stylesheet}
          className="w-full h-full min-h-[580px]"
          style={{ width: '100%', height: '100%', background: 'transparent' }}
          cy={handleCyInit}
          wheelSensitivity={0.15}
        />
      </div>

      {/* Bottom Floating Legend */}
      <div className="absolute bottom-6 left-6 z-20 bg-[#111827]/85 backdrop-blur-xl rounded-2xl border border-[#ffffff]/10 p-5 shadow-2xl w-72">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#94a3b8] mb-4">Edge & Node Legend</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 border-b-[2.5px] border-solid border-[#e2e8f0]" />
            <span className="font-medium text-xs text-[#f8fafc]">Normal Txn ($2.5px solid white)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 border-b-[3px] border-dashed border-[#ef4444]" />
            <span className="font-medium text-xs text-[#f8fafc]">Suspicious Flow (Animated Red)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 border-b-[4px] border-dashed border-[#f97316]" />
            <span className="font-medium text-xs text-[#f8fafc]">Money Laundering Cycle (Pulse)</span>
          </div>
          <div className="h-px bg-[#ffffff]/10 my-2" />
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#ffb4ab] ring-4 ring-[#ffb4ab]/20" />
            <span className="font-medium text-xs text-[#f8fafc]">Critical Risk Account</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#ffb74d] ring-4 ring-[#ffb74d]/20" />
            <span className="font-medium text-xs text-[#f8fafc]">Elevated Risk Account</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#4cd7f6] ring-4 ring-[#4cd7f6]/20" />
            <span className="font-medium text-xs text-[#f8fafc]">Normal Account</span>
          </div>
        </div>
      </div>

      {selectedNode && <NodePanel node={selectedNode} onClose={() => {
        setSelectedNode(null);
        if (cyRef.current) cyRef.current.elements().removeClass('dimmed search-match hover selected connected-highlight');
      }} />}
    </div>
  );
}

