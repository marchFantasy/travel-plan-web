import { addMinutes } from 'date-fns';
import type { ItineraryItem, TransportType } from '../types';

// Mock speed in km/h (City travel is slower)
const SPEEDS = {
	driving: 30, // City driving average
	public: 20, // Public transport average including walking/waiting
};

// Haversine formula to calculate distance in km
function calculateDistance(
	loc1: [number, number],
	loc2: [number, number]
): number {
	const R = 6371; // Radius of the earth in km
	const dLat = deg2rad(loc2[1] - loc1[1]);
	const dLon = deg2rad(loc2[0] - loc1[0]);
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(deg2rad(loc1[1])) *
			Math.cos(deg2rad(loc2[1])) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c;
}

function deg2rad(deg: number): number {
	return deg * (Math.PI / 180);
}

export function recalculateItinerary(
	items: ItineraryItem[],
	startDate: Date,
	transportType: TransportType
): ItineraryItem[] {
	let currentTime = new Date(startDate);
	// Set start time to 9:00 AM on the first day
	currentTime.setHours(9, 0, 0, 0);

	const updatedItems: ItineraryItem[] = [];

	for (let i = 0; i < items.length; i++) {
		const item = { ...items[i] };
		const prevItem = i > 0 ? updatedItems[i - 1] : null;

		if (item.type === 'hotel') {
			// Hotel always represents accommodation for the current day's night.
			// If previous item finished early (e.g. before 20:00), default check-in is set to 20:00.
			let travelTime = 0;
			if (prevItem && prevItem.type !== 'hotel') {
				const distance = calculateDistance(prevItem.location, item.location);
				const speed = SPEEDS[transportType];
				travelTime = Math.ceil((distance / speed) * 60);
			}

			let checkInTime = addMinutes(currentTime, travelTime);
			if (checkInTime.getHours() < 20 && checkInTime.getHours() >= 6) {
				// Default evening check-in time (20:00)
				checkInTime.setHours(20, 0, 0, 0);
			}

			item.startTime = new Date(checkInTime);

			// Hotel checkout is 09:00 AM of the next morning
			const checkOutTime = new Date(item.startTime);
			checkOutTime.setDate(checkOutTime.getDate() + 1);
			checkOutTime.setHours(9, 0, 0, 0);
			item.endTime = checkOutTime;

			// Next day's schedule begins at 09:00 AM next morning after checkout
			currentTime = new Date(item.endTime);
		} else {
			// Non-hotel items (attractions / meals)
			let travelTime = 0;
			if (prevItem) {
				const distance = calculateDistance(prevItem.location, item.location);
				const speed = SPEEDS[transportType];
				travelTime = Math.ceil((distance / speed) * 60);
			}

			if (travelTime > 0) {
				currentTime = addMinutes(currentTime, travelTime);
			}

			// Wrap to next day 9:00 AM if forceDayStart is set or time is late night (>= 21:00)
			if (item.forceDayStart || currentTime.getHours() >= 21) {
				const nextDay = new Date(currentTime);
				nextDay.setDate(nextDay.getDate() + 1);
				nextDay.setHours(9, 0, 0, 0);
				currentTime = nextDay;
			}

			item.startTime = new Date(currentTime);

			const originalDuration =
				(new Date(item.endTime).getTime() - new Date(item.startTime).getTime()) / (1000 * 60);
			const duration = originalDuration > 0 ? originalDuration : 120; // Default 2 hours

			item.endTime = addMinutes(item.startTime, duration);
			currentTime = new Date(item.endTime);
		}

		updatedItems.push(item);
	}

	return updatedItems;
}
