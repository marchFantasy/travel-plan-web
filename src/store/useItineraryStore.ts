import { create } from 'zustand';
import type { ItineraryItem, TravelConfig, Attraction } from '../types';
import { recalculateItinerary } from '../utils/scheduler';

interface ItineraryState {
	config: TravelConfig;
	items: ItineraryItem[];
	availableAttractions: Attraction[];

	// Actions
	setConfig: (config: Partial<TravelConfig>) => void;
	addItem: (attraction: Attraction) => void;
	removeItem: (id: string) => void;
	clearItems: () => void;
	reorderItems: (startIndex: number, endIndex: number) => void;
	updateItem: (id: string, updates: Partial<ItineraryItem>) => void;
}

export const useItineraryStore = create<ItineraryState>((set, get) => ({
	config: {
		duration: 3,
		startDate: new Date(),
		travelers: ['adult'],
		transport: 'public',
		selectedCityIds: [],
		startLocation: '',
	},
	items: [],
	availableAttractions: [],

	setConfig: (newConfig) => {
		set((state) => ({
			config: { ...state.config, ...newConfig },
		}));
		// Recalculate if transport or date changes
		const { items, config } = get();
		const updatedItems = recalculateItinerary(
			items,
			config.startDate,
			config.transport
		);
		set({ items: updatedItems });
	},

	addItem: (attraction) => {
		const { items, config } = get();

		const newItem: ItineraryItem = {
			id: crypto.randomUUID(),
			type:
				attraction.category === 'hotel'
					? 'hotel'
					: attraction.category === 'restaurant'
					? 'meal'
					: 'attraction',
			referenceId: attraction.id,
			name: attraction.name,
			// Initial times will be calculated
			startTime: new Date(),
			endTime: new Date(), // Placeholder
			location: attraction.location,
			notes: '',
		};

		// Set initial duration based on suggestion
		const duration = attraction.suggestedDuration || 120;
		newItem.endTime = new Date(newItem.startTime.getTime() + duration * 60000);

		const newItems = [...items, newItem];
		const recalculatedItems = recalculateItinerary(
			newItems,
			config.startDate,
			config.transport
		);

		set({ items: recalculatedItems });
	},

	removeItem: (id) => {
		const { items, config } = get();
		const newItems = items.filter((item) => item.id !== id);
		const recalculatedItems = recalculateItinerary(
			newItems,
			config.startDate,
			config.transport
		);
		set({ items: recalculatedItems });
	},

	clearItems: () => {
		set({ items: [] });
	},

	reorderItems: (startIndex, endIndex) => {
		const { items, config } = get();
		const result = Array.from(items);
		const [removed] = result.splice(startIndex, 1);
		result.splice(endIndex, 0, removed);

		const recalculatedItems = recalculateItinerary(
			result,
			config.startDate,
			config.transport
		);
		set({ items: recalculatedItems });
	},

	updateItem: (id, updates) => {
		const { items, config } = get();
		const newItems = items.map((item) =>
			item.id === id ? { ...item, ...updates } : item
		);
		// If time-related updates, might need recalculation, but usually manual override should stick?
		// For now, let's re-run scheduler to ensure consistency
		const recalculatedItems = recalculateItinerary(
			newItems,
			config.startDate,
			config.transport
		);
		set({ items: recalculatedItems });
	},
}));
