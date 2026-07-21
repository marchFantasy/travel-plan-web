import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TransportType, TravelerType } from '../types';

export type Language = 'zh' | 'en';
export type Theme = 'light' | 'dark';
export type Pacing = 'relaxed' | 'moderate' | 'intense';

export interface TravelPreferences {
	transport: TransportType;
	pacing: Pacing;
	travelers: TravelerType[];
}

interface SettingsState {
	language: Language;
	theme: Theme;
	preferences: TravelPreferences;

	// Actions
	setLanguage: (lang: Language) => void;
	setTheme: (theme: Theme) => void;
	setPreferences: (prefs: Partial<TravelPreferences>) => void;
}

export const useSettingsStore = create<SettingsState>()(
	persist(
		(set) => ({
			language: 'zh',
			theme: 'light',
			preferences: {
				transport: 'public',
				pacing: 'moderate',
				travelers: ['adult'],
			},

			setLanguage: (language) => set({ language }),

			setTheme: (theme) => {
				set({ theme });
				if (typeof document !== 'undefined') {
					if (theme === 'dark') {
						document.documentElement.classList.add('dark');
					} else {
						document.documentElement.classList.remove('dark');
					}
				}
			},

			setPreferences: (newPrefs) =>
				set((state) => ({
					preferences: { ...state.preferences, ...newPrefs },
				})),
		}),
		{
			name: 'travel-plan-settings',
			onRehydrateStorage: () => (state) => {
				if (state && typeof document !== 'undefined') {
					if (state.theme === 'dark') {
						document.documentElement.classList.add('dark');
					} else {
						document.documentElement.classList.remove('dark');
					}
				}
			},
		}
	)
);

// Translation Dictionary for I18n
export const TRANSLATIONS = {
	zh: {
		appTitle: 'ChinaTravel',
		subtitle: 'AI智能行程规划大师',
		calendarTitle: '行程日历大盘',
		calendarDesc: '按月历查看行程日期分布、景点排布及每日详情',
		settingsTitle: '系统设置与出行偏好',
		language: '语言设置',
		theme: '外观主题',
		lightMode: '浅色模式',
		darkMode: '深色模式',
		travelPreferences: '出行偏好',
		transport: '交通工具',
		publicTransport: '公共交通 / 高铁',
		driving: '自驾 / 打车',
		pacing: '行程节奏',
		relaxed: '轻松舒适 (9:00 - 17:00)',
		moderate: '适中标准 (8:30 - 19:00)',
		intense: '紧凑高效 (8:00 - 21:30)',
		travelers: '同行人群',
		adult: '成人',
		child: '儿童',
		elderly: '长者',
		save: '保存并应用',
		close: '关闭',
		day: '第 {day} 天',
		dayItemsCount: '{count} 个安排',
		noItemsOnDay: '当天暂无景点安排',
		jumpToDay: '定位到此天',
		totalDays: '共 {days} 天行程',
		startDate: '出发日期',
	},
	en: {
		appTitle: 'ChinaTravel',
		subtitle: 'AI Smart Travel Planner',
		calendarTitle: 'Itinerary Calendar View',
		calendarDesc: 'Overview of trip schedule, attractions and daily details',
		settingsTitle: 'Settings & Preferences',
		language: 'Language',
		theme: 'Appearance Theme',
		lightMode: 'Light Mode',
		darkMode: 'Dark Mode',
		travelPreferences: 'Travel Preferences',
		transport: 'Transportation',
		publicTransport: 'Public Transit / High-speed Rail',
		driving: 'Driving / Taxi',
		pacing: 'Travel Pacing',
		relaxed: 'Relaxed (9:00 AM - 5:00 PM)',
		moderate: 'Moderate (8:30 AM - 7:00 PM)',
		intense: 'Intense (8:00 AM - 9:30 PM)',
		travelers: 'Travelers',
		adult: 'Adult',
		child: 'Child',
		elderly: 'Senior',
		save: 'Save & Apply',
		close: 'Close',
		day: 'Day {day}',
		dayItemsCount: '{count} items',
		noItemsOnDay: 'No attractions scheduled for this day',
		jumpToDay: 'Jump to this Day',
		totalDays: '{days} Days Total',
		startDate: 'Start Date',
	},
};
