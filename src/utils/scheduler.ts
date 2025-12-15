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
	// Set start time to 9:00 AM on the first day if it's just a date
	currentTime.setHours(9, 0, 0, 0);

	const updatedItems: ItineraryItem[] = [];

	for (let i = 0; i < items.length; i++) {
		const item = { ...items[i] };
		const prevItem = i > 0 ? updatedItems[i - 1] : null;

		// Calculate travel time from previous location
		let travelTime = 0;
		if (prevItem) {
			const distance = calculateDistance(prevItem.location, item.location);
			const speed = SPEEDS[transportType];
			travelTime = Math.ceil((distance / speed) * 60); // minutes
		}

		// Add travel time buffer
		if (travelTime > 0) {
			currentTime = addMinutes(currentTime, travelTime);
		}

		// Handle explicit day break or auto-wrap if too late (e.g. after 22:00)
		if (item.forceDayStart || currentTime.getHours() >= 22) {
			// Move to next day 9:00 AM
			// If it's already past midnight of the previous day logic, we just ensure it's 9am of the "current" day if we wrapped?
			// Simpler: Just add 1 day to the *date* part of currentTime and set to 9am.
			// But wait, if we just finished at 23:00, we want tomorrow 9:00.
			// If we finished at 10:00 but forceDayStart is true, we want tomorrow 9:00.

			const nextDay = new Date(currentTime);
			if (item.forceDayStart || currentTime.getHours() >= 22) {
				nextDay.setDate(nextDay.getDate() + 1);
				nextDay.setHours(9, 0, 0, 0);
				currentTime = nextDay;
			}
		}

		// Set start time
		item.startTime = new Date(currentTime);

		// Calculate duration based on item type
		// For attractions, duration is usually fixed or suggested
		// For now, we assume the item already has a duration implicitly via endTime - startTime
		// But in our model, we should probably store 'duration' in the item or look it up.
		// Let's assume the item passed in might have a 'duration' property or we calculate it.
		// Since ItineraryItem doesn't have duration, we rely on the difference or default.
		// Wait, the interface defined earlier has startTime and endTime.
		// We should probably add 'duration' to ItineraryItem to make this easier,
		// or we assume the difference between original start/end is the intended duration.

		let duration = 0;
		if (item.type === 'hotel') {
			// Hotel ends at 9:00 AM next day (or same day if checked in early morning)
			const targetEnd = new Date(item.startTime);
			targetEnd.setHours(9, 0, 0, 0);
			if (targetEnd <= item.startTime) {
				targetEnd.setDate(targetEnd.getDate() + 1);
			}
			duration = (targetEnd.getTime() - item.startTime.getTime()) / (1000 * 60);
		} else {
			const originalDuration =
				(item.endTime.getTime() - item.startTime.getTime()) / (1000 * 60);
			duration = originalDuration > 0 ? originalDuration : 120; // Default 2 hours
		}

		// Set end time
		item.endTime = addMinutes(item.startTime, duration);
		currentTime = item.endTime;

		updatedItems.push(item);
	}

	return updatedItems;
}
