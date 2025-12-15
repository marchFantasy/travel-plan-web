import React, { useEffect, useRef } from 'react';
import AMapLoader from '@amap/amap-jsapi-loader';
import { useItineraryStore } from '../../store/useItineraryStore';

// Define window.AMap type
declare global {
	interface Window {
		AMap: any;
		_AMapSecurityConfig: any;
	}
}

export const ChinaMap: React.FC = () => {
	const { items, config } = useItineraryStore();
	const mapRef = useRef<any>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const markersRef = useRef<any[]>([]);
	const polylineRef = useRef<any>(null);
	const drivingRef = useRef<any>(null);

	useEffect(() => {
		let mapInstance: any = null;

		AMapLoader.load({
			key: 'fef28102a75b176e9ded6a88405f5934', // User provided key
			version: '2.0',
			plugins: ['AMap.Scale', 'AMap.ToolBar', 'AMap.ControlBar', 'AMap.Driving'],
		})
			.then((AMap) => {
				if (!containerRef.current) return;

				mapInstance = new AMap.Map(containerRef.current, {
					viewMode: '3D',
					zoom: 4,
					center: [104.1954, 35.8617], // Center of China
				});

				mapRef.current = mapInstance;

				// Add controls
				mapInstance.addControl(new AMap.Scale());
				mapInstance.addControl(new AMap.ToolBar());
			})
			.catch((e) => {
				console.error('AMap load failed', e);
			});

		return () => {
			if (mapInstance) {
				mapInstance.destroy();
			}
		};
	}, []);

	// Update markers and route when items change
	useEffect(() => {
		if (!mapRef.current || !window.AMap) return;
		const AMap = window.AMap;
		const map = mapRef.current;

		// Clear existing
		map.remove(markersRef.current);
		if (polylineRef.current) map.remove(polylineRef.current);
		if (drivingRef.current) {
			drivingRef.current.clear();
			drivingRef.current = null;
		}
		markersRef.current = [];

		// Add Markers
		const path: any[] = [];
		items.forEach((item) => {
			const position = new AMap.LngLat(item.location[0], item.location[1]);
			path.push(position);

			const marker = new AMap.Marker({
				position: position,
				title: item.name,
				label: {
					content: `<div class="bg-white px-2 py-1 rounded shadow text-xs font-bold">${item.name}</div>`,
					direction: 'top',
				},
			});

			marker.on('click', () => {
				const infoWindow = new AMap.InfoWindow({
					content: `
            <div class="p-2">
              <h4 class="font-bold">${item.name}</h4>
              <p class="text-xs text-gray-500">
                ${new Date(item.startTime).toLocaleTimeString([], {
																	hour: '2-digit',
																	minute: '2-digit',
																})}
              </p>
            </div>
          `,
					offset: new AMap.Pixel(0, -30),
				});
				infoWindow.open(map, position);
			});

			markersRef.current.push(marker);
		});

		map.add(markersRef.current);

		// Draw Route
		if (path.length > 1) {
			if (config.transport === 'driving') {
				// Use AMap.Driving
				// Start: path[0]
				// End: path[path.length - 1]
				// Waypoints: path.slice(1, -1)

				const driving = new AMap.Driving({
					map: map,
					hideMarkers: true, // We use our own markers
					showTraffic: false,
				});
				drivingRef.current = driving;

				const start = path[0];
				const end = path[path.length - 1];
				const waypoints = path.slice(1, -1);

				driving.search(
					start,
					end,
					{ waypoints: waypoints },
					(status: string, result: any) => {
						if (status === 'complete') {
							// console.log('Driving route found');
						} else {
							console.error('Driving route failed', result);
							// Fallback to polyline if needed?
						}
					}
				);
			} else {
				// Use Polyline for Public Transport (dashed)
				polylineRef.current = new AMap.Polyline({
					path: path,
					strokeColor: '#2563eb', // blue-600
					strokeWeight: 6,
					strokeOpacity: 0.8,
					strokeStyle: 'dashed',
					lineJoin: 'round',
					lineCap: 'round',
					showDir: true,
				});
				map.add(polylineRef.current);
			}
		}

		// Fit view
		if (markersRef.current.length > 0) {
			map.setFitView(markersRef.current, false, [50, 50, 50, 50]);
		}
	}, [items, config.transport]);

	return (
		<div
			ref={containerRef}
			className="w-full h-full rounded-xl overflow-hidden"
		/>
	);
};
