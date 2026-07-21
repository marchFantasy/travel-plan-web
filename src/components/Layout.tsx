import React, { useState, useEffect } from 'react';
import { Map, Calendar, Settings, Sparkles } from 'lucide-react';
import { useSettingsStore, TRANSLATIONS } from '../store/useSettingsStore';
import { CalendarModal } from './Planner/CalendarModal';
import { SettingsModal } from './Planner/SettingsModal';

export const Layout: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const { theme, language } = useSettingsStore();
	const t = TRANSLATIONS[language];
	const isDark = theme === 'dark';

	const [isCalendarOpen, setIsCalendarOpen] = useState(false);
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);

	useEffect(() => {
		if (theme === 'dark') {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	}, [theme]);

	return (
		<div
			className={`min-h-screen font-sans transition-colors duration-300 ${
				isDark
					? 'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100'
					: 'bg-gradient-to-b from-slate-50 via-slate-100/60 to-slate-50 text-slate-900'
			}`}
		>
			{/* Fluid Header */}
			<header
				className={`sticky top-0 z-40 border-b transition-all duration-300 ${
					isDark
						? 'bg-slate-950/80 border-slate-800/80 backdrop-blur-xl shadow-lg shadow-black/20'
						: 'bg-white/80 border-slate-200/80 backdrop-blur-xl shadow-xs'
				}`}
			>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
					{/* Logo */}
					<div className="flex items-center gap-3 group cursor-pointer">
						<div className="relative p-2.5 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
							<Map className="w-5 h-5 text-white" />
							<Sparkles className="w-3 h-3 text-amber-300 absolute -top-1 -right-1 animate-pulse" />
						</div>
						<div>
							<div className="flex items-center gap-2">
								<span className="text-xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent tracking-tight">
									{t.appTitle}
								</span>
								<span
									className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
										isDark
											? 'bg-blue-950/60 border-blue-800/50 text-blue-400'
											: 'bg-blue-50 border-blue-200 text-blue-600'
									}`}
								>
									PRO
								</span>
							</div>
							<span
								className={`hidden sm:block text-xs font-medium ${
									isDark ? 'text-slate-400' : 'text-slate-500'
								}`}
							>
								{t.subtitle}
							</span>
						</div>
					</div>

					{/* Navigation Action Buttons */}
					<nav className="flex items-center gap-3">
						<button
							onClick={() => setIsCalendarOpen(true)}
							title={t.calendarTitle}
							className={`px-3.5 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 text-sm font-semibold border shadow-xs hover:scale-102 active:scale-98 ${
								isDark
									? 'bg-slate-900/80 border-slate-800 hover:border-blue-500/50 text-slate-200 hover:text-white'
									: 'bg-white border-slate-200 hover:border-blue-300 text-slate-700 hover:text-slate-900'
							}`}
						>
							<div className="p-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
								<Calendar className="w-4 h-4" />
							</div>
							<span className="hidden md:inline">{t.calendarTitle}</span>
						</button>

						<button
							onClick={() => setIsSettingsOpen(true)}
							title={t.settingsTitle}
							className={`px-3.5 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 text-sm font-semibold border shadow-xs hover:scale-102 active:scale-98 ${
								isDark
									? 'bg-slate-900/80 border-slate-800 hover:border-indigo-500/50 text-slate-200 hover:text-white'
									: 'bg-white border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-slate-900'
							}`}
						>
							<div className="p-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
								<Settings className="w-4 h-4" />
							</div>
							<span className="hidden md:inline">{t.settingsTitle}</span>
						</button>
					</nav>
				</div>
			</header>

			{/* Main Content Area */}
			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{children}
			</main>

			{/* Modals */}
			<CalendarModal
				isOpen={isCalendarOpen}
				onClose={() => setIsCalendarOpen(false)}
			/>

			<SettingsModal
				isOpen={isSettingsOpen}
				onClose={() => setIsSettingsOpen(false)}
			/>
		</div>
	);
};
