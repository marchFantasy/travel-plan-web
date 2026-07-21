import React, { useEffect, useState } from 'react';
import { useItineraryStore } from '../../store/useItineraryStore';
import { MOCK_CITIES } from '../../data/mockData';
import { ChinaMap, DAY_COLORS } from '../Map/ChinaMap';
import { getLogicalDate, getDayNumber } from '../../utils/dateUtils';
import { calculateTravelTime, calculateDistance } from '../../utils/scheduler';
import {
	Plus,
	Star,
	Clock,
	ArrowLeft,
	Loader2,
	ArrowUp,
	ArrowDown,
	Trash2,
	Minus,
	Moon,
	Search,
	Bed,
	Utensils,
	MapPin,
	Share2,
	ChevronLeft,
	ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';
import AMapLoader from '@amap/amap-jsapi-loader';
import type { Attraction } from '../../types';
import { ShareModal } from './ShareModal';
import { PoiConfirmModal } from './PoiConfirmModal';

interface AMapPoiItem {
	id: string;
	name: string;
	type?: string;
	tag?: string;
	location: { lng: number; lat: number };
	biz_ext?: { rating?: string; cost?: string };
	photos?: Array<{ url: string }>;
}

interface AMapSearchResult {
	poiList?: {
		pois: AMapPoiItem[];
	};
}

const PAGE_SIZE = 10;

export const Dashboard: React.FC<{ onBack: () => void }> = ({ onBack }) => {
	const {
		config,
		items,
		addItem,
		reorderItems,
		removeItem,
		updateItem,
		clearItems,
	} = useItineraryStore();
	const [attractions, setAttractions] = useState<Attraction[]>([]);
	const [loading, setLoading] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [searchKeyword, setSearchKeyword] = useState('');
	const [searchCategory, setSearchCategory] = useState<
		'attraction' | 'hotel' | 'restaurant'
	>('attraction');
	const [searchCenter, setSearchCenter] = useState<{
		location: [number, number];
		name: string;
	} | null>(null);
	const [showShare, setShowShare] = useState(false);
	const [confirmingPoi, setConfirmingPoi] = useState<Attraction | null>(null);

	const doSearch = async (keyword?: string) => {
		if (config.selectedCityIds.length === 0) return;

		setLoading(true);
		try {
			const AMap = await AMapLoader.load({
				key: 'fef28102a75b176e9ded6a88405f5934',
				version: '2.0',
				plugins: ['AMap.PlaceSearch'],
			});

			const selectedCities = MOCK_CITIES.filter((c) =>
				config.selectedCityIds.includes(c.id),
			);
			const allAttractions: Attraction[] = [];

			// Determine AMap type based on category
			let type = '风景名胜';
			if (searchCategory === 'hotel') type = '住宿服务';
			if (searchCategory === 'restaurant') type = '餐饮服务';

			// Default keyword if empty
			const query =
				keyword ||
				(searchCategory === 'attraction'
					? '景区'
					: searchCategory === 'hotel'
						? '酒店'
						: '美食');

			if (searchCenter) {
				// Search nearby specific location
				const placeSearch = new AMap.PlaceSearch({
					type: type,
					pageSize: 20,
					extensions: 'all',
				});

				await new Promise<void>((resolve) => {
					placeSearch.searchNearBy(
						query,
						searchCenter.location,
						5000, // 5km radius
						(status: string, result: AMapSearchResult) => {
							if (status === 'complete' && result.poiList) {
								const pois = result.poiList.pois;
								processPois(pois, allAttractions, selectedCities[0]); // Use first city as fallback for ID
							}
							resolve();
						},
					);
				});
			} else {
				// Search in cities
				for (const city of selectedCities) {
					const placeSearch = new AMap.PlaceSearch({
						city: city.name,
						type: type,
						pageSize: 20,
						extensions: 'all',
					});

					await new Promise<void>((resolve) => {
						placeSearch.search(query, (status: string, result: AMapSearchResult) => {
							if (status === 'complete' && result.poiList) {
								const pois = result.poiList.pois;
								processPois(pois, allAttractions, city);
							}
							resolve();
						});
					});
				}
			}
			setAttractions(allAttractions);
			setCurrentPage(1);
		} catch (e) {
			console.error('Failed to fetch attractions', e);
		} finally {
			setLoading(false);
		}
	};

	const processPois = (
		pois: AMapPoiItem[],
		allAttractions: Attraction[],
		city: (typeof MOCK_CITIES)[0],
	) => {
		pois.forEach((poi) => {
			// Avoid duplicates by ID or Name
			if (!allAttractions.find((a) => a.id === poi.id || a.name === poi.name)) {
				// Determine level or fallback to type
				let level = '普通';
				if (poi.name.includes('5A') || (poi.tag && poi.tag.includes('5A'))) {
					level = '5A';
				} else if (
					poi.name.includes('4A') ||
					(poi.tag && poi.tag.includes('4A'))
				) {
					level = '4A';
				} else if (poi.type) {
					// Use the first part of type as tag/level
					level = poi.type.split(';')[0];
				}

				// Determine default duration
				let duration = 90;
				if (searchCategory === 'restaurant' || poi.type?.includes('餐饮') || poi.type?.includes('美食')) {
					duration = 60;
				} else if (searchCategory === 'hotel' || poi.type?.includes('住宿') || poi.type?.includes('酒店')) {
					duration = 0; // Usually just a stop or check-in
				} else if (searchCategory === 'attraction') {
					duration = level === '5A' ? 180 : level === '4A' ? 120 : 90;
				}

				allAttractions.push({
					id: poi.id,
					name: poi.name,
					cityId: city.id,
					level: level,
					rating:
						poi.biz_ext && poi.biz_ext.rating
							? parseFloat(poi.biz_ext.rating)
							: 4.5,
					suggestedDuration: duration,
					location: [poi.location.lng, poi.location.lat],
					tags: poi.type ? poi.type.split(';').slice(0, 3) : ['景点'],
					price:
						poi.biz_ext && poi.biz_ext.cost ? parseFloat(poi.biz_ext.cost) : 0,
					imageUrl:
						poi.photos && poi.photos.length > 0
							? poi.photos[0].url
							: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=800&q=80',
					category: searchCategory,
				});
			}
		});
	};

	useEffect(() => {
		doSearch();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [config.selectedCityIds, searchCategory, searchCenter]);

	const totalPages = Math.max(1, Math.ceil(attractions.length / PAGE_SIZE));
	const paginatedAttractions = attractions.slice(
		(currentPage - 1) * PAGE_SIZE,
		currentPage * PAGE_SIZE,
	);

	return (
		<div className="grid grid-cols-12 gap-6 h-[calc(100vh-8rem)]">
			{/* Left Panel: Attraction Library */}
			<div className="col-span-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
				<div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80">
					<div className="flex items-center gap-2 mb-3">
						<button
							onClick={onBack}
							className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
							title="修改配置"
						>
							<ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
						</button>
						<div>
							<h3 className="font-semibold text-slate-800 dark:text-slate-100">推荐景点</h3>
							<p className="text-xs text-slate-500 dark:text-slate-400">
								{loading
									? '正在加载实时数据...'
									: `找到 ${attractions.length} 个景点 (共 ${totalPages} 页)`}
							</p>
						</div>
					</div>

					{/* Category Tabs */}
					<div className="flex gap-2 mb-3">
						<button
							onClick={() => setSearchCategory('attraction')}
							className={`flex-1 py-1.5 text-sm font-medium rounded-lg flex items-center justify-center gap-1 transition-colors ${
								searchCategory === 'attraction'
									? 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-400'
									: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
							}`}
						>
							<MapPin className="w-3.5 h-3.5" />
							景点
						</button>
						<button
							onClick={() => setSearchCategory('restaurant')}
							className={`flex-1 py-1.5 text-sm font-medium rounded-lg flex items-center justify-center gap-1 transition-colors ${
								searchCategory === 'restaurant'
									? 'bg-orange-100 text-orange-700 dark:bg-orange-950/80 dark:text-orange-400'
									: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
							}`}
						>
							<Utensils className="w-3.5 h-3.5" />
							美食
						</button>
						<button
							onClick={() => setSearchCategory('hotel')}
							className={`flex-1 py-1.5 text-sm font-medium rounded-lg flex items-center justify-center gap-1 transition-colors ${
								searchCategory === 'hotel'
									? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-400'
									: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
							}`}
						>
							<Bed className="w-3.5 h-3.5" />
							住宿
						</button>
					</div>

					{/* Search Center Indicator */}
					{searchCenter && (
						<div className="mb-3 flex items-center justify-between bg-blue-50 dark:bg-blue-950/40 px-3 py-2 rounded-lg text-xs text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
							<div className="flex items-center gap-1 truncate">
								<MapPin className="w-3 h-3" />
								<span className="truncate">附近: {searchCenter.name}</span>
							</div>
							<button
								onClick={() => setSearchCenter(null)}
								className="text-blue-500 dark:text-blue-400 hover:text-blue-700 whitespace-nowrap ml-2"
							>
								清除
							</button>
						</div>
					)}

					{/* Search Box */}
					<div className="relative">
						<input
							type="text"
							placeholder={
								searchCategory === 'attraction'
									? '搜索景点...'
									: searchCategory === 'hotel'
										? '搜索酒店...'
										: '搜索美食...'
							}
							value={searchKeyword}
							onChange={(e) => setSearchKeyword(e.target.value)}
							onKeyDown={(e) => e.key === 'Enter' && doSearch(searchKeyword)}
							className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
						/>
						<Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
						<button
							onClick={() => doSearch(searchKeyword)}
							className="absolute right-1 top-1 bottom-1 px-3 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-900/60"
						>
							搜索
						</button>
					</div>
				</div>
				<div className="flex-1 overflow-y-auto p-4 space-y-4">
					{loading ? (
						<div className="flex justify-center py-10">
							<Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
						</div>
					) : paginatedAttractions.length === 0 ? (
						<div className="text-center py-10 text-slate-400 text-sm">
							未找到相关地点
						</div>
					) : (
						paginatedAttractions.map((attraction) => (
							<div
								key={attraction.id}
								onClick={() => setConfirmingPoi(attraction)}
								className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
							>
								<div className="h-32 overflow-hidden relative">
									<img
										src={attraction.imageUrl}
										alt={attraction.name}
										className="w-full h-full object-cover"
									/>
									<div className="absolute top-2 right-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1">
										<Star className="w-3 h-3 fill-current" />
										{attraction.rating}
									</div>
								</div>
								<div className="p-3">
									<div className="flex justify-between items-start mb-2">
										<div>
											<h4 className="font-bold text-slate-800 dark:text-slate-100">
												{attraction.name}
											</h4>
											<div className="flex gap-2 mt-1 flex-wrap">
												<span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-full">
													{attraction.level}
												</span>
												{attraction.price > 0 && (
													<span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 rounded-full">
														¥{attraction.price}
													</span>
												)}
											</div>
										</div>
										<button
											onClick={(e) => {
												e.stopPropagation();
												setConfirmingPoi(attraction);
											}}
											className="p-2 bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-colors"
											title="预览并添加到行程"
										>
											<Plus className="w-4 h-4" />
										</button>
									</div>
								</div>
							</div>
						))
					)}
				</div>

				{/* Pagination Footer */}
				{!loading && attractions.length > 0 && (
					<div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
						<span className="truncate">
							共 {attractions.length} 条 | 每页 10 条
						</span>
						<div className="flex items-center gap-1.5 shrink-0">
							<button
								onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
								disabled={currentPage === 1}
								className="p-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-white dark:disabled:hover:bg-slate-900 transition-colors"
								title="上一页"
							>
								<ChevronLeft className="w-4 h-4 text-slate-700 dark:text-slate-300" />
							</button>
							<span className="font-semibold text-slate-700 dark:text-slate-200 px-1">
								{currentPage} / {totalPages}
							</span>
							<button
								onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
								disabled={currentPage === totalPages}
								className="p-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-white dark:disabled:hover:bg-slate-900 transition-colors"
								title="下一页"
							>
								<ChevronRight className="w-4 h-4 text-slate-700 dark:text-slate-300" />
							</button>
						</div>
					</div>
				)}
			</div>

			{/* Center Panel: Map */}
			<div className="col-span-6 bg-slate-200 dark:bg-slate-950 rounded-xl border border-slate-300 dark:border-slate-800 relative overflow-hidden shadow-inner">
				<ChinaMap
					searchPois={attractions}
					searchCenter={searchCenter}
					onSelectPoi={(poi) => setConfirmingPoi(poi)}
				/>
			</div>

			{/* Right Panel: Timeline */}
			<div className="col-span-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
				<div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 space-y-2.5">
					<div className="flex justify-between items-center">
						<div>
							<h3 className="font-semibold text-slate-800 dark:text-slate-100">行程安排</h3>
							<p className="text-xs text-slate-500 dark:text-slate-400">
								{format(config.startDate, 'yyyy-MM-dd')} 开始 ·{' '}
								{config.duration} 天
							</p>
						</div>
						<button
							onClick={() => setShowShare(true)}
							className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-600 dark:text-slate-300 flex items-center gap-1 text-xs font-medium"
							title="分享行程"
						>
							<Share2 className="w-4 h-4" />
							<span>分享</span>
						</button>
					</div>

					{items.length > 0 && (
						<div className="pt-0.5">
							<button
								onClick={() => {
									if (window.confirm('确定要清空所有日程安排吗？')) {
										clearItems();
									}
								}}
								className="w-full py-1.5 px-3 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors flex items-center justify-center gap-1.5 font-medium border border-red-200 dark:border-red-900/50"
								title="一键清空所有日程"
							>
								<Trash2 className="w-3.5 h-3.5" />
								清空所有日程安排
							</button>
						</div>
					)}
				</div>
				<div className="flex-1 overflow-y-auto p-4">
					{items.length === 0 ? (
						<div className="text-center py-10 text-slate-400 dark:text-slate-500">
							<p>暂无行程</p>
							<p className="text-sm mt-2">从左侧添加景点开始规划</p>
						</div>
					) : (
						<div className="space-y-0 relative">
							{/* Vertical line */}
							<div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-700" />

							{items.map((item, index) => {
								const itemDate = getLogicalDate(item);
								const prevItemDate =
									index > 0 ? getLogicalDate(items[index - 1]) : null;
								const isNewDay =
									index === 0 || itemDate.getTime() !== prevItemDate?.getTime();

								// Calculate day index & route color
								const dayNum = getDayNumber(itemDate, config.startDate);
								const dayColor = DAY_COLORS[(dayNum - 1) % DAY_COLORS.length];

								return (
									<div
										key={item.id}
										className="relative pl-10 pb-6 last:pb-0 group"
									>
										{isNewDay && (
											<div
												className="absolute -left-2 top-[-10px] text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow-xs z-10 border border-white/20 dark:border-slate-800"
												style={{ backgroundColor: dayColor }}
											>
												第 {dayNum} 天
											</div>
										)}
										{/* Dot */}
										<div
											className={`absolute left-[11px] top-3 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ring-1 ${
												item.type === 'hotel'
													? 'bg-indigo-600 ring-indigo-100 dark:ring-indigo-900'
													: item.type === 'meal'
														? 'bg-orange-500 ring-orange-100 dark:ring-orange-900'
														: 'bg-blue-600 ring-blue-100 dark:ring-blue-900'
											}`}
										/>
										<div
											className={`p-3 rounded-lg border transition-colors ${
												item.type === 'hotel'
													? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-100 dark:border-indigo-900/50 group-hover:border-indigo-300 dark:group-hover:border-indigo-700'
													: item.type === 'meal'
														? 'bg-orange-50 dark:bg-orange-950/40 border-orange-100 dark:border-orange-900/50 group-hover:border-orange-300 dark:group-hover:border-orange-700'
														: 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 group-hover:border-blue-300 dark:group-hover:border-blue-600'
											}`}
										>
											<div className="flex justify-between items-start">
												<h4
													className={`font-bold ${
														item.type === 'hotel'
															? 'text-indigo-900 dark:text-indigo-200'
															: item.type === 'meal'
																? 'text-orange-900 dark:text-orange-200'
																: 'text-slate-800 dark:text-slate-100'
													}`}
												>
													{item.name}
												</h4>
												<div className="flex gap-1">
													<button
														onClick={() => reorderItems(index, index - 1)}
														disabled={index === 0}
														className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded disabled:opacity-30"
													>
														<ArrowUp className="w-3 h-3 text-slate-500 dark:text-slate-400" />
													</button>
													<button
														onClick={() => reorderItems(index, index + 1)}
														disabled={index === items.length - 1}
														className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded disabled:opacity-30"
													>
														<ArrowDown className="w-3 h-3 text-slate-500 dark:text-slate-400" />
													</button>
													<button
														onClick={() => removeItem(item.id)}
														className="p-1 hover:bg-red-100 dark:hover:bg-red-900/40 rounded text-slate-400 hover:text-red-500 dark:hover:text-red-400"
													>
														<Trash2 className="w-3 h-3" />
													</button>
												</div>
											</div>
											<div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
												<div className="flex items-center gap-1">
													<Clock className="w-3 h-3" />
													{format(new Date(item.startTime), 'HH:mm')} 开始
												</div>
												<div className="flex items-center gap-1">
													<Clock className="w-3 h-3" />
													{format(new Date(item.endTime), 'HH:mm')} 结束
												</div>
											</div>
											<div className="mt-2 flex items-center gap-2">
												<span className="text-xs text-slate-400 dark:text-slate-500">
													{item.type === 'hotel'
														? '休息/住宿'
														: item.type === 'meal'
															? '用餐'
															: '游玩'}
													:{' '}
													{Math.round(
														(item.endTime.getTime() -
															item.startTime.getTime()) /
															60000,
													)}
													分钟
												</span>
												<div className="flex items-center gap-1">
													<button
														onClick={() => {
															const currentDuration =
																(item.endTime.getTime() -
																	item.startTime.getTime()) /
																60000;
															if (currentDuration > 30) {
																const newEndTime = new Date(
																	item.startTime.getTime() +
																		(currentDuration - 30) * 60000,
																);
																updateItem(item.id, { endTime: newEndTime });
															}
														}}
														className="p-0.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300"
														title="减少30分钟"
													>
														<Minus className="w-3 h-3" />
													</button>
													<button
														onClick={() => {
															const currentDuration =
																(item.endTime.getTime() -
																	item.startTime.getTime()) /
																60000;
															const newEndTime = new Date(
																item.startTime.getTime() +
																	(currentDuration + 30) * 60000,
															);
															updateItem(item.id, { endTime: newEndTime });
														}}
														className="p-0.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300"
														title="增加30分钟"
													>
														<Plus className="w-3 h-3" />
													</button>
												</div>
												<div className="ml-auto">
													<button
														onClick={() =>
															updateItem(item.id, {
																forceDayStart: !item.forceDayStart,
															})
														}
														className={`p-1 px-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
															item.forceDayStart
																? 'bg-indigo-600 text-white shadow-xs'
																: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
														}`}
														title="从此开始新的一天"
													>
														<Moon className="w-3 h-3" />
														{item.forceDayStart ? '新的一天' : '分段'}
													</button>
												</div>
											</div>

											{/* Nearby Search Actions */}
											<div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
												<button
													onClick={() => {
														setSearchCenter({
															location: item.location,
															name: item.name,
														});
														setSearchCategory('restaurant');
													}}
													className="flex-1 py-1 bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-300 border border-orange-200/60 dark:border-orange-900/50 text-xs rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/60 transition-colors flex items-center justify-center gap-1 font-semibold shadow-2xs"
												>
													<Utensils className="w-3 h-3" />
													搜美食
												</button>
												<button
													onClick={() => {
														setSearchCenter({
															location: item.location,
															name: item.name,
														});
														setSearchCategory('hotel');
													}}
													className="flex-1 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900/50 text-xs rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors flex items-center justify-center gap-1 font-semibold shadow-2xs"
												>
													<Bed className="w-3 h-3" />
													搜酒店
												</button>
											</div>
										</div>

										{/* Actual route distance and travel time indicator */}
										{index < items.length - 1 && (() => {
											const nextItem = items[index + 1];
											const distance = calculateDistance(item.location, nextItem.location);
											const travelMins = calculateTravelTime(item.location, nextItem.location, config.transport);
											const distanceText = distance < 1
												? `${Math.round(distance * 1000)}m`
												: `${distance.toFixed(1)}km`;
											const transportIcon = config.transport === 'driving' ? '🚗 驾车约' : '🚌 公交/步行约';

											return (
												<div className="mt-2 mb-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 pl-1">
													<div className="w-0.5 h-4 bg-slate-200 dark:bg-slate-700 mx-3"></div>
													<span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 rounded-full font-medium shadow-2xs">
														{transportIcon} {travelMins} 分钟 ({distanceText})
													</span>
												</div>
											);
										})()}
									</div>
								);
							})}
						</div>
					)}
				</div>
			</div>

			{/* Share Modal */}
			{showShare && (
				<ShareModal
					config={config}
					items={items}
					onClose={() => setShowShare(false)}
				/>
			)}

			{/* POI Secondary Confirmation Modal */}
			{confirmingPoi && (
				<PoiConfirmModal
					poi={confirmingPoi}
					onClose={() => setConfirmingPoi(null)}
					onConfirm={(poi) => {
						addItem(poi);
						// Clear search center and unselected candidate markers on map after confirmation
						setSearchCenter(null);
						setSearchCategory('attraction');
					}}
				/>
			)}
		</div>
	);
};
