import React, { useEffect, useState } from 'react';
import { useItineraryStore } from '../../store/useItineraryStore';
import { MOCK_CITIES } from '../../data/mockData';
import { ChinaMap } from '../Map/ChinaMap';
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
} from 'lucide-react';
import { format } from 'date-fns';
import AMapLoader from '@amap/amap-jsapi-loader';
import type { Attraction } from '../../types';

export const Dashboard: React.FC<{ onBack: () => void }> = ({ onBack }) => {
	const { config, items, addItem, reorderItems, removeItem, updateItem } =
		useItineraryStore();
	const [attractions, setAttractions] = useState<Attraction[]>([]);
	const [loading, setLoading] = useState(false);
	const [searchKeyword, setSearchKeyword] = useState('');
	const [searchCategory, setSearchCategory] = useState<
		'attraction' | 'hotel' | 'restaurant'
	>('attraction');
	const [searchCenter, setSearchCenter] = useState<{
		location: [number, number];
		name: string;
	} | null>(null);

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
				config.selectedCityIds.includes(c.id)
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
					? '5A景区'
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
						(status: string, result: any) => {
							if (status === 'complete' && result.poiList) {
								const pois = result.poiList.pois;
								processPois(pois, allAttractions, selectedCities[0]); // Use first city as fallback for ID
							}
							resolve();
						}
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
						placeSearch.search(query, (status: string, result: any) => {
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
		} catch (e) {
			console.error('Failed to fetch attractions', e);
		} finally {
			setLoading(false);
		}
	};

	const processPois = (pois: any[], allAttractions: Attraction[], city: any) => {
		pois.forEach((poi: any) => {
			// Avoid duplicates by ID or Name
			if (!allAttractions.find((a) => a.id === poi.id || a.name === poi.name)) {
				// Determine level or fallback to type
				let level = '普通';
				if (poi.name.includes('5A') || (poi.tag && poi.tag.includes('5A'))) {
					level = '5A';
				} else if (poi.name.includes('4A') || (poi.tag && poi.tag.includes('4A'))) {
					level = '4A';
				} else if (poi.type) {
					// Use the first part of type as tag/level
					level = poi.type.split(';')[0];
				}

				// Determine default duration
				let duration = 90;
				if (searchCategory === 'attraction') {
					duration = level === '5A' ? 180 : level === '4A' ? 120 : 90;
				} else if (searchCategory === 'restaurant') {
					duration = 60;
				} else if (searchCategory === 'hotel') {
					duration = 0; // Usually just a stop or check-in
				}

				allAttractions.push({
					id: poi.id,
					name: poi.name,
					cityId: city.id,
					level: level,
					rating:
						poi.biz_ext && poi.biz_ext.rating ? parseFloat(poi.biz_ext.rating) : 4.5,
					suggestedDuration: duration,
					location: [poi.location.lng, poi.location.lat],
					tags: poi.type.split(';').slice(0, 3),
					price: poi.biz_ext && poi.biz_ext.cost ? parseFloat(poi.biz_ext.cost) : 0,
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
	}, [config.selectedCityIds, searchCategory, searchCenter]);

	return (
		<div className="grid grid-cols-12 gap-6 h-[calc(100vh-8rem)]">
			{/* Left Panel: Attraction Library */}
			<div className="col-span-3 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
				<div className="p-4 border-b border-slate-100 bg-slate-50">
					<div className="flex items-center gap-2 mb-3">
						<button
							onClick={onBack}
							className="p-1 hover:bg-slate-200 rounded-full transition-colors"
							title="修改配置"
						>
							<ArrowLeft className="w-5 h-5 text-slate-600" />
						</button>
						<div>
							<h3 className="font-semibold text-slate-800">推荐景点</h3>
							<p className="text-xs text-slate-500">
								{loading ? '正在加载实时数据...' : `找到 ${attractions.length} 个景点`}
							</p>
						</div>
					</div>

					{/* Category Tabs */}
					<div className="flex gap-2 mb-3">
						<button
							onClick={() => setSearchCategory('attraction')}
							className={`flex-1 py-1.5 text-sm font-medium rounded-lg flex items-center justify-center gap-1 transition-colors ${
								searchCategory === 'attraction'
									? 'bg-blue-100 text-blue-700'
									: 'bg-slate-100 text-slate-600 hover:bg-slate-200'
							}`}
						>
							<MapPin className="w-3.5 h-3.5" />
							景点
						</button>
						<button
							onClick={() => setSearchCategory('restaurant')}
							className={`flex-1 py-1.5 text-sm font-medium rounded-lg flex items-center justify-center gap-1 transition-colors ${
								searchCategory === 'restaurant'
									? 'bg-orange-100 text-orange-700'
									: 'bg-slate-100 text-slate-600 hover:bg-slate-200'
							}`}
						>
							<Utensils className="w-3.5 h-3.5" />
							美食
						</button>
						<button
							onClick={() => setSearchCategory('hotel')}
							className={`flex-1 py-1.5 text-sm font-medium rounded-lg flex items-center justify-center gap-1 transition-colors ${
								searchCategory === 'hotel'
									? 'bg-indigo-100 text-indigo-700'
									: 'bg-slate-100 text-slate-600 hover:bg-slate-200'
							}`}
						>
							<Bed className="w-3.5 h-3.5" />
							住宿
						</button>
					</div>

					{/* Search Center Indicator */}
					{searchCenter && (
						<div className="mb-3 flex items-center justify-between bg-blue-50 px-3 py-2 rounded-lg text-xs text-blue-700 border border-blue-100">
							<div className="flex items-center gap-1 truncate">
								<MapPin className="w-3 h-3" />
								<span className="truncate">附近: {searchCenter.name}</span>
							</div>
							<button
								onClick={() => setSearchCenter(null)}
								className="text-blue-500 hover:text-blue-700 whitespace-nowrap ml-2"
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
							className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
						/>
						<Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
						<button
							onClick={() => doSearch(searchKeyword)}
							className="absolute right-1 top-1 bottom-1 px-3 bg-blue-50 text-blue-600 rounded text-xs font-medium hover:bg-blue-100"
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
					) : (
						attractions.map((attraction) => (
							<div
								key={attraction.id}
								className="group bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
							>
								<div className="h-32 overflow-hidden relative">
									<img
										src={attraction.imageUrl}
										alt={attraction.name}
										className="w-full h-full object-cover"
									/>
									<div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-orange-600 flex items-center gap-1">
										<Star className="w-3 h-3 fill-current" />
										{attraction.rating}
									</div>
								</div>
								<div className="p-3">
									<div className="flex justify-between items-start mb-2">
										<div>
											<h4 className="font-bold text-slate-800">{attraction.name}</h4>
											<div className="flex gap-2 mt-1 flex-wrap">
												<span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
													{attraction.level}
												</span>
												{attraction.price > 0 && (
													<span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
														¥{attraction.price}
													</span>
												)}
											</div>
										</div>
										<button
											onClick={() => addItem(attraction)}
											className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition-colors"
										>
											<Plus className="w-4 h-4" />
										</button>
									</div>
								</div>
							</div>
						))
					)}
				</div>
			</div>

			{/* Center Panel: Map */}
			<div className="col-span-6 bg-slate-200 rounded-xl border border-slate-300 relative overflow-hidden shadow-inner">
				<ChinaMap />
			</div>

			{/* Right Panel: Timeline */}
			<div className="col-span-3 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
				<div className="p-4 border-b border-slate-100 bg-slate-50">
					<h3 className="font-semibold text-slate-800">行程安排</h3>
					<p className="text-xs text-slate-500 mt-1">
						{format(config.startDate, 'yyyy-MM-dd')} 开始 · {config.duration} 天
					</p>
				</div>
				<div className="flex-1 overflow-y-auto p-4">
					{items.length === 0 ? (
						<div className="text-center py-10 text-slate-400">
							<p>暂无行程</p>
							<p className="text-sm mt-2">从左侧添加景点开始规划</p>
						</div>
					) : (
						<div className="space-y-0 relative">
							{/* Vertical line */}
							<div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-200" />

							{items.map((item, index) => {
								const isNewDay =
									index === 0 ||
									item.startTime.getDate() !== items[index - 1].startTime.getDate();
								return (
									<div key={item.id} className="relative pl-10 pb-6 last:pb-0 group">
										{isNewDay && (
											<div className="absolute -left-2 top-[-10px] bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full border border-blue-200 z-10">
												第{' '}
												{Math.ceil(
													(item.startTime.getTime() - config.startDate.getTime()) /
														(1000 * 60 * 60 * 24)
												) + 1}{' '}
												天
											</div>
										)}
										{/* Dot */}
										{/* Dot */}
										<div
											className={`absolute left-[11px] top-3 w-3 h-3 rounded-full border-2 border-white ring-1 ${
												item.type === 'hotel'
													? 'bg-indigo-600 ring-indigo-100'
													: item.type === 'meal'
													? 'bg-orange-500 ring-orange-100'
													: 'bg-blue-600 ring-blue-100'
											}`}
										/>
										<div
											className={`p-3 rounded-lg border transition-colors ${
												item.type === 'hotel'
													? 'bg-indigo-50 border-indigo-100 group-hover:border-indigo-300'
													: item.type === 'meal'
													? 'bg-orange-50 border-orange-100 group-hover:border-orange-300'
													: 'bg-slate-50 border-slate-200 group-hover:border-blue-300'
											}`}
										>
											<div className="flex justify-between items-start">
												<h4
													className={`font-bold ${
														item.type === 'hotel'
															? 'text-indigo-900'
															: item.type === 'meal'
															? 'text-orange-900'
															: 'text-slate-800'
													}`}
												>
													{item.name}
												</h4>
												<div className="flex gap-1">
													<button
														onClick={() => reorderItems(index, index - 1)}
														disabled={index === 0}
														className="p-1 hover:bg-black/5 rounded disabled:opacity-30"
													>
														<ArrowUp className="w-3 h-3 text-slate-500" />
													</button>
													<button
														onClick={() => reorderItems(index, index + 1)}
														disabled={index === items.length - 1}
														className="p-1 hover:bg-black/5 rounded disabled:opacity-30"
													>
														<ArrowDown className="w-3 h-3 text-slate-500" />
													</button>
													<button
														onClick={() => removeItem(item.id)}
														className="p-1 hover:bg-red-100 rounded text-slate-400 hover:text-red-500"
													>
														<Trash2 className="w-3 h-3" />
													</button>
												</div>
											</div>
											<div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
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
												<span className="text-xs text-slate-400">
													{item.type === 'hotel'
														? '休息/住宿'
														: item.type === 'meal'
														? '用餐'
														: '游玩'}
													:{' '}
													{Math.round(
														(item.endTime.getTime() - item.startTime.getTime()) / 60000
													)}
													分钟
												</span>
												<div className="flex items-center gap-1">
													<button
														onClick={() => {
															const currentDuration =
																(item.endTime.getTime() - item.startTime.getTime()) / 60000;
															if (currentDuration > 30) {
																const newEndTime = new Date(
																	item.startTime.getTime() + (currentDuration - 30) * 60000
																);
																updateItem(item.id, { endTime: newEndTime });
															}
														}}
														className="p-0.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-600"
														title="减少30分钟"
													>
														<Minus className="w-3 h-3" />
													</button>
													<button
														onClick={() => {
															const currentDuration =
																(item.endTime.getTime() - item.startTime.getTime()) / 60000;
															const newEndTime = new Date(
																item.startTime.getTime() + (currentDuration + 30) * 60000
															);
															updateItem(item.id, { endTime: newEndTime });
														}}
														className="p-0.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-600"
														title="增加30分钟"
													>
														<Plus className="w-3 h-3" />
													</button>
												</div>
												<div className="ml-auto">
													<button
														onClick={() =>
															updateItem(item.id, { forceDayStart: !item.forceDayStart })
														}
														className={`p-1 rounded text-xs flex items-center gap-1 ${
															item.forceDayStart
																? 'bg-indigo-100 text-indigo-600'
																: 'bg-slate-100 text-slate-500 hover:bg-slate-200'
														}`}
														title="从此开始新的一天"
													>
														<Moon className="w-3 h-3" />
														{item.forceDayStart ? '新的一天' : '分段'}
													</button>
												</div>
											</div>

											{/* Nearby Search Actions */}
											<div className="mt-2 pt-2 border-t border-slate-100 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
												<button
													onClick={() => {
														setSearchCenter({ location: item.location, name: item.name });
														setSearchCategory('restaurant');
													}}
													className="flex-1 py-1 bg-orange-50 text-orange-600 text-xs rounded hover:bg-orange-100 flex items-center justify-center gap-1"
												>
													<Utensils className="w-3 h-3" />
													搜美食
												</button>
												<button
													onClick={() => {
														setSearchCenter({ location: item.location, name: item.name });
														setSearchCategory('hotel');
													}}
													className="flex-1 py-1 bg-indigo-50 text-indigo-600 text-xs rounded hover:bg-indigo-100 flex items-center justify-center gap-1"
												>
													<Bed className="w-3 h-3" />
													搜酒店
												</button>
											</div>
										</div>

										{/* Travel time indicator if next item exists and is on the same day */}
										{index < items.length - 1 &&
											items[index + 1].startTime.getDate() === item.endTime.getDate() && (
												<div className="mt-2 mb-2 text-xs text-slate-500 flex items-center gap-1 pl-1">
													<div className="w-0.5 h-4 bg-slate-200 mx-3"></div>
													<span className="bg-slate-100 px-2 py-0.5 rounded-full">
														🚗 路程约{' '}
														{Math.round(
															(items[index + 1].startTime.getTime() - item.endTime.getTime()) /
																60000
														)}{' '}
														分钟
													</span>
												</div>
											)}
									</div>
								);
							})}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
