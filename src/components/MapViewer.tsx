import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Flame, Landmark, Truck, Home, MapPin } from 'lucide-react';

interface MapViewerProps {
  showHotspots?: boolean;
  showRoutes?: boolean;
  highlightedFarmId?: string;
  onFarmClick?: (farmId: string) => void;
  onHotspotClick?: (hotspotId: string) => void;
}

export const MapViewer: React.FC<MapViewerProps> = ({
  showHotspots = false,
  showRoutes = false,
  highlightedFarmId,
  onFarmClick,
  onHotspotClick
}) => {
  const { farmers, buyers, hotspots, listings, routeOptimized } = useAppStore();
  const [selectedPoint, setSelectedPoint] = useState<{
    type: 'farm' | 'buyer' | 'hotspot';
    name: string;
    detail: string;
    x: number;
    y: number;
  } | null>(null);

  // SVG grid limits: width 600, height 400
  const transformCoords = (coords: [number, number]): { x: number; y: number } => {
    // coordinates are 0 to 100
    // x maps from coords[1] (lng approximation), y maps from coords[0] (lat approximation)
    const x = 50 + (coords[1] / 100) * 500;
    const y = 350 - (coords[0] / 100) * 300;
    return { x, y };
  };

  const handlePointClick = (
    type: 'farm' | 'buyer' | 'hotspot',
    name: string,
    detail: string,
    x: number,
    y: number,
    id: string
  ) => {
    setSelectedPoint({ type, name, detail, x, y });
    if (type === 'farm' && onFarmClick) onFarmClick(id);
    if (type === 'hotspot' && onHotspotClick) onHotspotClick(id);
  };

  // Route drawing coordinate sequence
  const routePoints = [
    transformCoords([22, 63]), // Start: Punjab BioEnergy Plant
    transformCoords([20, 65]), // Baldev Singh
    transformCoords([25, 55]), // Gurpreet
    transformCoords([30, 45]), // Ramesh
    transformCoords([40, 35]), // Harpreet
    transformCoords([50, 40]), // Jagdish
    transformCoords([52, 62]), // GreenGrow Mushroom Farm (End/Buyer)
  ];

  const pathD = routePoints.reduce((acc, pt, index) => {
    return acc + (index === 0 ? `M ${pt.x} ${pt.y}` : ` L ${pt.x} ${pt.y}`);
  }, '');

  return (
    <div className="relative w-full aspect-[3/2] bg-[#f2ebd9]/40 border border-forest-100 rounded-2xl overflow-hidden shadow-inner">
      {/* Background contour lines simulated in SVG */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="contourPattern" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M 0,50 Q 25,45 50,50 T 100,50" fill="none" stroke="#e6dcc5" strokeWidth="1" opacity="0.4" />
            <path d="M 0,20 Q 30,25 60,15 T 100,20" fill="none" stroke="#e6dcc5" strokeWidth="0.8" opacity="0.3" />
            <path d="M 0,80 Q 40,75 70,85 T 100,80" fill="none" stroke="#e6dcc5" strokeWidth="0.8" opacity="0.3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#contourPattern)" />
        
        {/* District Grid Label Backgrounds */}
        <text x="70" y="50" fill="#a89a7d" fontSize="12" fontWeight="bold" opacity="0.6">PUNJAB REGION</text>
        <text x="450" y="320" fill="#a89a7d" fontSize="12" fontWeight="bold" opacity="0.6">HARYANA BORDER</text>
      </svg>

      {/* SVG Map Layer */}
      <svg className="w-full h-full relative z-10" viewBox="0 0 600 400">
        {/* Draw optimized route */}
        {showRoutes && routeOptimized && (
          <>
            {/* Base line */}
            <path
              d={pathD}
              fill="none"
              stroke="#6d9f8a"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.3"
            />
            {/* Animated draw line */}
            <path
              d={pathD}
              fill="none"
              stroke="#3a6654"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-route-draw"
              strokeDasharray="1000"
              strokeDashoffset="1000"
              style={{ animationDuration: '3s' }}
            />
          </>
        )}

        {/* Render Buyers (Factories) */}
        {buyers.map(b => {
          const { x, y } = transformCoords(b.coordinates);
          return (
            <g 
              key={b.id} 
              className="cursor-pointer group"
              onClick={() => handlePointClick('buyer', b.name, `${b.type} • Sourced: ${b.sourcedVolume}t`, x, y, b.id)}
            >
              <circle cx={x} cy={y} r="16" fill="#73492c" opacity="0.15" className="group-hover:scale-125 transition-transform" />
              <rect x={x - 8} y={y - 8} width="16" height="16" rx="3" fill="#73492c" className="stroke-white stroke-2" />
              <text x={x} y={y - 12} textAnchor="middle" fill="#5e3e26" fontSize="10" fontWeight="bold" className="opacity-0 group-hover:opacity-100 transition-opacity">
                {b.name}
              </text>
            </g>
          );
        })}

        {/* Render Farmers */}
        {farmers.map(f => {
          const { x, y } = transformCoords(f.coordinates);
          const isHighlighted = f.id === highlightedFarmId;
          const hasListing = listings.some(l => l.farmerId === f.id && l.status !== 'Paid');
          
          return (
            <g 
              key={f.id} 
              className="cursor-pointer group"
              onClick={() => handlePointClick('farm', f.name, `${f.location} • Earnings: ₹${f.earnings}`, x, y, f.id)}
            >
              <circle 
                cx={x} 
                cy={y} 
                r={isHighlighted ? "14" : "10"} 
                fill={hasListing ? "#4c816c" : "#9bc2b1"} 
                opacity={isHighlighted ? "0.4" : "0.2"} 
                className={`transition-all duration-300 ${hasListing ? 'animate-pulse' : ''}`} 
              />
              <circle 
                cx={x} 
                cy={y} 
                r={isHighlighted ? "7" : "5"} 
                fill={hasListing ? "#3a6654" : "#6d9f8a"} 
                className="stroke-white stroke-1.5 transition-all group-hover:scale-125" 
              />
              <text x={x} y={y - 10} textAnchor="middle" fill="#284338" fontSize="9" fontWeight="semibold" className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-white">
                {f.name}
              </text>
            </g>
          );
        })}

        {/* Render Hotspots */}
        {showHotspots && hotspots.map(h => {
          const { x, y } = transformCoords(h.coordinates);
          return (
            <g 
              key={h.id} 
              className="cursor-pointer group"
              onClick={() => handlePointClick('hotspot', 'Thermal Stubble Fire Detected', `${h.location} • Conf: ${h.confidence}%`, x, y, h.id)}
            >
              {/* Pulsing warning ring */}
              <circle cx={x} cy={y} r="18" fill="#b88347" opacity="0.3" className="animate-ping" style={{ animationDuration: '2s' }} />
              <circle cx={x} cy={y} r="10" fill="#aa713b" opacity="0.4" />
              <circle cx={x} cy={y} r="5" fill="#ba8349" className="stroke-white stroke-1" />
            </g>
          );
        })}

        {/* Animated truck icon tracing route if running */}
        {showRoutes && routeOptimized && (
          <g>
            <circle cx={routePoints[2].x} cy={routePoints[2].y} r="12" fill="#ba8349" className="animate-bounce" />
            <path d={`M ${routePoints[2].x - 6} ${routePoints[2].y - 6} L ${routePoints[2].x + 6} ${routePoints[2].y - 6}`} stroke="white" strokeWidth="2" />
          </g>
        )}
      </svg>

      {/* Floating Info Tooltip */}
      {selectedPoint && (
        <div 
          className="absolute z-20 bg-white border border-clay-200 p-3 rounded-xl shadow-lg max-w-[200px] pointer-events-auto transition-all"
          style={{ 
            left: `${Math.min(selectedPoint.x / 600 * 100, 70)}%`, 
            top: `${Math.min(selectedPoint.y / 400 * 100, 75)}%` 
          }}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
              selectedPoint.type === 'hotspot' ? 'bg-clay-100 text-clay-800' :
              selectedPoint.type === 'buyer' ? 'bg-forest-100 text-forest-800' : 'bg-earth-100 text-earth-800'
            }`}>
              {selectedPoint.type}
            </span>
            <button 
              onClick={() => setSelectedPoint(null)}
              className="text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              ×
            </button>
          </div>
          <h4 className="font-bold text-xs text-slate-900 leading-tight">{selectedPoint.name}</h4>
          <p className="text-[10px] text-slate-500 mt-1">{selectedPoint.detail}</p>
        </div>
      )}

      {/* Map Legend */}
      <div className="absolute bottom-3 left-3 z-10 bg-white/95 border border-forest-100/60 p-2.5 rounded-xl shadow-md flex flex-col gap-1.5 text-[10px] text-slate-700">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#6d9f8a] border border-white"></span>
          <span>Farmer Fields</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-[#73492c] border border-white"></span>
          <span>Biomass Buyers</span>
        </div>
        {showHotspots && (
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ba8349] border border-white animate-pulse"></span>
            <span>Stubble Fire Hotspot</span>
          </div>
        )}
        {showRoutes && (
          <div className="flex items-center gap-1.5">
            <span className="w-6 h-0.5 bg-[#3a6654] inline-block"></span>
            <span>Collection Route</span>
          </div>
        )}
      </div>
    </div>
  );
};
