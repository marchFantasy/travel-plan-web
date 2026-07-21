import React, { useState } from 'react';
import { useItineraryStore } from '../../store/useItineraryStore';
import { useSettingsStore, TRANSLATIONS } from '../../store/useSettingsStore';
import { getLogicalDate, getDayNumber } from '../../utils/dateUtils';
import { DAY_COLORS } from '../Map/ChinaMap';
import {
	X,
	ChevronLeft,
	ChevronRight,
	Calendar as CalendarIcon,
	MapPin,
	Clock,
	Bed,
	Utensils,
	Navigation,
} from 'lucide-react';
import { format, isSameDay, isWithinInterval, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, addDays } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';

interface CalendarModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSelectDay?: (dayNumber: number) => void;
}

export const CalendarModal: React.FC<CalendarModalProps> = ({
	isOpen,
	onClose,
	onSelectDay,
}) => {
	const { config, items } = useItineraryStore();
	const { language, theme } = useSettingsStore();
	const t = TRANSLATIONS[language];
	const isDark = theme === 'dark';

	const tripStartDate = new Date(config.startDate || new Date());
	tripStartDate.setHours(0, 0, 0, 0);
	const tripEndDate = addDays(tripStartDate, (config.duration || 1) - 1);
	tripEndDate.setHours(23, 59, 59, 999);

	const [currentMonth, setCurrentMonth] = useState<Date>(tripStartDate);
	const [selectedDate, setSelectedDate] = useState<Date>(tripStartDate);

	if (!isOpen) return null;

	// Calculate calendar grid
	const monthStart = startOfMonth(currentMonth);
	const monthEnd = endOfMonth(monthStart);
	const gridStartDate = startOfWeek(monthStart, { weekStartsOn: 0 });
	const gridEndDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

	const calendarDays = eachDayOfInterval({ start: gridStartDate, end: gridEndDate });

	const weekHeaderZh = ['日', '一', '二', '三', '四', '五', '六'];
	const weekHeaderEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	const weekDays = language === 'zh' ? weekHeaderZh : weekHeaderEn;

	// Filter items for selected date
	const selectedDateItems = items.filter((item) => {
		const logicalDate = getLogicalDate(item);
		return isSameDay(logicalDate, selectedDate);
	});

	const selectedDayNumber = isWithinInterval(selectedDate, { start: tripStartDate, end: tripEndDate })
		? getDayNumber(selectedDate, tripStartDate)
		: null;

	const getItemIcon = (type: string) => {
		switch (type) {
			case 'hotel':
				return <Bed className="w-4 h-4 text-indigo-500" />;
			case 'meal':
				return <Utensils className="w-4 h-4 text-amber-500" />;
			case 'transport':
				return <Navigation className="w-4 h-4 text-emerald-500" />;
			default:
				return <MapPin className="w-4 h-4 text-blue-500" />;
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-xl animate-fade-in">
			<div
				className={`w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden border transition-colors ${
					isDark
						? 'bg-slate-900/95 border-slate-800 text-slate-100 backdrop-blur-2xl'
						: 'bg-white/95 border-slate-200/80 text-slate-900 backdrop-blur-2xl'
				}`}
			>
				{/* Modal Header */}
				<div className={`px-6 py-4 flex items-center justify-between border-b ${
					isDark ? 'border-slate-800 bg-slate-900/80' : 'border-slate-100 bg-slate-50/80'
				}`}>
					<div className="flex items-center gap-3">
						<div className="p-2.5 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
							<CalendarIcon className="w-6 h-6" />
						</div>
						<div>
							<h2 className="text-xl font-extrabold tracking-tight">{t.calendarTitle}</h2>
							<p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
								{t.calendarDesc}
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
				<div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
					{/* Left Column: Calendar Grid (7 cols on desktop) */}
					<div className="lg:col-span-7 flex flex-col gap-4">
						{/* Month Navigator */}
						<div className="flex items-center justify-between">
							<span className="text-lg font-bold">
								{format(currentMonth, language === 'zh' ? 'yyyy年 M月' : 'MMMM yyyy', {
									locale: language === 'zh' ? zhCN : enUS,
								})}
							</span>
							<div className="flex items-center gap-1">
								<button
									onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
									className={`p-2 rounded-lg border transition-colors ${
										isDark
											? 'border-slate-700 hover:bg-slate-800 text-slate-300'
											: 'border-slate-200 hover:bg-slate-100 text-slate-700'
									}`}
								>
									<ChevronLeft className="w-4 h-4" />
								</button>
								<button
									onClick={() => setCurrentMonth(tripStartDate)}
									className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
										isDark
											? 'border-slate-700 hover:bg-slate-800 text-blue-400'
											: 'border-slate-200 hover:bg-slate-100 text-blue-600'
									}`}
								>
									{language === 'zh' ? '回到行程月' : 'Trip Month'}
								</button>
								<button
									onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
									className={`p-2 rounded-lg border transition-colors ${
										isDark
											? 'border-slate-700 hover:bg-slate-800 text-slate-300'
											: 'border-slate-200 hover:bg-slate-100 text-slate-700'
									}`}
								>
									<ChevronRight className="w-4 h-4" />
								</button>
							</div>
						</div>

						{/* Grid */}
						<div className="grid grid-cols-7 gap-1.5">
							{/* Weekday Headers */}
							{weekDays.map((day, idx) => (
								<div
									key={idx}
									className={`text-center text-xs font-semibold py-2 rounded-md ${
										idx === 0 || idx === 6
											? isDark
												? 'text-rose-400'
												: 'text-rose-500'
											: isDark
											? 'text-slate-400'
											: 'text-slate-500'
									}`}
								>
									{day}
								</div>
							))}

							{/* Days */}
							{calendarDays.map((date, idx) => {
								const isCurrentMonth = isSameDay(startOfMonth(date), monthStart);
								const isInTrip = isWithinInterval(date, { start: tripStartDate, end: tripEndDate });
								const dayNo = isInTrip ? getDayNumber(date, tripStartDate) : null;
								const dayColor = dayNo ? DAY_COLORS[(dayNo - 1) % DAY_COLORS.length] : null;
								const isSelected = isSameDay(date, selectedDate);

								// Count items on this day
								const dayItemsCount = items.filter((item) =>
									isSameDay(getLogicalDate(item), date)
								).length;

								return (
									<button
										key={idx}
										onClick={() => setSelectedDate(date)}
										className={`relative h-20 p-1.5 flex flex-col justify-between rounded-xl border text-left transition-all ${
											isSelected
												? 'ring-2 ring-blue-500 ring-offset-1 z-10 shadow-lg'
												: ''
										} ${
											isInTrip
												? isDark
													? 'bg-slate-800/80 border-slate-600 hover:border-blue-500'
													: 'bg-blue-50/50 border-blue-200 hover:border-blue-400'
												: isCurrentMonth
												? isDark
													? 'bg-slate-900 border-slate-800 hover:bg-slate-800/50'
													: 'bg-white border-slate-100 hover:bg-slate-50'
												: isDark
												? 'bg-slate-950/40 border-slate-900 text-slate-600'
												: 'bg-slate-50/40 border-slate-50 text-slate-300'
										}`}
									>
										<div className="flex items-center justify-between w-full">
											<span
												className={`text-xs font-bold ${
													isSelected
														? 'text-blue-600 font-extrabold'
														: isInTrip
														? isDark
															? 'text-slate-100'
															: 'text-slate-900'
														: isCurrentMonth
														? isDark
															? 'text-slate-300'
															: 'text-slate-700'
														: isDark
														? 'text-slate-600'
														: 'text-slate-300'
												}`}
											>
												{format(date, 'd')}
											</span>

											{dayNo && (
												<span
													className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white shadow-xs"
													style={{ backgroundColor: dayColor || '#2563eb' }}
												>
													D{dayNo}
												</span>
											)}
										</div>

										{/* Day items preview */}
										{isInTrip && dayItemsCount > 0 ? (
											<div className="w-full">
												<div
													className="text-[10px] font-medium px-1 py-0.5 rounded-md truncate text-white"
													style={{ backgroundColor: dayColor || '#2563eb' }}
												>
													{dayItemsCount} {language === 'zh' ? '项日程' : 'items'}
												</div>
											</div>
										) : isInTrip ? (
											<div className="text-[10px] text-slate-400 italic">
												{language === 'zh' ? '暂无安排' : 'Empty'}
											</div>
										) : null}
									</button>
								);
							})}
						</div>
					</div>

					{/* Right Column: Selected Day Itinerary Detail (5 cols on desktop) */}
					<div
						className={`lg:col-span-5 flex flex-col rounded-xl p-5 border ${
							isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
						}`}
					>
						<div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700 mb-4">
							<div>
								<div className="flex items-center gap-2">
									<h3 className="font-bold text-lg">
										{format(selectedDate, language === 'zh' ? 'M月d日' : 'MMM d', {
											locale: language === 'zh' ? zhCN : enUS,
										})}
									</h3>
									{selectedDayNumber && (
										<span
											className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
											style={{
												backgroundColor:
													DAY_COLORS[(selectedDayNumber - 1) % DAY_COLORS.length],
											}}
										>
											{t.day.replace('{day}', String(selectedDayNumber))}
										</span>
									)}
								</div>
								<p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
									{selectedDateItems.length > 0
										? t.dayItemsCount.replace('{count}', String(selectedDateItems.length))
										: t.noItemsOnDay}
								</p>
							</div>

							{selectedDayNumber && onSelectDay && (
								<button
									onClick={() => {
										onSelectDay(selectedDayNumber);
										onClose();
									}}
									className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
								>
									{t.jumpToDay}
								</button>
							)}
						</div>

						{/* List of items */}
						<div className="flex-1 overflow-y-auto space-y-3 pr-1">
							{selectedDateItems.length === 0 ? (
								<div className="py-12 text-center text-slate-400">
									<CalendarIcon className="w-10 h-10 mx-auto mb-2 opacity-40" />
									<p className="text-sm">{t.noItemsOnDay}</p>
								</div>
							) : (
								selectedDateItems.map((item, idx) => (
									<div
										key={item.id || idx}
										className={`p-3 rounded-xl border flex items-start gap-3 transition-colors ${
											isDark
												? 'bg-slate-900 border-slate-700/80 hover:border-slate-600'
												: 'bg-white border-slate-200 hover:border-slate-300'
										}`}
									>
										<div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 mt-0.5">
											{getItemIcon(item.type)}
										</div>
										<div className="flex-1 min-w-0">
											<div className="flex items-center justify-between">
												<h4 className="font-semibold text-sm truncate">{item.name}</h4>
												<span className="text-xs font-medium text-slate-500 flex items-center gap-1">
													<Clock className="w-3 h-3" />
													{format(new Date(item.startTime), 'HH:mm')} -{' '}
													{format(new Date(item.endTime), 'HH:mm')}
												</span>
											</div>
											{item.notes && (
												<p className={`text-xs mt-1 truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
													{item.notes}
												</p>
											)}
										</div>
									</div>
								))
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
