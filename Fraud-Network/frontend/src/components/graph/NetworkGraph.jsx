import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import coseBilkent from 'cytoscape-cose-bilkent';
import cytoscape from 'cytoscape';
import { ZoomIn, ZoomOut, Maximize, Circle, Layers, RefreshCw, Search } from 'lucide-react';
import NodePanel from './NodePanel';
import EdgeDrawer from './EdgeDrawer';
import { getRiskTier } from '../../utils/riskHelpers';

try { cytoscape.use(coseBilkent); } catch (e) {}

// Formatter for Rupee transaction amounts e.g., ₹12,450, ₹1,25,000, ₹8,560
const formatExactRupee = (val) => {
  if (val == null) return '₹0';
  return `₹${Math.round(val).toLocaleString('en-IN')}`;
};

// Utility to generate dynamic SVG cards for nodes
const generateNodeSVG = (node) => {
  const isFraud = node.riskScore >= 80 || node.isFraud;
  const isMedium = node.riskScore >= 50 && node.riskScore < 80;
  const isLeader = node.fii >= 85 || (node.degree && node.degree > 15);
  
  // Node Colors per prompt: Normal (#94A3B8), Medium Risk (#F59E0B), Critical Fraud (#EF4444), Community Leader (#8B5CF6)
  const ringColor = isFraud ? '#EF4444' : isMedium ? '#F59E0B' : isLeader ? '#8B5CF6' : '#94A3B8';
  const bgColor = '#1E293B'; // #1E293B background
  const textColor = '#FFFFFF';
  const subtextColor = '#94A3B8';
  
  // Clean text to avoid XML errors
  const safeName = (node.customerName || `Account ${node.id}`).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeAcc = (node.accountNumber || node.id || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const typeStr = (node.accountType || 'Account').toUpperCase();
  const riskVal = `${Math.round(node.riskScore || 0)}%`;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="180" height="76" viewBox="0 0 180 76">
      <!-- Card Background -->
      <rect x="2" y="2" width="176" height="72" rx="12" fill="${bgColor}" stroke="${ringColor}" stroke-width="2" stroke-opacity="0.95"/>
      
      <!-- Risk Ring -->
      <circle cx="34" cy="38" r="18" fill="none" stroke="${ringColor}" stroke-width="2.5" stroke-dasharray="8 4" />
      <circle cx="34" cy="38" r="14" fill="${ringColor}" fill-opacity="0.15" />
      
      <!-- Avatar Icon -->
      ${node.accountType === 'Business' 
        ? `<rect x="29" y="32" width="10" height="12" fill="none" stroke="${ringColor}" stroke-width="1.5"/><path d="M29 32L34 27L39 32" fill="none" stroke="${ringColor}" stroke-width="1.5"/>`
        : `<circle cx="34" cy="34" r="4" fill="none" stroke="${ringColor}" stroke-width="1.5"/><path d="M26 44 C 26 40, 42 40, 42 44" fill="none" stroke="${ringColor}" stroke-width="1.5"/>`
      }
      
      <!-- Text Content -->
      <text x="64" y="24" font-family="system-ui, sans-serif" font-size="9" font-weight="bold" letter-spacing="1" fill="${subtextColor}">${typeStr}</text>
      <text x="64" y="42" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="${textColor}">${safeName}</text>
      <text x="64" y="58" font-family="monospace" font-size="10" fill="${subtextColor}">${safeAcc}</text>
      <rect x="135" y="10" width="35" height="16" rx="4" fill="${ringColor}" fill-opacity="0.2"/>
      <text x="152.5" y="21.5" font-family="monospace" font-size="9" font-weight="bold" fill="${ringColor}" text-anchor="middle">${riskVal}</text>
    </svg>
  `;
  
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
};

export default function NetworkGraph({ data, nodeLimit = 300, onNodeLimitChange, onRefresh }) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [hoveredEdge, setHoveredEdge] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [layoutName, setLayoutName] = useState('cose-bilkent');

  const cyRef = useRef(null);

  const elements = useMemo(() => {
    if (!data?.nodes) return [];

    const nodes = data.nodes.map(node => {
      const tier = getRiskTier(node.riskScore);
      const sizeWidth = Math.min(210, Math.max(160, 160 + (node.degree || 0) * 1.5));
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
          tierColor: tier.color,
          sizeWidth
        }
      };
    });

    const edges = (data.edges || []).map((edge, idx) => {
      const amountLabel = formatExactRupee(edge.totalAmount);
      const isCycle = edge.isCycle || edge.alert === 'Circular Transaction';
      const isSuspicious = edge.isFraud || (edge.avgRisk && edge.avgRisk > 75) || edge.totalAmount > 15000 || edge.alert != null;
      const isLaundering = edge.isFraud && (edge.totalAmount > 25000 || (edge.avgRisk && edge.avgRisk > 85));
      const isCommunityEdge = !isFraud && !isCycle && edge.sourceCommunity === edge.targetCommunity;

      return {
        data: {
          id: `e-${edge.source}-${edge.target}-${idx}`,
          source: edge.source,
          target: edge.target,
          totalAmount: edge.totalAmount,
          txCount: edge.txCount || 1,
          isFraud: edge.isFraud,
          isSuspicious,
          isCycle,
          isLaundering,
          isCommunityEdge,
          amountLabel,
          avgRisk: edge.avgRisk || 70,
          fraudTypes: edge.fraudTypes || []
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
        'width': 'data(sizeWidth)',
        'height': 76,
        'background-color': 'transparent',
        'background-image': 'data(svgImage)',
        'background-fit': 'contain',
        'border-width': 0,
        'z-index': 50,
      }
    },

    // 1. Normal Transaction (Solid White, Opacity 0.75)
    {
      selector: 'edge',
      style: {
        'width': 2.5,
        'line-color': '#ffffff',
        'target-arrow-color': '#ffffff',
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier',
        'arrow-scale': 1.3,
        'opacity': 0.75,
        'label': 'data(amountLabel)',
        'font-size': '10px',
        'font-weight': '600',
        'color': '#ffffff',
        'text-rotation': 'autorotate',
        'text-outline-color': '#070b14',
        'text-outline-width': 1,
        'text-background-color': '#0a0f1c',
        'text-background-opacity': 0.95,
        'text-background-padding': '3px 5px',
        'text-background-shape': 'roundrectangle',
        'text-margin-y': -8,
        'z-index': 10,
      }
    },

    // 2. Suspicious Transaction (Red Dashed)
    {
      selector: 'edge[?isSuspicious]',
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

    // 3. Circular Transaction (Orange Dashed)
    {
      selector: 'edge[?isCycle]',
      style: {
        'width': 3.5,
        'line-color': '#f97316',
        'line-style': 'dashed',
        'line-dash-pattern': [10, 4],
        'target-arrow-color': '#f97316',
        'target-arrow-shape': 'triangle',
        'arrow-scale': 1.5,
        'opacity': 1.0,
        'color': '#ffffff',
        'text-background-color': '#431407',
        'z-index': 30,
      }
    },

    // 4. Money Laundering Chain (Animated Red Flow)
    {
      selector: 'edge[?isLaundering]',
      style: {
        'width': 4,
        'line-color': '#ff2d55',
        'line-style': 'dashed',
        'line-dash-pattern': [12, 4],
        'target-arrow-color': '#ff2d55',
        'target-arrow-shape': 'triangle',
        'arrow-scale': 1.6,
        'opacity': 1.0,
        'color': '#ffffff',
        'text-background-color': '#881337',
        'z-index': 35,
      }
    },

    // 5. Community Connection (Purple)
    {
      selector: 'edge[?isCommunityEdge]',
      style: {
        'width': 3,
        'line-color': '#8b5cf6',
        'target-arrow-color': '#8b5cf6',
        'target-arrow-shape': 'triangle',
        'opacity': 0.9,
        'color': '#ffffff',
        'text-background-color': '#2e1065',
        'z-index': 20,
      }
    },

    // Focus & Hover Mode (10% Opacity for Unrelated Elements)
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
        'underlay-opacity': 1.0,
        'underlay-shape': 'roundrectangle',
        'z-index': 100,
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
      style: { 'opacity': 0.10 }
    },
    {
      selector: 'edge.dimmed',
      style: { 'opacity': 0.08 }
    },
    {
      selector: 'node.hover',
      style: {
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
    
    // Focus Mode on Node Selection (tap)
    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      cy.nodes().removeClass('selected');
      node.addClass('selected');
      setSelectedNode(node.data());
      setSelectedEdge(null);
      
      // Spotlight connected edges and nodes (Fade unrelated to 10%)
      cy.elements().addClass('dimmed').removeClass('connected-highlight');
      node.removeClass('dimmed');
      const connectedEdges = node.connectedEdges();
      const connectedNodes = connectedEdges.connectedNodes();
      connectedNodes.removeClass('dimmed');
      connectedEdges.removeClass('dimmed').addClass('connected-highlight');
    });

    // Edge selection (tap edge)
    cy.on('tap', 'edge', (evt) => {
      const edge = evt.target;
      setSelectedEdge(edge.data());
      setSelectedNode(null);
    });
    
    // Canvas tap (reset)
    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        setSelectedNode(null);
        setSelectedEdge(null);
        cy.elements().removeClass('dimmed search-match hover selected connected-highlight');
      }
    });

    // Node Hover effect
    cy.on('mouseover', 'node', (evt) => {
      const node = evt.target;
      node.addClass('hover');
      cy.container().style.cursor = 'pointer';

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

      if (!cy.nodes('.selected').length) {
        cy.elements().removeClass('dimmed connected-highlight');
      }
    });

    // Edge Hover effect & Tooltip
    cy.on('mouseover', 'edge', (evt) => {
      const edge = evt.target;
      edge.addClass('connected-highlight');
      setHoveredEdge(edge.data());
      cy.container().style.cursor = 'pointer';
    });

    cy.on('mousemove', 'edge', (evt) => {
      const renderedPosition = evt.renderedPosition;
      setTooltipPos({ x: renderedPosition.x, y: renderedPosition.y });
    });

    cy.on('mouseout', 'edge', (evt) => {
      const edge = evt.target;
      edge.removeClass('connected-highlight');
      setHoveredEdge(null);
      cy.container().style.cursor = 'default';
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
      if (time - lastTime > 35) {
        offset -= 1.8;
        cyclePulse = (cyclePulse + 0.05) % (Math.PI * 2);
        const pulseOpacity = 0.85 + Math.sin(cyclePulse) * 0.15;

        const cy = cyRef.current;
        if (cy) {
          const suspEdges = cy.edges('[?isSuspicious]');
          if (suspEdges.length > 0) {
            suspEdges.style('line-dash-offset', offset);
          }

          const cycleEdges = cy.edges('[?isCycle]');
          if (cycleEdges.length > 0) {
            cycleEdges.style('line-dash-offset', offset * 1.4);
          }

          const launderingEdges = cy.edges('[?isLaundering]');
          if (launderingEdges.length > 0) {
            launderingEdges.style('line-dash-offset', offset * 1.8);
            launderingEdges.style('opacity', pulseOpacity);
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
      
      const firstMatch = matches[0];
      setSelectedNode(firstMatch.data());
      cy.animate({ fit: { eles: matches, padding: 100 } }, { duration: 600 });
    }
  };

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden h-full min-h-[620px] bg-[#0A0F1C]">
      {/* Layer 1: Radial Gradient Center #111827 to Edges #070B14 */}
      <div 
        className="absolute inset-0 pointer-events-none z-0" 
        style={{
          background: 'radial-gradient(circle at 50% 50%, #111827 0%, #070B14 100%)'
        }}
      />

      {/* Layer 2: Faint Investigation Grid (rgba 255,255,255,0.025 at 40px) */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 opacity-100"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.025) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.025) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

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

      {/* Floating Edge Hover Tooltip */}
      {hoveredEdge && (
        <div 
          style={{ left: tooltipPos.x + 15, top: tooltipPos.y - 15 }}
          className="fixed z-50 pointer-events-none bg-[#0f172a]/95 backdrop-blur-xl border border-[#ffffff]/20 rounded-2xl p-4 shadow-2xl text-xs w-64 space-y-2"
        >
          <div className="flex items-center justify-between border-b border-[#ffffff]/10 pb-2">
            <span className="font-mono font-bold text-[#ffffff]">TXN Link</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              hoveredEdge.isLaundering ? 'bg-[#ff2d55]/20 text-[#ff2d55]' :
              hoveredEdge.isSuspicious ? 'bg-[#ef4444]/20 text-[#ef4444]' :
              hoveredEdge.isCycle ? 'bg-[#f97316]/20 text-[#f97316]' : 'bg-[#38bdf8]/20 text-[#38bdf8]'
            }`}>
              {hoveredEdge.isLaundering ? 'Laundering Flow' : hoveredEdge.isSuspicious ? 'Suspicious' : hoveredEdge.isCycle ? 'Circular' : 'Normal'}
            </span>
          </div>

          <div className="space-y-1 text-[#94a3b8]">
            <div className="flex justify-between"><span className="font-bold">Sender:</span> <span className="font-mono text-[#ffffff]">{hoveredEdge.source}</span></div>
            <div className="flex justify-between"><span className="font-bold">Receiver:</span> <span className="font-mono text-[#ffffff]">{hoveredEdge.target}</span></div>
            <div className="flex justify-between"><span className="font-bold">Amount:</span> <span className="font-mono text-[#38bdf8] font-bold">{formatExactRupee(hoveredEdge.totalAmount)}</span></div>
            <div className="flex justify-between"><span className="font-bold">Risk Score:</span> <span className="font-mono text-[#ffb4ab] font-bold">{hoveredEdge.avgRisk}%</span></div>
          </div>
        </div>
      )}

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
      <div className="absolute bottom-6 left-6 z-20 bg-[#111827]/90 backdrop-blur-xl rounded-2xl border border-[#ffffff]/10 p-5 shadow-2xl w-80">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#94a3b8] mb-3">Enterprise Graph Legend</h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 border-b-[2.5px] border-solid border-[#ffffff]" />
            <span className="font-medium text-[#f8fafc]">Solid White — Normal Txn (₹)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 border-b-[3px] border-dashed border-[#ef4444]" />
            <span className="font-medium text-[#f8fafc]">Red Dashed — Suspicious Txn</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 border-b-[4px] border-dashed border-[#ff2d55]" />
            <span className="font-medium text-[#f8fafc]">Animated Red — Money Laundering</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 border-b-[3.5px] border-dashed border-[#f97316]" />
            <span className="font-medium text-[#f8fafc]">Orange Dashed — Circular Loop</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 border-b-[3px] border-solid border-[#8b5cf6]" />
            <span className="font-medium text-[#f8fafc]">Purple — Community Connection</span>
          </div>
          <div className="h-px bg-[#ffffff]/10 my-2" />
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#94a3b8]" />
              <span className="text-[#94a3b8]">Normal Node</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
              <span className="text-[#f59e0b]">Medium Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
              <span className="text-[#ef4444]">Critical Fraud</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#8b5cf6]" />
              <span className="text-[#8b5cf6]">Leader Node</span>
            </div>
          </div>
        </div>
      </div>

      {selectedNode && <NodePanel node={selectedNode} onClose={() => {
        setSelectedNode(null);
        if (cyRef.current) cyRef.current.elements().removeClass('dimmed search-match hover selected connected-highlight');
      }} />}

      {selectedEdge && <EdgeDrawer edgeData={selectedEdge} onClose={() => setSelectedEdge(null)} />}
    </div>
  );
}


