import React from 'react';
import type { Attraction } from '../../types';
import {
	X,
	MapPin,
	Star,
	Clock,
	Plus,
	Bed,
	Utensils,
	Tag,
	DollarSign,
} from 'lucide-react';

interface PoiConfirmModalProps {
	poi: Attraction | null;
	onClose: () => void;
	onConfirm: (poi: Attraction) => void;
}

export const PoiConfirmModal: React.FC<PoiConfirmModalProps> = ({
	poi,
	onClose,
	onConfirm,
}) => {
	if (!poi) return null;

	const isHotel = poi.category === 'hotel';
	const isRestaurant = poi.category === 'restaurant';

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
			<div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">
				{/* Image Header */}
				<div className="relative h-48 bg-slate-100 overflow-hidden">
					<img
						src={poi.imageUrl}
						alt={poi.name}
						className="w-full h-full object-cover"
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
					<button
						onClick={onClose}
						className="absolute top-3 right-3 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors backdrop-blur-xs"
					>
						<X className="w-5 h-5" />
					</button>
					<div className="absolute bottom-3 left-4 right-4 text-white">
						<div className="flex items-center gap-2 mb-1">
							<span
								className={`px-2 py-0.5 rounded text-xs font-semibold flex items-center gap-1 ${
									isHotel
										? 'bg-indigo-600 text-white'
										: isRestaurant
										? 'bg-orange-500 text-white'
										: 'bg-blue-600 text-white'
								}`}
							>
								{isHotel ? (
									<>
										<Bed className="w-3 h-3" /> 住宿酒店
									</>
								) : isRestaurant ? (
									<>
										<Utensils className="w-3 h-3" /> 美食餐饮
									</>
								) : (
									<>
										<MapPin className="w-3 h-3" /> 游玩景点
									</>
								)}
							</span>
							{poi.level && (
								<span className="bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded text-xs">
									{poi.level}
								</span>
							)}
						</div>
						<h3 className="text-xl font-bold truncate">{poi.name}</h3>
					</div>
				</div>

				{/* Content */}
				<div className="p-5 space-y-4">
					<div className="grid grid-cols-3 gap-3">
						<div className="p-3 bg-slate-50 rounded-xl text-center border border-slate-100">
							<span className="text-xs text-slate-500 block mb-1 flex items-center justify-center gap-1">
								<Star className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
								评分
							</span>
							<span className="font-bold text-slate-800 text-sm">
								{poi.rating || 4.5} / 5.0
							</span>
						</div>
						<div className="p-3 bg-slate-50 rounded-xl text-center border border-slate-100">
							<span className="text-xs text-slate-500 block mb-1 flex items-center justify-center gap-1">
								<Clock className="w-3.5 h-3.5 text-blue-500" />
								{isHotel ? '建议入住' : '建议时长'}
							</span>
							<span className="font-bold text-slate-800 text-sm">
								{isHotel
									? '今晚过夜'
									: isRestaurant
									? '60 分钟 (1小时)'
									: `${poi.suggestedDuration || 120} 分钟`}
							</span>
						</div>
						<div className="p-3 bg-slate-50 rounded-xl text-center border border-slate-100">
							<span className="text-xs text-slate-500 block mb-1 flex items-center justify-center gap-1">
								<DollarSign className="w-3.5 h-3.5 text-green-500" />
								参考人均
							</span>
							<span className="font-bold text-slate-800 text-sm">
								{poi.price && poi.price > 0 ? `¥${poi.price}` : '免费/现场'}
							</span>
						</div>
					</div>

					{poi.tags && poi.tags.length > 0 && (
						<div className="flex items-center gap-1.5 flex-wrap">
							<Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
							{poi.tags.map((tag, idx) => (
								<span
									key={idx}
									className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md"
								>
									{tag}
								</span>
							))}
						</div>
					)}

					<div className="flex items-start gap-2 p-3 bg-blue-50/60 rounded-xl text-xs text-blue-700 border border-blue-100">
						<MapPin className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
						<div>
							<span className="font-semibold block mb-0.5">经纬度坐标</span>
							<span>
								[{poi.location[0].toFixed(4)}, {poi.location[1].toFixed(4)}]
							</span>
						</div>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
					<button
						onClick={onClose}
						className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
					>
						取消
					</button>
					<button
						onClick={() => {
							onConfirm(poi);
							onClose();
						}}
						className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
					>
						<Plus className="w-4 h-4" />
						添加到行程安排
					</button>
				</div>
			</div>
		</div>
	);
};
