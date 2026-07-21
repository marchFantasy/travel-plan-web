import React, { useState } from 'react';
import { useSettingsStore, TRANSLATIONS } from '../../store/useSettingsStore';
import type { Language, Theme, Pacing } from '../../store/useSettingsStore';
import { useItineraryStore } from '../../store/useItineraryStore';
import type { TransportType, TravelerType } from '../../types';
import {
	X,
	Settings,
	Globe,
	Sun,
	Moon,
	Car,
	Bus,
	Clock,
	Users,
	Check,
} from 'lucide-react';

interface SettingsModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
	isOpen,
	onClose,
}) => {
	const { language, theme, preferences, setLanguage, setTheme, setPreferences } =
		useSettingsStore();
	const { setConfig } = useItineraryStore();

	const t = TRANSLATIONS[language];
	const isDark = theme === 'dark';

	const [tempLang, setTempLang] = useState<Language>(language);
	const [tempTheme, setTempTheme] = useState<Theme>(theme);
	const [tempTransport, setTempTransport] = useState<TransportType>(
		preferences.transport
	);
	const [tempPacing, setTempPacing] = useState<Pacing>(preferences.pacing);
	const [tempTravelers, setTempTravelers] = useState<TravelerType[]>(
		preferences.travelers
	);

	React.useEffect(() => {
		if (isOpen) {
			setTempLang(language);
			setTempTheme(theme);
			setTempTransport(preferences.transport);
			setTempPacing(preferences.pacing);
			setTempTravelers(preferences.travelers);
		}
	}, [isOpen, language, theme, preferences]);

	if (!isOpen) return null;

	const handleSave = () => {
		setLanguage(tempLang);
		setTheme(tempTheme);
		setPreferences({
			transport: tempTransport,
			pacing: tempPacing,
			travelers: tempTravelers,
		});

		// Sync with ItineraryStore config so scheduler updates
		setConfig({
			transport: tempTransport,
			travelers: tempTravelers,
		});

		onClose();
	};

	const toggleTraveler = (type: TravelerType) => {
		if (tempTravelers.includes(type)) {
			if (tempTravelers.length > 1) {
				setTempTravelers(tempTravelers.filter((t) => t !== type));
			}
		} else {
			setTempTravelers([...tempTravelers, type]);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-xl animate-fade-in">
			<div
				className={`w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden border transition-colors ${
					isDark
						? 'bg-slate-900/95 border-slate-800 text-slate-100 backdrop-blur-2xl'
						: 'bg-white/95 border-slate-200/80 text-slate-900 backdrop-blur-2xl'
				}`}
			>
				{/* Modal Header */}
				<div
					className={`px-6 py-4 flex items-center justify-between border-b ${
						isDark ? 'border-slate-800 bg-slate-900/80' : 'border-slate-100 bg-slate-50/80'
					}`}
				>
					<div className="flex items-center gap-3">
						<div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20">
							<Settings className="w-6 h-6" />
						</div>
						<div>
							<h2 className="text-xl font-extrabold tracking-tight">{t.settingsTitle}</h2>
							<p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
								{language === 'zh' ? '个性化调整您的语言、系统外观与出行偏好' : 'Customize language, appearance and travel defaults'}
							</p>
						</div>
					</div>
					<button
						onClick={onClose}
						className={`p-2 rounded-full transition-colors ${
							isDark
								? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
								: 'hover:bg-slate-200/80 text-slate-500 hover:text-slate-800'
						}`}
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* Modal Body */}
				<div className="flex-1 overflow-y-auto p-6 space-y-6">
					{/* Section 1: Language */}
					<div className="space-y-3">
						<label className="text-sm font-semibold flex items-center gap-2">
							<Globe className="w-4 h-4 text-blue-500" />
							{t.language}
						</label>
						<div className="grid grid-cols-2 gap-3">
							<button
								type="button"
								onClick={() => setTempLang('zh')}
								className={`px-4 py-3 rounded-xl border flex items-center justify-between font-medium text-sm transition-all ${
									tempLang === 'zh'
										? 'border-blue-500 bg-blue-50/50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-500 shadow-xs'
										: isDark
										? 'border-slate-800 bg-slate-800/40 hover:bg-slate-800'
										: 'border-slate-200 bg-white hover:bg-slate-50'
								}`}
							>
								<span>简体中文 (Chinese)</span>
								{tempLang === 'zh' && <Check className="w-4 h-4 text-blue-500" />}
							</button>

							<button
								type="button"
								onClick={() => setTempLang('en')}
								className={`px-4 py-3 rounded-xl border flex items-center justify-between font-medium text-sm transition-all ${
									tempLang === 'en'
										? 'border-blue-500 bg-blue-50/50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-500 shadow-xs'
										: isDark
										? 'border-slate-800 bg-slate-800/40 hover:bg-slate-800'
										: 'border-slate-200 bg-white hover:bg-slate-50'
								}`}
							>
								<span>English</span>
								{tempLang === 'en' && <Check className="w-4 h-4 text-blue-500" />}
							</button>
						</div>
					</div>

					{/* Section 2: Theme */}
					<div className="space-y-3">
						<label className="text-sm font-semibold flex items-center gap-2">
							<Sun className="w-4 h-4 text-amber-500" />
							{t.theme}
						</label>
						<div className="grid grid-cols-2 gap-3">
							<button
								type="button"
								onClick={() => setTempTheme('light')}
								className={`px-4 py-3 rounded-xl border flex items-center gap-3 font-medium text-sm transition-all ${
									tempTheme === 'light'
										? 'border-amber-500 bg-amber-50/50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 shadow-xs'
										: isDark
										? 'border-slate-800 bg-slate-800/40 hover:bg-slate-800'
										: 'border-slate-200 bg-white hover:bg-slate-50'
								}`}
							>
								<Sun className="w-5 h-5 text-amber-500" />
								<span>{t.lightMode}</span>
							</button>

							<button
								type="button"
								onClick={() => setTempTheme('dark')}
								className={`px-4 py-3 rounded-xl border flex items-center gap-3 font-medium text-sm transition-all ${
									tempTheme === 'dark'
										? 'border-indigo-500 bg-indigo-950/50 text-indigo-400 border-indigo-500 shadow-xs'
										: isDark
										? 'border-slate-800 bg-slate-800/40 hover:bg-slate-800'
										: 'border-slate-200 bg-white hover:bg-slate-50'
								}`}
							>
								<Moon className="w-5 h-5 text-indigo-400" />
								<span>{t.darkMode}</span>
							</button>
						</div>
					</div>

					<hr className={isDark ? 'border-slate-800' : 'border-slate-200'} />

					{/* Section 3: Travel Preferences */}
					<div className="space-y-4">
						<h3 className="text-sm font-bold tracking-wide text-slate-500 uppercase">
							{t.travelPreferences}
						</h3>

						{/* Transport */}
						<div className="space-y-2">
							<label className="text-xs font-semibold text-slate-400">
								{t.transport}
							</label>
							<div className="grid grid-cols-2 gap-3">
								<button
									type="button"
									onClick={() => setTempTransport('public')}
									className={`px-3 py-2.5 rounded-xl border flex items-center gap-2 text-xs font-medium transition-all ${
										tempTransport === 'public'
											? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
											: isDark
											? 'border-slate-800 bg-slate-800/40'
											: 'border-slate-200'
									}`}
								>
									<Bus className="w-4 h-4 text-blue-500" />
									<span>{t.publicTransport}</span>
								</button>
								<button
									type="button"
									onClick={() => setTempTransport('driving')}
									className={`px-3 py-2.5 rounded-xl border flex items-center gap-2 text-xs font-medium transition-all ${
										tempTransport === 'driving'
											? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
											: isDark
											? 'border-slate-800 bg-slate-800/40'
											: 'border-slate-200'
									}`}
								>
									<Car className="w-4 h-4 text-blue-500" />
									<span>{t.driving}</span>
								</button>
							</div>
						</div>

						{/* Pacing */}
						<div className="space-y-2">
							<label className="text-xs font-semibold text-slate-400">
								{t.pacing}
							</label>
							<div className="space-y-2">
								{(['relaxed', 'moderate', 'intense'] as Pacing[]).map((pace) => (
									<button
										key={pace}
										type="button"
										onClick={() => setTempPacing(pace)}
										className={`w-full px-3 py-2.5 rounded-xl border flex items-center justify-between text-xs font-medium transition-all ${
											tempPacing === pace
												? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
												: isDark
												? 'border-slate-800 bg-slate-800/40'
												: 'border-slate-200'
										}`}
									>
										<span className="flex items-center gap-2">
											<Clock className="w-4 h-4 text-slate-400" />
											{t[pace]}
										</span>
										{tempPacing === pace && <Check className="w-4 h-4 text-blue-500" />}
									</button>
								))}
							</div>
						</div>

						{/* Travelers */}
						<div className="space-y-2">
							<label className="text-xs font-semibold text-slate-400">
								{t.travelers}
							</label>
							<div className="flex items-center gap-2">
								{(['adult', 'child', 'elderly'] as TravelerType[]).map((type) => {
									const isSelected = tempTravelers.includes(type);
									return (
										<button
											key={type}
											type="button"
											onClick={() => toggleTraveler(type)}
											className={`px-3 py-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all ${
												isSelected
													? 'border-blue-500 bg-blue-600 text-white'
													: isDark
													? 'border-slate-800 bg-slate-800/40 text-slate-300'
													: 'border-slate-200 bg-white text-slate-700'
											}`}
										>
											<Users className="w-3.5 h-3.5" />
											<span>{t[type]}</span>
										</button>
									);
								})}
							</div>
						</div>
					</div>
				</div>

				{/* Modal Footer */}
				<div
					className={`px-6 py-4 flex items-center justify-end gap-3 border-t ${
						isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-slate-50'
					}`}
				>
					<button
						onClick={onClose}
						className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
							isDark
								? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
								: 'bg-slate-200 hover:bg-slate-300 text-slate-700'
						}`}
					>
						{t.close}
					</button>
					<button
						onClick={handleSave}
						className="px-5 py-2 text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all"
					>
						{t.save}
					</button>
				</div>
			</div>
		</div>
	);
};
