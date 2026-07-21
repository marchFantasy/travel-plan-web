import React, { useState } from 'react';
import { format } from 'date-fns';
import {
	X,
	Download,
	Printer,
	Copy,
	Check,
	MapPin,
	Calendar,
	Clock,
	Car,
	Bed,
	ExternalLink,
	Sparkles,
} from 'lucide-react';
import type { ItineraryItem, TravelConfig } from '../../types';
import { DAY_COLORS } from '../Map/ChinaMap';
import { getLogicalDate } from '../../utils/dateUtils';

interface ShareModalProps {
	config: TravelConfig;
	items: ItineraryItem[];
	onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
	config,
	items,
	onClose,
}) => {
	const [copied, setCopied] = useState(false);

	// Group items by logical day
	const dayGroups: { [key: string]: ItineraryItem[] } = {};
	items.forEach((item) => {
		const dateStr = format(getLogicalDate(item), 'yyyy-MM-dd');
		if (!dayGroups[dateStr]) {
			dayGroups[dateStr] = [];
		}
		dayGroups[dateStr].push(item);
	});

	const sortedDays = Object.keys(dayGroups).sort(
		(a, b) => new Date(a).getTime() - new Date(b).getTime()
	);

	// Generate AMap Static Map URL
	const getStaticMapUrl = () => {
		if (items.length === 0) return '';
		const key = 'fef28102a75b176e9ded6a88405f5934';
		
		// Take up to 10 points for static map markers to prevent URL length limits
		const markerPoints = items.slice(0, 10).map((item, idx) => {
			const dateStr = format(getLogicalDate(item), 'yyyy-MM-dd');
			const dayIdx = Math.max(0, sortedDays.indexOf(dateStr));
			const color = DAY_COLORS[dayIdx % DAY_COLORS.length].replace('#', '0x');
			return `mid,${color},${idx + 1}:${item.location[0].toFixed(5)},${item.location[1].toFixed(5)}`;
		});

		const pathPoints = items
			.slice(0, 10)
			.map((item) => `${item.location[0].toFixed(5)},${item.location[1].toFixed(5)}`)
			.join(';');

		const markers = markerPoints.join('|');
		const path = `5,0x2563eb,1,0.8:${pathPoints}`;

		return `https://restapi.amap.com/v3/staticmap?key=${key}&size=750*340&markers=${markers}&paths=${path}`;
	};

	// Generate AMap Navigation URL
	const getAmapNavUrl = () => {
		if (items.length === 0) return '#';
		const dest = items[items.length - 1];
		const vias = items
			.slice(0, Math.min(items.length - 1, 3))
			.map((i) => `${i.location[0]},${i.location[1]},${i.name}`)
			.join('|');
		return `https://uri.amap.com/navigation?to=${dest.location[0]},${dest.location[1]},${dest.name}&via=${vias}&mode=car&callnative=1`;
	};

	// Generate Plain Text for Copying
	const generateTextPlan = () => {
		let text = `🧭 【定制旅游路书】 ${format(config.startDate, 'yyyy-MM-dd')} 出发（${config.duration}天行程）\n`;
		text += `🚗 交通方式: ${config.transport === 'driving' ? '自驾' : '公共交通'} | 同行人群: ${config.travelers.join(', ')}\n`;
		text += `------------------------------------\n\n`;

		sortedDays.forEach((date, index) => {
			const dayItems = dayGroups[date];
			text += `📅 【第 ${index + 1} 天】 ${date}\n`;

			dayItems.forEach((item) => {
				const time = format(new Date(item.startTime), 'HH:mm');
				const typeIcon =
					item.type === 'hotel' ? '🏨 [住宿]' : item.type === 'meal' ? '🍽️ [餐饮]' : '📍 [景点]';
				text += `  • ${time} ${typeIcon} ${item.name}\n`;
			});

			// Find hotel for tonight
			const hotel = dayItems.find((i) => i.type === 'hotel');
			if (hotel) {
				text += `  🌙 今晚住宿：${hotel.name}\n`;
			} else {
				text += `  🌙 建议住宿：当天最后一个景点附近\n`;
			}
			text += `\n`;
		});

		return text;
	};

	// Handle Copying Text
	const handleCopyText = () => {
		navigator.clipboard.writeText(generateTextPlan());
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	// Handle Downloading Independent HTML File
	const handleDownloadHtml = () => {
		const staticMap = getStaticMapUrl();

		let dayCardsHtml = '';
		sortedDays.forEach((date, index) => {
			const dayItems = dayGroups[date];
			const dayColor = DAY_COLORS[index % DAY_COLORS.length];
			const hotel = dayItems.find((i) => i.type === 'hotel');

			let itemsHtml = '';
			dayItems.forEach((item) => {
				const startTime = format(new Date(item.startTime), 'HH:mm');
				const endTime = format(new Date(item.endTime), 'HH:mm');
				const tag =
					item.type === 'hotel'
						? '<span style="background:#e0e7ff;color:#3730a3;padding:2px 8px;border-radius:12px;font-size:12px;">住宿</span>'
						: item.type === 'meal'
						? '<span style="background:#ffedd5;color:#9a3412;padding:2px 8px;border-radius:12px;font-size:12px;">美食</span>'
						: '<span style="background:#dbeafe;color:#1e40af;padding:2px 8px;border-radius:12px;font-size:12px;">景点</span>';

				itemsHtml += `
					<div style="display:flex;align-items:flex-start;padding:12px;background:#f8fafc;border-radius:10px;margin-bottom:8px;border-left:4px solid ${dayColor};">
						<div style="font-weight:bold;color:#475569;min-width:100px;font-size:14px;">${startTime} - ${endTime}</div>
						<div style="flex:1;">
							<div style="font-weight:bold;font-size:15px;color:#1e293b;">${item.name}</div>
							<div style="margin-top:4px;">${tag}</div>
						</div>
					</div>
				`;
			});

			dayCardsHtml += `
				<div style="background:#ffffff;border-radius:14px;padding:20px;margin-bottom:20px;box-shadow:0 2px 10px rgba(0,0,0,0.05);border:1px solid #e2e8f0;">
					<div style="display:inline-block;background:${dayColor};color:#ffffff;padding:4px 14px;border-radius:20px;font-weight:bold;font-size:14px;margin-bottom:14px;">
						第 ${index + 1} 天 (${date})
					</div>
					${itemsHtml}
					<div style="margin-top:12px;padding:10px 14px;background:#f1f5f9;border-radius:8px;font-size:13px;color:#334155;display:flex;align-items:center;">
						🏨 <strong>夜间住宿情况：</strong> &nbsp;${hotel ? hotel.name : '建议选择当日游玩终点周边酒店入住'}
					</div>
				</div>
			`;
		});

		const fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>定制旅行路书 - ${format(config.startDate, 'yyyy-MM-dd')}</title>
	<style>
		body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #f1f5f9; color: #1e293b; margin: 0; padding: 20px; }
		.container { max-width: 800px; margin: 0 auto; }
		.header { background: linear-gradient(135deg, #2563eb, #4f46e5); color: white; padding: 30px; border-radius: 16px; margin-bottom: 24px; shadow: 0 10px 25px rgba(37,99,235,0.2); }
		.header h1 { margin: 0 0 10px 0; font-size: 26px; }
		.header p { margin: 4px 0; opacity: 0.9; font-size: 14px; }
		.map-box { background: white; border-radius: 16px; overflow: hidden; margin-bottom: 24px; border: 1px solid #e2e8f0; }
		.map-img { width: 100%; height: auto; display: block; }
		.footer { text-align: center; font-size: 12px; color: #94a3b8; margin-top: 30px; }
		@media print {
			body { background: white; padding: 0; }
			.container { max-width: 100%; }
		}
	</style>
</head>
<body>
	<div class="container">
		<div class="header">
			<h1>🗺️ 定制旅游路书指南</h1>
			<p>📅 出发日期：${format(config.startDate, 'yyyy-MM-dd')} | 出行时长：${config.duration} 天</p>
			<p>🚗 交通方式：${config.transport === 'driving' ? '自驾出游' : '公共交通（高铁/飞机）'}</p>
		</div>

		${staticMap ? `<div class="map-box"><img src="${staticMap}" class="map-img" alt="路线地图"/></div>` : ''}

		${dayCardsHtml}

		<div class="footer">
			由 智能旅游规划助手 生成 · 祝您旅途愉快！
		</div>
	</div>
</body>
</html>`;

		const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `旅行路书_${format(config.startDate, 'yyyyMMdd')}.html`;
		a.click();
		URL.revokeObjectURL(url);
	};

	// Handle Print PDF
	const handlePrint = () => {
		window.print();
	};

	return (
		<div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
			<div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
				{/* Header */}
				<div className="bg-linear-to-r from-blue-600 to-indigo-600 p-5 text-white flex justify-between items-center print:hidden">
					<div className="flex items-center gap-2">
						<Sparkles className="w-5 h-5 text-amber-300" />
						<div>
							<h3 className="text-xl font-bold">行程路书与路线明细</h3>
							<p className="text-xs text-blue-100 mt-0.5">
								包含每日游玩景点、交通连线与夜间住宿安排
							</p>
						</div>
					</div>
					<button
						onClick={onClose}
						className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* Scrollable Content */}
				<div className="flex-1 overflow-y-auto p-6 space-y-6">
					{/* Travel Meta */}
					<div className="grid grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
						<div className="flex items-center gap-2 text-slate-700">
							<Calendar className="w-4 h-4 text-blue-600" />
							<div>
								<span className="text-slate-400 block">出发日期</span>
								<span className="font-bold">
									{format(config.startDate, 'yyyy-MM-dd')} ({config.duration}天)
								</span>
							</div>
						</div>
						<div className="flex items-center gap-2 text-slate-700">
							<Car className="w-4 h-4 text-indigo-600" />
							<div>
								<span className="text-slate-400 block">交通方式</span>
								<span className="font-bold">
									{config.transport === 'driving' ? '自驾出游' : '公共交通'}
								</span>
							</div>
						</div>
						<div className="flex items-center gap-2 text-slate-700">
							<Bed className="w-4 h-4 text-emerald-600" />
							<div>
								<span className="text-slate-400 block">已规划节点</span>
								<span className="font-bold">{items.length} 个打卡点</span>
							</div>
						</div>
					</div>

					{/* Route Map Preview */}
					{items.length > 0 && (
						<div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm relative group">
							<img
								src={getStaticMapUrl()}
								alt="游玩路线与地图展示"
								className="w-full h-48 object-cover bg-slate-100"
								onError={(e) => {
									// Fallback if static map fails to load
									(e.target as HTMLElement).style.display = 'none';
								}}
							/>
							<div className="p-3 bg-slate-900/90 text-white flex justify-between items-center text-xs">
								<span className="flex items-center gap-1.5 font-medium">
									<MapPin className="w-3.5 h-3.5 text-red-400" />
									地图路线概述 (按天标注打卡点)
								</span>
								<a
									href={getAmapNavUrl()}
									target="_blank"
									rel="noreferrer"
									className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
								>
									高德地图导航
									<ExternalLink className="w-3 h-3" />
								</a>
							</div>
						</div>
					)}

					{/* Day-by-day Breakdown */}
					<div className="space-y-4">
						<h4 className="font-bold text-slate-800 flex items-center gap-2 text-sm border-b pb-2">
							<Clock className="w-4 h-4 text-blue-600" />
							逐日行程安排与住宿分布
						</h4>

						{sortedDays.map((date, index) => {
							const dayItems = dayGroups[date];
							const dayColor = DAY_COLORS[index % DAY_COLORS.length];
							const hotel = dayItems.find((i) => i.type === 'hotel');

							return (
								<div
									key={date}
									className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3"
								>
									<div className="flex items-center justify-between">
										<span
											className="text-xs font-bold text-white px-3 py-1 rounded-full shadow-2xs"
											style={{ backgroundColor: dayColor }}
										>
											第 {index + 1} 天 · {date}
										</span>
										<span className="text-xs text-slate-400">
											{dayItems.length} 个游玩与打卡点
										</span>
									</div>

									{/* Item List */}
									<div className="space-y-2">
										{dayItems.map((item) => (
											<div
												key={item.id}
												className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border-l-4 text-xs"
												style={{ borderLeftColor: dayColor }}
											>
												<div className="flex items-center gap-3">
													<span className="font-mono text-slate-500 font-semibold min-w-[42px]">
														{format(new Date(item.startTime), 'HH:mm')}
													</span>
													<span className="font-bold text-slate-800">
														{item.name}
													</span>
												</div>
												<span
													className={`px-2 py-0.5 rounded text-[11px] font-medium ${
														item.type === 'hotel'
															? 'bg-indigo-100 text-indigo-700'
															: item.type === 'meal'
															? 'bg-orange-100 text-orange-700'
															: 'bg-blue-100 text-blue-700'
													}`}
												>
													{item.type === 'hotel'
														? '住宿'
														: item.type === 'meal'
														? '餐饮'
														: '景点'}
												</span>
											</div>
										))}
									</div>

									{/* Accommodation Note */}
									<div className="flex items-center gap-2 text-xs bg-indigo-50/80 text-indigo-900 p-2.5 rounded-lg border border-indigo-100">
										<Bed className="w-4 h-4 text-indigo-600 shrink-0" />
										<span>
											<strong>今晚住宿：</strong>
											{hotel ? (
												<span className="font-semibold text-indigo-700 ml-1">
													{hotel.name}
												</span>
											) : (
												<span className="text-slate-500 ml-1">
													建议选择【
													{dayItems[dayItems.length - 1]?.name || '热门景区'}
													】附近酒店住宿
												</span>
											)}
										</span>
									</div>
								</div>
							);
						})}
					</div>
				</div>

				{/* Footer Action Buttons */}
				<div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap gap-2 justify-between items-center print:hidden">
					<button
						onClick={handleCopyText}
						className="px-3.5 py-2 text-xs font-medium bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
					>
						{copied ? (
							<>
								<Check className="w-3.5 h-3.5 text-green-600" />
								<span>已复制行程文本</span>
							</>
						) : (
							<>
								<Copy className="w-3.5 h-3.5 text-slate-500" />
								<span>复制行程文本</span>
							</>
						)}
					</button>

					<div className="flex gap-2">
						<button
							onClick={handlePrint}
							className="px-4 py-2 text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors flex items-center gap-1.5"
						>
							<Printer className="w-3.5 h-3.5" />
							<span>打印 / 保存 PDF</span>
						</button>
						<button
							onClick={handleDownloadHtml}
							className="px-4 py-2 text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
						>
							<Download className="w-3.5 h-3.5" />
							<span>导出 HTML 路书</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};
