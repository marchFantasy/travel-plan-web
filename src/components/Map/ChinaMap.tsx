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

// Define colors for different days
const DAY_COLORS = [
	'#2563eb', // Blue
	'#16a34a', // Green
	'#d97706', // Orange
	'#9333ea', // Purple
	'#dc2626', // Red
	'#0891b2', // Cyan
	'#db2777', // Pink
];

export const ChinaMap: React.FC = () => {
	const { items, config } = useItineraryStore();
	const mapRef = useRef<any>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const markersRef = useRef<any[]>([]);
	const polylineRef = useRef<any>(null);

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
		if (polylineRef.current) {
			if (Array.isArray(polylineRef.current)) {
				map.remove(polylineRef.current);
			} else {
				map.remove(polylineRef.current);
			}
		}
		// Clear driving instances if any (we don't store them all, but we should clear polylines)
		polylineRef.current = [];
		markersRef.current = [];

		// Group items by day
		const dayGroups: { [key: string]: typeof items } = {};
		items.forEach((item) => {
			const dateStr = new Date(item.startTime).toDateString();
			if (!dayGroups[dateStr]) {
				dayGroups[dateStr] = [];
			}
			dayGroups[dateStr].push(item);
		});

		const days = Object.keys(dayGroups).sort(
			(a, b) => new Date(a).getTime() - new Date(b).getTime()
		);

		// Add Markers
		items.forEach((item, index) => {
			const position = new AMap.LngLat(item.location[0], item.location[1]);

			// Find which day index this item belongs to for color
			const dateStr = new Date(item.startTime).toDateString();
			const dayIndex = days.indexOf(dateStr);
			const color = DAY_COLORS[dayIndex % DAY_COLORS.length];

			const marker = new AMap.Marker({
				position: position,
				title: item.name,
				content: `
					<div class="flex flex-col items-center">
						<div class="bg-white px-2 py-1 rounded shadow text-xs font-bold mb-1 whitespace-nowrap border-l-4" style="border-left-color: ${color}">
							${item.name}
						</div>
						<div class="w-3 h-3 rounded-full border-2 border-white shadow" style="background-color: ${color}"></div>
					</div>
				`,
				offset: new AMap.Pixel(-0, -20),
				zIndex: 100 + index,
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
			  <p class="text-xs text-gray-400 mt-1">Day ${dayIndex + 1}</p>
            </div>
          `,
					offset: new AMap.Pixel(0, -30),
				});
				infoWindow.open(map, position);
			});

			markersRef.current.push(marker);
		});

		map.add(markersRef.current);

		// Draw Routes per Day
		const drawDayRoutes = async () => {
			for (let i = 0; i < days.length; i++) {
				const dayItems = dayGroups[days[i]];

				const color = DAY_COLORS[i % DAY_COLORS.length];
				const path = dayItems.map(
					(item) => new AMap.LngLat(item.location[0], item.location[1])
				);

				// Check previous day for hotel
				if (i > 0) {
					const prevDayItems = dayGroups[days[i - 1]];
					const lastPrevItem = prevDayItems[prevDayItems.length - 1];
					if (lastPrevItem && lastPrevItem.type === 'hotel') {
						path.unshift(
							new AMap.LngLat(lastPrevItem.location[0], lastPrevItem.location[1])
						);
					}
				}

				if (path.length < 2) continue;

				if (config.transport === 'driving') {
					// Use Driving API to get path geometry
					const driving = new AMap.Driving({
						policy: AMap.DrivingPolicy.LEAST_TIME,
					});

					const start = path[0];
					const end = path[path.length - 1];
					const waypoints = path.slice(1, -1);

					// Wrap search in promise
					try {
						await new Promise<void>((resolve) => {
							driving.search(
								start,
								end,
								{ waypoints: waypoints },
								(status: string, result: any) => {
									if (
										status === 'complete' &&
										result.routes &&
										result.routes.length > 0
									) {
										const routePath: any[] = [];
										result.routes[0].steps.forEach((step: any) => {
											routePath.push(...step.path);
										});

										const polyline = new AMap.Polyline({
											path: routePath,
											strokeColor: color,
											strokeWeight: 6,
											strokeOpacity: 0.8,
											lineJoin: 'round',
											lineCap: 'round',
											zIndex: 50,
										});
										map.add(polyline);
										polylineRef.current.push(polyline);
									}
									resolve();
								}
							);
						});
					} catch (e) {
						console.error('Driving route error', e);
					}
				} else {
					// Public transport - simple dashed line
					const polyline = new AMap.Polyline({
						path: path,
						strokeColor: color,
						strokeWeight: 6,
						strokeOpacity: 0.8,
						strokeStyle: 'dashed',
						lineJoin: 'round',
						lineCap: 'round',
						showDir: true,
						zIndex: 50,
					});
					map.add(polyline);
					polylineRef.current.push(polyline);
				}
			}
		};

		drawDayRoutes();

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
