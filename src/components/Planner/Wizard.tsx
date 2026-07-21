import React, { useState, useMemo } from 'react';
import { useItineraryStore } from '../../store/useItineraryStore';
import { MOCK_CITIES } from '../../data/mockData';
import {
	MapPin,
	Car,
	Bus,
	ArrowRight,
	Check,
	User,
	Baby,
	Armchair,
	Search,
	Calendar as CalendarIcon,
	Sparkles,
} from 'lucide-react';
import { format } from 'date-fns';
import { clsx } from 'clsx';
import type { TravelerType, TransportType } from '../../types';

export const Wizard: React.FC<{ onComplete: () => void }> = ({
	onComplete,
}) => {
	const { config, setConfig, clearItems } = useItineraryStore();
	const [step, setStep] = useState(1);
	const [selectedProvince, setSelectedProvince] = useState<string>('全部');
	const [citySearch, setCitySearch] = useState('');

	// Get unique provinces
	const provinces = useMemo(() => {
		const all = MOCK_CITIES.map((c) => c.province);
		return ['全部', ...Array.from(new Set(all))];
	}, []);

	// Filter cities
	const filteredCities = useMemo(() => {
		let result = MOCK_CITIES;

		if (selectedProvince !== '全部') {
			result = result.filter((c) => c.province === selectedProvince);
		}

		if (citySearch.trim()) {
			const keyword = citySearch.toLowerCase().trim();
			result = result.filter(
				(c) =>
					c.name.toLowerCase().includes(keyword) ||
					c.description.toLowerCase().includes(keyword)
			);
		}

		return result;
	}, [selectedProvince, citySearch]);

	const handleNext = () => {
		if (step < 4) {
			setStep(step + 1);
		} else {
			onComplete();
		}
	};

	const toggleCity = (cityId: string) => {
		const current = config.selectedCityIds;
		let next: string[];
		if (current.includes(cityId)) {
			next = current.filter((id) => id !== cityId);
		} else {
			next = [...current, cityId];
		}

		if (JSON.stringify(current.sort()) !== JSON.stringify(next.sort())) {
			if (current.length > 0) {
				clearItems();
			}
		}

		setConfig({ selectedCityIds: next });
	};

	return (
		<div className="flex items-center justify-center p-2 sm:p-4 animate-fade-in">
			<div className="max-w-2xl w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 transition-all duration-300">
				{/* Wizard Header Banner */}
				<div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white relative overflow-hidden">
					<div className="absolute right-[-20px] top-[-20px] w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
					<div className="flex items-center justify-between relative z-10">
						<div>
							<div className="flex items-center gap-2 mb-1">
								<Sparkles className="w-5 h-5 text-amber-300" />
								<span className="text-xs font-bold uppercase tracking-wider text-blue-100">
									AI Travel Planner
								</span>
							</div>
							<h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
								定制您的完美行程
							</h2>
						</div>
						<div className="px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-xs font-bold">
							Step {step} / 4
						</div>
					</div>

					{/* Progress Indicator */}
					<div className="w-full bg-white/20 h-1.5 rounded-full mt-6 overflow-hidden">
						<div
							className="bg-amber-400 h-full transition-all duration-500 ease-out"
							style={{ width: `${(step / 4) * 100}%` }}
						/>
					</div>
				</div>

				{/* Wizard Form Content */}
				<div className="p-6 sm:p-8">
					{/* STEP 1: Duration & Date */}
					{step === 1 && (
						<div className="space-y-6">
							<div>
								<h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
									您计划去多久？
								</h3>
								<p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
									选择预计游玩天数及起始出发日期
								</p>
							</div>

							<div className="grid grid-cols-2 gap-4">
								{[3, 5, 7, 10].map((days) => {
									const isSelected = config.duration === days;
									return (
										<button
											key={days}
											onClick={() => setConfig({ duration: days })}
											className={clsx(
												'p-4 rounded-2xl border-2 transition-all duration-200 text-left relative overflow-hidden group',
												isSelected
													? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shadow-md shadow-blue-500/10'
													: 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:border-blue-300 dark:hover:border-slate-700'
											)}
										>
											<span className="text-2xl font-black block tracking-tight">
												{days} 天
											</span>
											<span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
												适合 {days <= 3 ? '周末短途' : days <= 7 ? '经典深度' : '全景悠享'} 游
											</span>
											{isSelected && (
												<div className="absolute top-3 right-3 p-1 rounded-full bg-blue-600 text-white">
													<Check className="w-3 h-3" />
												</div>
											)}
										</button>
									);
								})}
							</div>

							<div className="space-y-2 pt-2">
								<label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
									<CalendarIcon className="w-4 h-4 text-blue-500" />
									出发日期
								</label>
								<input
									type="date"
									value={format(config.startDate, 'yyyy-MM-dd')}
									onChange={(e) =>
										setConfig({ startDate: new Date(e.target.value) })
									}
									className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all"
								/>
							</div>
						</div>
					)}

					{/* STEP 2: Travelers */}
					{step === 2 && (
						<div className="space-y-6">
							<div>
								<h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
									谁将与您同行？
								</h3>
								<p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
									智能适配行程节奏与推荐侧重
								</p>
							</div>

							<div className="grid grid-cols-1 gap-3">
								{[
									{ id: 'adult', label: '成人', desc: '标准舒适节奏，探索城市精华景点', icon: User },
									{
										id: 'child',
										label: '亲子游',
										desc: '包含趣味亲子景点，节奏更轻松',
										icon: Baby,
									},
									{
										id: 'elderly',
										label: '陪同长辈',
										desc: '减少连续徒步，行程平缓舒适',
										icon: Armchair,
									},
								].map((type) => {
									const isSelected = config.travelers.includes(type.id as TravelerType);
									return (
										<button
											key={type.id}
											onClick={() => {
												const t = type.id as TravelerType;
												const current = config.travelers;
												const next = current.includes(t)
													? current.filter((x) => x !== t)
													: [...current, t];
												if (next.length > 0) setConfig({ travelers: next });
											}}
											className={clsx(
												'p-4 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between text-left',
												isSelected
													? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 shadow-sm'
													: 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
											)}
										>
											<div className="flex items-center gap-4">
												<div
													className={clsx(
														'p-3 rounded-xl transition-colors',
														isSelected
															? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
															: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
													)}
												>
													<type.icon className="w-6 h-6" />
												</div>
												<div>
													<span className="font-bold text-base block text-slate-900 dark:text-slate-100">
														{type.label}
													</span>
													<span className="text-xs text-slate-500 dark:text-slate-400">
														{type.desc}
													</span>
												</div>
											</div>
											{isSelected && (
												<div className="p-1.5 rounded-full bg-blue-600 text-white">
													<Check className="w-4 h-4" />
												</div>
											)}
										</button>
									);
								})}
							</div>
						</div>
					)}

					{/* STEP 3: Cities Selection */}
					{step === 3 && (
						<div className="space-y-5">
							<div>
								<h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
									选择目标目的地城市
								</h3>
								<p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
									已选 {config.selectedCityIds.length} 个城市
								</p>
							</div>

							{/* Search & Province Filter */}
							<div className="space-y-3">
								<div className="relative">
									<Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
									<input
										type="text"
										placeholder="搜索城市或省份..."
										value={citySearch}
										onChange={(e) => setCitySearch(e.target.value)}
										className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
									/>
								</div>

								{/* Province Pills */}
								<div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
									{provinces.map((prov) => (
										<button
											key={prov}
											onClick={() => setSelectedProvince(prov)}
											className={clsx(
												'px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors',
												selectedProvince === prov
													? 'bg-blue-600 text-white'
													: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
											)}
										>
											{prov}
										</button>
									))}
								</div>
							</div>

							{/* Cities Grid */}
							<div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-60 overflow-y-auto pr-1">
								{filteredCities.map((city) => {
									const isSelected = config.selectedCityIds.includes(city.id);
									return (
										<button
											key={city.id}
											onClick={() => toggleCity(city.id)}
											className={clsx(
												'p-3 rounded-xl border-2 text-left transition-all relative overflow-hidden flex flex-col justify-between',
												isSelected
													? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 shadow-xs'
													: 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:border-blue-300'
											)}
										>
											<div className="flex items-center justify-between mb-1">
												<span className="font-bold text-sm text-slate-900 dark:text-slate-100">
													{city.name}
												</span>
												{isSelected && (
													<span className="p-0.5 rounded-full bg-blue-600 text-white">
														<Check className="w-3 h-3" />
													</span>
												)}
											</div>
											<span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block mt-0.5">
												{city.description}
											</span>
										</button>
									);
								})}
							</div>
						</div>
					)}

					{/* STEP 4: Transport & Confirm */}
					{step === 4 && (
						<div className="space-y-6">
							<div>
								<h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
									出行交通与最终确认
								</h3>
								<p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
									选择主交通工具并准备一键生成行程
								</p>
							</div>

							{/* Transport Selector */}
							<div className="grid grid-cols-2 gap-4">
								{[
									{
										id: 'public',
										label: '公共交通 / 高铁',
										desc: '地铁、公交与高铁连线',
										icon: Bus,
									},
									{
										id: 'driving',
										label: '自驾 / 打车',
										desc: '私家车或打车高效直达',
										icon: Car,
									},
								].map((t) => {
									const isSelected = config.transport === t.id;
									return (
										<button
											key={t.id}
											onClick={() => setConfig({ transport: t.id as TransportType })}
											className={clsx(
												'p-4 rounded-2xl border-2 transition-all flex flex-col justify-between text-left',
												isSelected
													? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 shadow-sm'
													: 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
											)}
										>
											<div className="flex items-center justify-between mb-2">
												<div
													className={clsx(
														'p-2.5 rounded-xl',
														isSelected
															? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
															: 'bg-slate-100 dark:bg-slate-800 text-slate-500'
													)}
												>
													<t.icon className="w-5 h-5" />
												</div>
												{isSelected && <Check className="w-4 h-4 text-blue-600" />}
											</div>
											<div>
												<span className="font-bold text-sm block text-slate-900 dark:text-slate-100">
													{t.label}
												</span>
												<span className="text-xs text-slate-400">
													{t.desc}
												</span>
											</div>
										</button>
									);
								})}
							</div>

							{/* Summary Box */}
							<div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs space-y-2">
								<div className="flex justify-between">
									<span className="text-slate-500 dark:text-slate-400">行程天数:</span>
									<span className="font-bold text-slate-800 dark:text-slate-200">
										{config.duration} 天 ({format(config.startDate, 'yyyy-MM-dd')} 出发)
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-slate-500 dark:text-slate-400">目标城市:</span>
									<span className="font-bold text-slate-800 dark:text-slate-200">
										{config.selectedCityIds.length > 0
											? MOCK_CITIES.filter((c) =>
													config.selectedCityIds.includes(c.id)
											  )
													.map((c) => c.name)
													.join(', ')
											: '未选择'}
									</span>
								</div>
							</div>
						</div>
					)}

					{/* Wizard Footer Controls */}
					<div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
						{step > 1 ? (
							<button
								onClick={() => setStep(step - 1)}
								className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
							>
								上一步
							</button>
						) : <div />}

						<button
							onClick={handleNext}
							disabled={step === 3 && config.selectedCityIds.length === 0}
							className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all disabled:opacity-40 disabled:shadow-none hover:scale-102 active:scale-98"
						>
							<span>{step === 4 ? '开启智能规划' : '下一步'}</span>
							<ArrowRight className="w-4 h-4" />
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};
