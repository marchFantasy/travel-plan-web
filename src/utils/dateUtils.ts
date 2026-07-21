import type { ItineraryItem } from '../types';

/**
 * Helper to determine the logical date of an itinerary item.
 * Hotels and early-morning items (00:00 - 05:59 AM) belong to the previous day's itinerary.
 */
export function getLogicalDate(item: ItineraryItem): Date {
	const d = new Date(item.startTime);
	// If it's a hotel or early morning before 6:00 AM, it belongs to the night of the previous calendar day
	if (item.type === 'hotel' || d.getHours() < 6) {
		if (d.getHours() < 6) {
			d.setDate(d.getDate() - 1);
		}
	}
	d.setHours(0, 0, 0, 0);
	return d;
}

/**
 * Calculates the 1-based day index (第 1 天, 第 2 天...) based on start date.
 */
export function getDayNumber(itemDate: Date, startDate: Date): number {
	const start = new Date(startDate);
	start.setHours(0, 0, 0, 0);
	const current = new Date(itemDate);
	current.setHours(0, 0, 0, 0);

	const diffDays = Math.round(
		(current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
	);
	return Math.max(1, diffDays + 1);
}
