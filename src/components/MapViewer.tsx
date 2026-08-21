import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { OptimizeRouteResponse, VehicleRoute, RouteStop } from '../types/route';
import { useAppStore } from '../store/useAppStore';
import { FirmsFireRecord, normalizeFirmsConfidence } from '../services/firmsService';
import { getCurrentPosition, validateCoordinates } from '../services/geolocationService';
import { Layers, ChevronDown, ChevronUp, Maximize2, Flame, Navigation, Building2 } from 'lucide-react';

interface MapViewerProps {
  routeData?: OptimizeRouteResponse | null;
  selectedVehicleIndex?: number | null; // null = All trucks
  showHotspots?: boolean;
  firmsHotspots?: FirmsFireRecord[];
  selectedHotspotIndex?: number | null;
  showRoutes?: boolean;
  highlightedFarmId?: string;
  onFarmClick?: (farmId: string) => void;
  onHotspotClick?: (index: number) => void;
  isLoading?: boolean;
}

// Parali earthy color palette for vehicle routes (no neon)
const ROUTE_COLORS = [
  '#2d6a4f', // Truck 1: Deep Forest Green
  '#b45309', // Truck 2: Warm Terracotta / Burnt Amber
  '#1d4ed8', // Truck 3: Royal Navy Blue
  '#7e22ce', // Truck 4: Deep Purple
  '#0284c7', // Truck 5: Muted Teal Blue
];

// OpenStreetMap Raster Basemap Specification for MapLibre GL
const BASEMAP_STYLE_SPEC: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    'osm-tiles': {
      type: 'raster',
      tiles: [
        'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
      ],
      tileSize: 256,
      minzoom: 0,
      maxzoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }
  },
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: {
        'background-color': '#f8f9fa'
      }
    },
    {
      id: 'osm-tiles-layer',
      type: 'raster',
      source: 'osm-tiles',
      minzoom: 0,
      maxzoom: 19
    }
  ]
};

export const MapViewer: React.FC<MapViewerProps> = ({
  routeData,
  selectedVehicleIndex = null,
  showHotspots = false,
  firmsHotspots = [],
  selectedHotspotIndex = null,
  showRoutes = true,
  highlightedFarmId,
  onFarmClick,
  onHotspotClick,
  isLoading = false
}) => {
  const { farmers } = useAppStore();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  const [legendOpen, setLegendOpen] = useState<boolean>(true);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);

  // Initialize MapLibre GL Map once on mount
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Neutral national default viewport: [longitude, latitude]
    const initialCenter: [number, number] = [78.9629, 20.5937];

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: BASEMAP_STYLE_SPEC,
      center: initialCenter,
      zoom: 5,
      minZoom: 3,
      maxZoom: 18,
      pitch: 0,
      attributionControl: false
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
    map.addControl(
      new maplibregl.AttributionControl({
        compact: true,
        customAttribution: '© OpenStreetMap contributors'
      }),
      'bottom-left'
    );

    map.on('load', () => {
      setMapLoaded(true);
      setTimeout(() => {
        if (mapRef.current) mapRef.current.resize();
      }, 150);
    });

    const handleResize = () => {
      if (mapRef.current) mapRef.current.resize();
    };
    window.addEventListener('resize', handleResize);

    mapRef.current = map;

    return () => {
      window.removeEventListener('resize', handleResize);
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update Vector GeoJSON Routes, Markers, and Camera Bounds
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    // Remove previous markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const bounds = new maplibregl.LngLatBounds();
    let hasValidBounds = false;

    // Clean previous dynamic route layers
    const existingStyle = map.getStyle();
    if (existingStyle && existingStyle.layers) {
      existingStyle.layers.forEach((layer: any) => {
        if (layer.id.startsWith('route-line-') || layer.id.startsWith('route-casing-')) {
          if (map.getLayer(layer.id)) map.removeLayer(layer.id);
        }
      });
    }

    // Render Routes if present
    if (showRoutes && routeData && routeData.routes && routeData.routes.length > 0) {
      routeData.routes.forEach((route: VehicleRoute) => {
        const vIndex = route.vehicle_index;
        const color = ROUTE_COLORS[(vIndex - 1) % ROUTE_COLORS.length];
        const sourceId = `route-source-${vIndex}`;
        const casingLayerId = `route-casing-${vIndex}`;
        const lineLayerId = `route-line-${vIndex}`;

        const isVehicleSelected = selectedVehicleIndex === null || selectedVehicleIndex === vIndex;

        let geojsonFeatureCollection: any = route.geometry;

        if (!geojsonFeatureCollection || !geojsonFeatureCollection.features) {
          const stopCoords = route.stops.map(s => [s.longitude, s.latitude]);
          geojsonFeatureCollection = {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'LineString',
                  coordinates: stopCoords
                }
              }
            ]
          };
        }

        if (geojsonFeatureCollection.features) {
          geojsonFeatureCollection.features.forEach((feat: any) => {
            if (feat.geometry && feat.geometry.coordinates) {
              feat.geometry.coordinates.forEach(([lng, lat]: [number, number]) => {
                bounds.extend([lng, lat]);
                hasValidBounds = true;
              });
            }
          });
        }

        if (map.getSource(sourceId)) {
          (map.getSource(sourceId) as maplibregl.GeoJSONSource).setData(geojsonFeatureCollection);
        } else {
          map.addSource(sourceId, {
            type: 'geojson',
            data: geojsonFeatureCollection
          });
        }

        if (!map.getLayer(casingLayerId)) {
          map.addLayer({
            id: casingLayerId,
            type: 'line',
            source: sourceId,
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
              'line-color': '#ffffff',
              'line-width': isVehicleSelected ? 7 : 3,
              'line-opacity': showRoutes ? (isVehicleSelected ? 0.85 : 0.15) : 0
            }
          });
        }

        if (!map.getLayer(lineLayerId)) {
          map.addLayer({
            id: lineLayerId,
            type: 'line',
            source: sourceId,
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
              'line-color': color,
              'line-width': isVehicleSelected ? 4.5 : 2.5,
              'line-opacity': showRoutes ? (isVehicleSelected ? 0.95 : 0.2) : 0
            }
          });
        }

        // Add Stop Markers
        route.stops.forEach((stop: RouteStop) => {
          if (!isVehicleSelected && selectedVehicleIndex !== null) return;
          bounds.extend([stop.longitude, stop.latitude]);
          hasValidBounds = true;

          if (stop.type === 'depot') {
            const depotEl = document.createElement('div');
            depotEl.innerHTML = `
              <div style="
                background-color: #78350f;
                color: white;
                width: 36px;
                height: 36px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                border: 2.5px solid #ffffff;
                box-shadow: 0 4px 12px rgba(0,0,0,0.35);
                cursor: pointer;
              "><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/></svg></div>
            `;

            const popup = new maplibregl.Popup({ offset: 20, closeButton: false }).setHTML(`
              <div style="font-family: system-ui, sans-serif; padding: 4px; min-width: 200px;">
                <span style="background: #fef3c7; color: #92400e; font-size: 10px; font-weight: 800; text-transform: uppercase; padding: 2px 8px; border-radius: 12px;">Central Buyer Depot</span>
                <h4 style="font-weight: 900; font-size: 14px; color: #0f172a; margin: 6px 0 2px 0;">${stop.name}</h4>
                <p style="font-size: 11px; color: #475569; margin: 0;">Location: (${stop.latitude.toFixed(4)}, ${stop.longitude.toFixed(4)})</p>
              </div>
            `);

            const marker = new maplibregl.Marker({ element: depotEl })
              .setLngLat([stop.longitude, stop.latitude])
              .setPopup(popup)
              .addTo(map);

            markersRef.current.push(marker);
          } else {
            const isHighlighted = stop.id === highlightedFarmId;
            const farmEl = document.createElement('div');
            farmEl.innerHTML = `
              <div style="
                background-color: ${isHighlighted ? '#15803d' : color};
                color: white;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 800;
                font-size: 13px;
                border: 2px solid #ffffff;
                box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                cursor: pointer;
                transform: ${isHighlighted ? 'scale(1.25)' : 'scale(1)'};
              ">${stop.sequence}</div>
            `;

            if (onFarmClick) farmEl.addEventListener('click', () => onFarmClick(stop.id));

            const popup = new maplibregl.Popup({ offset: 18, closeButton: false }).setHTML(`
              <div style="font-family: system-ui, sans-serif; padding: 4px; min-width: 210px;">
                <span style="background: #e0f2fe; color: #0369a1; font-size: 10px; font-weight: 800; text-transform: uppercase; padding: 2px 8px; border-radius: 12px;">Stop #${stop.sequence}</span>
                <h4 style="font-weight: 900; font-size: 14px; color: #0f172a; margin: 4px 0;">${stop.name}</h4>
                <p style="font-size: 11px; color: #166534; font-weight: 700; margin: 0;">${stop.quantity_tonnes} Tonnes ${stop.residue_type || ''}</p>
              </div>
            `);

            const marker = new maplibregl.Marker({ element: farmEl })
              .setLngLat([stop.longitude, stop.latitude])
              .setPopup(popup)
              .addTo(map);

            markersRef.current.push(marker);
          }
        });
      });
    }

    // Render Real NASA FIRMS Satellite Hotspots
    if (showHotspots && firmsHotspots && firmsHotspots.length > 0) {
      firmsHotspots.forEach((fire: FirmsFireRecord, index: number) => {
        const normConf = normalizeFirmsConfidence(fire.confidence);
        const isSelected = selectedHotspotIndex === index;

        bounds.extend([fire.longitude, fire.latitude]);
        hasValidBounds = true;

        let markerBg = '#ea580c'; // default orange for nominal
        let shadowColor = 'rgba(234,88,12,0.85)';
        let badgeBg = '#ffedd5';
        let badgeText = '#9a3412';
        let badgeLabel = 'NOMINAL-CONFIDENCE ANOMALY';

        if (normConf === 'high') {
          markerBg = '#dc2626'; // red
          shadowColor = 'rgba(220,38,38,0.85)';
          badgeBg = '#fee2e2';
          badgeText = '#991b1b';
          badgeLabel = 'HIGH-CONFIDENCE ANOMALY';
        } else if (normConf === 'low') {
          markerBg = '#d97706'; // amber/yellow
          shadowColor = 'rgba(217,119,6,0.85)';
          badgeBg = '#fef3c7';
          badgeText = '#92400e';
          badgeLabel = 'LOW-CONFIDENCE ANOMALY';
        }

        const fireEl = document.createElement('div');
        const transformScale = isSelected ? 'scale(1.35)' : 'scale(1)';

        fireEl.innerHTML = `
          <div style="
            background-color: ${markerBg};
            color: white;
            width: ${isSelected ? '32px' : '26px'};
            height: ${isSelected ? '32px' : '26px'};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${isSelected ? '16px' : '13px'};
            border: 2px solid white;
            box-shadow: 0 0 14px ${shadowColor};
            cursor: pointer;
            transform: ${transformScale};
            transition: transform 0.2s ease;
          "><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg></div>
        `;

        if (onHotspotClick) {
          fireEl.addEventListener('click', (e) => {
            e.stopPropagation();
            onHotspotClick(index);
          });
        }

        const popupHTML = `
          <div style="font-family: system-ui, sans-serif; padding: 4px; min-width: 220px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="background: ${badgeBg}; color: ${badgeText}; font-size: 10px; font-weight: 800; text-transform: uppercase; padding: 2px 8px; border-radius: 12px;">
                ${badgeLabel}
              </span>
            </div>
            <h4 style="font-weight: 900; font-size: 13px; color: #0f172a; margin: 0 0 4px 0;">Satellite Thermal Anomaly</h4>
            <p style="font-size: 11px; color: #475569; margin: 0 0 6px 0;">Coord: (${fire.latitude.toFixed(4)}, ${fire.longitude.toFixed(4)})</p>
            <div style="font-size: 11px; color: #334155; border-top: 1px solid #f1f5f9; padding-top: 6px; space-y: 2px;">
              <div><strong>Sensor:</strong> ${fire.instrument || 'VIIRS'} (${fire.satellite || 'N'})</div>
              <div><strong>Acquired:</strong> ${fire.acq_date} ${fire.acq_time} UTC</div>
              <div><strong>FRP:</strong> ${fire.frp != null ? fire.frp + ' MW' : 'N/A'}</div>
            </div>
          </div>
        `;

        const popup = new maplibregl.Popup({ offset: 18, closeButton: false }).setHTML(popupHTML);

        const marker = new maplibregl.Marker({ element: fireEl })
          .setLngLat([fire.longitude, fire.latitude])
          .setPopup(popup)
          .addTo(map);

        markersRef.current.push(marker);
      });
    }

    // Render Participating Farmers if in Burn Intelligence view
    if (showHotspots && farmers && farmers.length > 0) {
      farmers.forEach(farmer => {
        const hasLat = (farmer as any).latitude != null;
        const hasLng = (farmer as any).longitude != null;
        if (!hasLat || !hasLng) return;

        const lat = Number((farmer as any).latitude);
        const lng = Number((farmer as any).longitude);

        if (!validateCoordinates(lat, lng)) return;

        bounds.extend([lng, lat]);
        hasValidBounds = true;

        const farmEl = document.createElement('div');
        farmEl.innerHTML = `
          <div style="
            background-color: #059669;
            color: white;
            width: 22px;
            height: 22px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            border: 2px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.25);
            cursor: pointer;
          " title="${farmer.name} (${farmer.location})"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22V12"/><path d="M17 7c0-2.76-2.24-5-5-5s-5 2.24-5 5c0 3 3 7 5 7s5-4 5-7z"/></svg></div>
        `;

        const popup = new maplibregl.Popup({ offset: 14, closeButton: false }).setHTML(`
          <div style="font-family: system-ui, sans-serif; padding: 4px; min-width: 180px;">
            <span style="background: #d1fae5; color: #065f46; font-size: 10px; font-weight: 800; text-transform: uppercase; padding: 2px 8px; border-radius: 12px;">Parali Partner Farm</span>
            <h4 style="font-weight: 900; font-size: 13px; color: #0f172a; margin: 4px 0 2px 0;">${farmer.name}</h4>
            <p style="font-size: 11px; color: #475569; margin: 0;">Location: ${farmer.location}</p>
          </div>
        `);

        const marker = new maplibregl.Marker({ element: farmEl })
          .setLngLat([lng, lat])
          .setPopup(popup)
          .addTo(map);

        markersRef.current.push(marker);
      });
    }

    if (hasValidBounds) {
      map.fitBounds(bounds, {
        padding: { top: 60, bottom: 60, left: 60, right: 60 },
        duration: 1000,
        maxZoom: 13
      });
    }

  }, [routeData, selectedVehicleIndex, showRoutes, showHotspots, firmsHotspots, selectedHotspotIndex, highlightedFarmId, mapLoaded]);

  const handleRecenter = () => {
    if (mapRef.current) {
      if (firmsHotspots && firmsHotspots.length > 0) {
        const bounds = new maplibregl.LngLatBounds();
        firmsHotspots.forEach(f => bounds.extend([f.longitude, f.latitude]));
        mapRef.current.fitBounds(bounds, { padding: 60, duration: 1000, maxZoom: 13 });
      } else if (routeData && routeData.routes) {
        const bounds = new maplibregl.LngLatBounds();
        routeData.routes.forEach(r => r.stops.forEach(s => bounds.extend([s.longitude, s.latitude])));
        mapRef.current.fitBounds(bounds, { padding: 60, duration: 1000, maxZoom: 14 });
      }
    }
  };

  const handleFlyToMyLocation = async () => {
    try {
      const pos = await getCurrentPosition();
      if (mapRef.current) {
        mapRef.current.flyTo({
          center: [pos.longitude, pos.latitude],
          zoom: 12,
          duration: 1500
        });
      }
    } catch (err: any) {
      alert(err.message || 'Unable to acquire current position.');
    }
  };

  const isBurnIntelligenceView = showHotspots && (!routeData || !showRoutes);

  return (
    <div className="relative w-full h-[550px] md:h-[620px] rounded-3xl overflow-hidden shadow-lg border border-forest-100/80 bg-slate-100">
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-50 bg-forest-950/40 backdrop-blur-xs flex flex-col items-center justify-center text-white gap-3">
          <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          <span className="font-extrabold text-sm tracking-wide">
            {isBurnIntelligenceView ? 'Fetching NASA Satellite Detections...' : 'Optimizing Road Pickup Sequence...'}
          </span>
        </div>
      )}

      {/* MapLibre WebGL Canvas Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Camera Viewport Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={handleRecenter}
          className="bg-white hover:bg-slate-50 text-forest-900 border border-slate-200 p-2.5 rounded-xl shadow-md font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          title="Fit Route Bounds"
        >
          <Maximize2 className="h-4 w-4 text-forest-600" />
          <span className="hidden sm:inline">Fit Route</span>
        </button>
        <button
          onClick={handleFlyToMyLocation}
          className="bg-white hover:bg-slate-50 text-forest-900 border border-slate-200 p-2.5 rounded-xl shadow-md font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          title="Fly to My Current GPS Position"
        >
          <Navigation className="h-4 w-4 text-emerald-600" />
          <span className="hidden sm:inline">My Location</span>
        </button>
      </div>

      {/* Collapsible Legend */}
      <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-xs border border-slate-200/80 rounded-2xl shadow-md text-xs text-slate-800 font-sans transition-all max-w-[250px]">
        <button
          onClick={() => setLegendOpen(!legendOpen)}
          className="w-full p-2.5 flex items-center justify-between font-extrabold text-[11px] text-slate-600 uppercase tracking-wider hover:bg-slate-50/50 rounded-2xl gap-2"
        >
          <span className="flex items-center gap-1.5">
            {isBurnIntelligenceView ? (
              <Flame className="h-3.5 w-3.5 text-clay-650" />
            ) : (
              <Layers className="h-3.5 w-3.5 text-forest-600" />
            )}
            {isBurnIntelligenceView ? 'Satellite Intelligence' : 'Route Legend'}
          </span>
          {legendOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
        </button>

        {legendOpen && (
          <div className="px-3 pb-3 space-y-2 border-t border-slate-100 pt-2 text-[11px]">
            {isBurnIntelligenceView ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-600 shadow-xs"></div>
                  <span className="font-semibold text-slate-700">High-confidence hotspot</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-600 shadow-xs"></div>
                  <span className="font-semibold text-slate-700">Nominal-confidence hotspot</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-600 shadow-xs"></div>
                  <span className="font-semibold text-slate-700">Low-confidence hotspot</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-600 shadow-xs"></div>
                  <span className="font-semibold text-slate-700">Parali participating farm</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-forest-700 text-white flex items-center justify-center text-[10px] font-black shadow-xs">
                    1
                  </div>
                  <span className="font-semibold text-slate-700">Accepted Farm Pickups</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-lg bg-amber-900 text-white flex items-center justify-center text-[11px] shadow-xs">
                    <Building2 className="w-3 h-3 text-white" />
                  </div>
                  <span className="font-semibold text-slate-700">Central Biomass Buyer Depot</span>
                </div>

                {showRoutes && routeData?.routes && (
                  <div className="pt-1.5 border-t border-slate-100 space-y-1.5">
                    {routeData.routes.map(r => {
                      const color = ROUTE_COLORS[(r.vehicle_index - 1) % ROUTE_COLORS.length];
                      return (
                        <div key={`legend-r-${r.vehicle_index}`} className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-4 h-1 rounded" style={{ backgroundColor: color }}></span>
                            <span className="font-medium text-slate-700">Truck #{r.vehicle_index}</span>
                          </div>
                          <span className="font-extrabold text-forest-900 text-[10px]">
                            {r.distance_km} km
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

    </div>
  );
};

