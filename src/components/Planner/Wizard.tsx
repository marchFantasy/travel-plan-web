import React, { useState, useMemo } from 'react';
import { useItineraryStore } from '../../store/useItineraryStore';
import { MOCK_CITIES } from '../../data/mockData';
import {
	MapPin,
	Car,
	ArrowRight,
	Check,
	User,
	Baby,
	Armchair,
} from 'lucide-react';
import { format } from 'date-fns';
import { clsx } from 'clsx';

export const Wizard: React.FC<{ onComplete: () => void }> = ({
	onComplete,
}) => {
	const { config, setConfig, clearItems } = useItineraryStore();
	const [step, setStep] = useState(1);
	const [selectedProvince, setSelectedProvince] = useState<string>('全部');

	// Get unique provinces
	const provinces = useMemo(() => {
		const all = MOCK_CITIES.map((c) => c.province);
		return ['全部', ...Array.from(new Set(all))];
	}, []);

	// Filter cities
	const filteredCities = useMemo(() => {
		if (selectedProvince === '全部') return MOCK_CITIES;
		return MOCK_CITIES.filter((c) => c.province === selectedProvince);
	}, [selectedProvince]);

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

		// Check if selection actually changed (simple check)
		if (JSON.stringify(current.sort()) !== JSON.stringify(next.sort())) {
			// Ideally we warn user, but per requirement "automatically clear"
			if (current.length > 0) {
				clearItems(); // Clear attractions when cities change
			}
		}

		setConfig({ selectedCityIds: next });
	};

	return (
		<div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
			<div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
				<div className="bg-linear-to-r from-blue-600 to-indigo-600 p-6 text-white">
					<h2 className="text-2xl font-bold">定制您的完美旅程</h2>
					<p className="text-blue-100 mt-2">第 {step} 步 / 4</p>
				</div>

				<div className="p-8">
					{step === 1 && (
						<div className="space-y-6">
							<h3 className="text-xl font-semibold text-slate-800">您计划去多久？</h3>
							<div className="grid grid-cols-2 gap-4">
								{[3, 5, 7, 10].map((days) => (
									<button
										key={days}
										onClick={() => setConfig({ duration: days })}
										className={clsx(
											'p-4 rounded-xl border-2 transition-all text-left',
											config.duration === days
												? 'border-blue-600 bg-blue-50 text-blue-700'
												: 'border-slate-200 hover:border-blue-300'
										)}
									>
										<span className="text-2xl font-bold block">{days} 天</span>
										<span className="text-sm text-slate-500">
											适合 {days <= 3 ? '短途' : '深度'} 游
										</span>
									</button>
								))}
							</div>
							<div>
								<label className="block text-sm font-medium text-slate-700 mb-2">
									出发日期
								</label>
								<input
									type="date"
									value={format(config.startDate, 'yyyy-MM-dd')}
									onChange={(e) => setConfig({ startDate: new Date(e.target.value) })}
									className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
								/>
							</div>
						</div>
					)}

					{step === 2 && (
						<div className="space-y-6">
							<h3 className="text-xl font-semibold text-slate-800">谁将与您同行？</h3>
							<div className="grid grid-cols-1 gap-4">
								{[
									{ id: 'adult', label: '成人', desc: '标准行程节奏', icon: User },
									{
										id: 'child',
										label: '亲子',
										desc: '行程更轻松，包含趣味景点',
										icon: Baby,
									},
									{
										id: 'elderly',
										label: '长辈',
										desc: '节奏缓慢，减少徒步',
										icon: Armchair,
									},
								].map((type) => (
									<button
										key={type.id}
										onClick={() => {
											const t = type.id as any;
											const current = config.travelers;
											const next = current.includes(t)
												? current.filter((x) => x !== t)
												: [...current, t];
											if (next.length > 0) setConfig({ travelers: next });
										}}
										className={clsx(
											'p-4 rounded-xl border-2 transition-all flex items-center justify-between',
											config.travelers.includes(type.id as any)
												? 'border-blue-600 bg-blue-50'
												: 'border-slate-200 hover:border-blue-300'
										)}
									>
										<div className="flex items-center gap-4">
											<div
												className={clsx(
													'p-3 rounded-full',
													config.travelers.includes(type.id as any)
														? 'bg-blue-100 text-blue-600'
														: 'bg-slate-100 text-slate-500'
												)}
											>
												<type.icon className="w-6 h-6" />
											</div>
											<div className="text-left">
												<span className="font-bold text-lg block text-slate-800">
													{type.label}
												</span>
												<span className="text-sm text-slate-500">{type.desc}</span>
											</div>
										</div>
										{config.travelers.includes(type.id as any) && (
											<Check className="w-6 h-6 text-blue-600" />
										)}
									</button>
								))}
							</div>
						</div>
					)}

					{step === 3 && (
						<div className="space-y-6">
							<h3 className="text-xl font-semibold text-slate-800">
								您偏好的交通方式？
							</h3>
							<div className="grid grid-cols-2 gap-4">
								<button
									onClick={() => setConfig({ transport: 'driving' })}
									className={clsx(
										'p-6 rounded-xl border-2 transition-all text-center space-y-3',
										config.transport === 'driving'
											? 'border-blue-600 bg-blue-50 text-blue-700'
											: 'border-slate-200 hover:border-blue-300'
									)}
								>
									<Car className="w-10 h-10 mx-auto" />
									<div className="font-bold">自驾出游</div>
									<div className="text-xs text-slate-500">自由灵活，适合周边游</div>
								</button>
								<button
									onClick={() => setConfig({ transport: 'public' })}
									className={clsx(
										'p-6 rounded-xl border-2 transition-all text-center space-y-3',
										config.transport === 'public'
											? 'border-blue-600 bg-blue-50 text-blue-700'
											: 'border-slate-200 hover:border-blue-300'
									)}
								>
									<MapPin className="w-10 h-10 mx-auto" />
									<div className="font-bold">公共交通</div>
									<div className="text-xs text-slate-500">高铁/飞机 + 地铁/打车</div>
								</button>
							</div>
						</div>
					)}

					{step === 4 && (
						<div className="space-y-6">
							<h3 className="text-xl font-semibold text-slate-800">您想去哪里？</h3>

							{/* Province Filter */}
							<div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
								{provinces.map((p) => (
									<button
										key={p}
										onClick={() => setSelectedProvince(p)}
										className={clsx(
											'px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors',
											selectedProvince === p
												? 'bg-blue-600 text-white'
												: 'bg-slate-100 text-slate-600 hover:bg-slate-200'
										)}
									>
										{p}
									</button>
								))}
							</div>

							<div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-2">
								{filteredCities.map((city) => (
									<button
										key={city.id}
										onClick={() => toggleCity(city.id)}
										className={clsx(
											'p-3 rounded-lg border-2 transition-all text-left relative overflow-hidden group',
											config.selectedCityIds.includes(city.id)
												? 'border-blue-600 bg-blue-50'
												: 'border-slate-200 hover:border-blue-300'
										)}
									>
										<div className="font-bold text-slate-800">{city.name}</div>
										<div className="text-xs text-slate-500 truncate">
											{city.description}
										</div>
										{config.selectedCityIds.includes(city.id) && (
											<div className="absolute top-0 right-0 bg-blue-600 text-white p-1 rounded-bl-lg">
												<Check className="w-3 h-3" />
											</div>
										)}
									</button>
								))}
							</div>
							<p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
								注意：修改城市选择将清空当前已规划的行程景点。
							</p>
						</div>
					)}
				</div>

				<div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
					<button
						onClick={() => step > 1 && setStep(step - 1)}
						className={clsx(
							'px-6 py-2 rounded-lg font-medium transition-colors',
							step > 1 ? 'text-slate-600 hover:bg-slate-200' : 'invisible'
						)}
					>
						上一步
					</button>
					<button
						onClick={handleNext}
						disabled={step === 4 && config.selectedCityIds.length === 0}
						className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{step === 4 ? '开始规划' : '下一步'}
						<ArrowRight className="w-4 h-4" />
					</button>
				</div>
			</div>
		</div>
	);
};
