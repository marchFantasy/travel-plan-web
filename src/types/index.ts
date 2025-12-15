export interface City {
	id: string;
	name: string;
	province: string;
	center: [number, number]; // [lng, lat]
	description: string;
}

export interface Attraction {
	id: string;
	name: string;
	cityId: string;
	level: string;
	rating: number; // 0-5
	suggestedDuration: number; // minutes
	location: [number, number]; // [lng, lat]
	tags: string[];
	price: number;
	imageUrl: string;
	category?: 'attraction' | 'hotel' | 'restaurant';
}

export type TransportType = 'driving' | 'public';
export type TravelerType = 'adult' | 'child' | 'elderly';

export interface TravelConfig {
	duration: number; // days
	startDate: Date;
	travelers: TravelerType[];
	transport: TransportType;
	selectedCityIds: string[];
	startLocation: string; // City name or address
}

export interface ItineraryItem {
	id: string;
	type: 'attraction' | 'transport' | 'meal' | 'hotel';
	referenceId?: string; // ID of the attraction/hotel
	name: string;
	startTime: Date;
	endTime: Date;
	location: [number, number]; // [lng, lat]
	notes?: string;
	cost?: number;
	forceDayStart?: boolean;
}
