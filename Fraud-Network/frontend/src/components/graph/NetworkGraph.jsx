import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import coseBilkent from 'cytoscape-cose-bilkent';
import cytoscape from 'cytoscape';
import { ZoomIn, ZoomOut, Maximize, Circle, Layers, RefreshCw, Search } from 'lucide-react';
import NodePanel from './NodePanel';
import { getRiskTier } from '../../utils/riskHelpers';
import { formatCurrency } from '../../utils/formatters';

try { cytoscape.use(coseBilkent); } catch (e) {}

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
      <defs>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <!-- Card Background -->
      <rect x="2" y="2" width="176" height="72" rx="12" fill="${bgColor}" stroke="${ringColor}" stroke-width="1.5" stroke-opacity="0.6"/>
      
      <!-- Risk Ring -->
      <circle cx="34" cy="38" r="18" fill="none" stroke="${ringColor}" stroke-width="2.5" stroke-dasharray="8 4" />
      <circle cx="34" cy="38" r="14" fill="${ringColor}" fill-opacity="0.15" />
      
      <!-- Avatar Icon (Simple User/Building representation) -->
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
      const amountLabel = formatCurrency(edge.totalAmount);
      return {
        data: {
          id: `e-${edge.source}-${edge.target}-${idx}`,
          source: edge.source,
          target: edge.target,
          totalAmount: edge.totalAmount,
          isFraud: edge.isFraud,
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
      }
    },
    {
      selector: 'edge',
      style: {
        'width': 1.5,
        'line-color': '#444748',
        'target-arrow-color': '#444748',
        'target-arrow-shape': 'chevron',
        'curve-style': 'bezier',
        'arrow-scale': 1.2,
        'opacity': 0.5,
        'label': 'data(amountLabel)',
        'font-size': '9px',
        'color': '#c4c7c8',
        'text-rotation': 'autorotate',
        'text-outline-color': '#0e0e0e',
        'text-outline-width': 2,
        'text-background-color': '#141313',
        'text-background-opacity': 0.8,
        'text-background-padding': '4px',
        'text-background-shape': 'roundrectangle',
        'z-index': 1
      }
    },
    {
      selector: 'edge[?isFraud]',
      style: {
        'line-color': '#ffb4ab',
        'line-style': 'dashed',
        'line-dash-pattern': [8, 6],
        'target-arrow-color': '#ffb4ab',
        'width': 2,
        'opacity': 0.9,
        'color': '#ffb4ab',
        'z-index': 10
      }
    },
    {
      selector: 'node:selected',
      style: {
        'underlay-color': '#ffffff',
        'underlay-padding': '4px',
        'underlay-opacity': 0.8,
        'underlay-shape': 'roundrectangle',
        'z-index': 999,
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
        'underlay-color': '#4cd7f6',
        'underlay-padding': '6px',
        'underlay-opacity': 1,
        'underlay-shape': 'roundrectangle',
        'z-index': 1000,
      }
    },
    {
      selector: 'node.dimmed',
      style: { 'opacity': 0.15 }
    },
    {
      selector: 'edge.dimmed',
      style: { 'opacity': 0.05 }
    },
    {
      selector: 'node.hover',
      style: {
        'width': 188,
        'height': 80,
        'z-index': 999
      }
    }
  ], []);

  const layout = useMemo(() => {
    if (layoutName === 'circle') {
      return { name: 'circle', animate: true, padding: 60 };
    }
    return {
      name: 'cose-bilkent',
      idealEdgeLength: 160,
      nodeRepulsion: 12000,
      gravity: 0.15,
      animate: 'end',
      animationDuration: 800,
      fit: true,
      padding: 60,
    };
  }, [layoutName]);

  const handleCyInit = useCallback((cy) => {
    cyRef.current = cy;
    
    // Interactions
    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      setSelectedNode(node.data());
      
      // Spotlight effect
      cy.elements().addClass('dimmed');
      node.removeClass('dimmed');
      node.connectedEdges().removeClass('dimmed');
      node.connectedEdges().connectedNodes().removeClass('dimmed');
    });
    
    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        setSelectedNode(null);
        cy.elements().removeClass('dimmed search-match hover');
      }
    });

    cy.on('mouseover', 'node', (evt) => {
      evt.target.addClass('hover');
      cy.container().style.cursor = 'pointer';
    });

    cy.on('mouseout', 'node', (evt) => {
      evt.target.removeClass('hover');
      cy.container().style.cursor = 'default';
    });
  }, []);

  // Edge animation loop
  useEffect(() => {
    if (!cyRef.current) return;
    
    let animationFrame;
    let offset = 0;
    let lastTime = 0;
    
    const animateEdges = (time) => {
      if (time - lastTime > 40) { // Throttle to ~25fps for performance
        offset -= 1.5; // Move dashes to simulate flow direction
        const fraudEdges = cyRef.current.edges('[?isFraud]');
        if (fraudEdges.length > 0) {
          fraudEdges.style('line-dash-offset', offset);
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

    cy.elements().removeClass('search-match dimmed hover');
    const q = searchQuery.toLowerCase();
    const matches = cy.nodes().filter(n => {
      const d = n.data();
      return d.id.toLowerCase().includes(q) || (d.customerName && d.customerName.toLowerCase().includes(q));
    });

    if (matches.length > 0) {
      cy.elements().addClass('dimmed');
      matches.removeClass('dimmed').addClass('search-match');
      matches.connectedEdges().removeClass('dimmed');
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
      <div className="absolute bottom-6 left-6 z-20 bg-[#111827]/80 backdrop-blur-xl rounded-2xl border border-[#ffffff]/10 p-5 shadow-2xl w-64">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#94a3b8] mb-4">Risk Legend</h3>
        <div className="space-y-3.5">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#ffb4ab] ring-4 ring-[#ffb4ab]/20" />
            <span className="font-medium text-sm text-[#f8fafc]">Critical Risk</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#ffb74d] ring-4 ring-[#ffb74d]/20" />
            <span className="font-medium text-sm text-[#f8fafc]">Elevated Risk</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#4cd7f6] ring-4 ring-[#4cd7f6]/20" />
            <span className="font-medium text-sm text-[#f8fafc]">Normal Account</span>
          </div>
          <div className="h-px bg-[#ffffff]/10 my-2" />
          <div className="flex items-center gap-3">
            <div className="w-8 border-b-2 border-dashed border-[#ffb4ab]" />
            <span className="font-medium text-sm text-[#f8fafc]">Fraudulent Flow</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 border-b-[1.5px] border-solid border-[#64748b]" />
            <span className="font-medium text-sm text-[#f8fafc]">Standard Txn</span>
          </div>
        </div>
      </div>

      {selectedNode && <NodePanel node={selectedNode} onClose={() => {
        setSelectedNode(null);
        if (cyRef.current) cyRef.current.elements().removeClass('dimmed search-match hover');
      }} />}
    </div>
  );
}

