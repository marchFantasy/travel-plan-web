import type { City, Attraction } from '../types';

export const MOCK_CITIES: City[] = [
	// Beijing
	{
		id: 'bj',
		name: '北京',
		province: '北京',
		center: [116.4074, 39.9042],
		description: '中国的首都，政治、文化中心。',
	},
	// Shanghai
	{
		id: 'sh',
		name: '上海',
		province: '上海',
		center: [121.4737, 31.2304],
		description: '国际大都市，现代与传统的融合。',
	},
	// Shaanxi
	{
		id: 'xa',
		name: '西安',
		province: '陕西',
		center: [108.9398, 34.3416],
		description: '十三朝古都，兵马俑故乡。',
	},
	// Sichuan
	{
		id: 'cd',
		name: '成都',
		province: '四川',
		center: [104.0668, 30.5728],
		description: '天府之国，美食与熊猫。',
	},
	{
		id: 'cq',
		name: '重庆',
		province: '重庆',
		center: [106.5516, 29.563],
		description: '山城，火锅之都，8D魔幻城市。',
	},
	// Guangdong
	{
		id: 'gz',
		name: '广州',
		province: '广东',
		center: [113.2644, 23.1291],
		description: '羊城，早茶文化，千年商都。',
	},
	{
		id: 'sz',
		name: '深圳',
		province: '广东',
		center: [114.0579, 22.5431],
		description: '科技之都，改革开放前沿。',
	},
	// Zhejiang
	{
		id: 'hz',
		name: '杭州',
		province: '浙江',
		center: [120.1551, 30.2741],
		description: '人间天堂，西湖美景。',
	},
	// Jiangsu
	{
		id: 'nj',
		name: '南京',
		province: '江苏',
		center: [118.7969, 32.0603],
		description: '六朝古都，历史名城。',
	},
	{
		id: 'sz-js',
		name: '苏州',
		province: '江苏',
		center: [120.5853, 31.2989],
		description: '园林之城，东方威尼斯。',
	},
	// Yunnan
	{
		id: 'km',
		name: '昆明',
		province: '云南',
		center: [102.8329, 24.8801],
		description: '春城，四季如春。',
	},
	{
		id: 'lj',
		name: '丽江',
		province: '云南',
		center: [100.23, 26.855],
		description: '古城，雪山，浪漫之都。',
	},
	// Fujian
	{
		id: 'xm',
		name: '厦门',
		province: '福建',
		center: [118.0894, 24.4798],
		description: '海上花园，鼓浪屿。',
	},
];

export const MOCK_ATTRACTIONS: Attraction[] = [
	// Keep existing mock attractions just in case, though we use real data now
	{
		id: 'bj-1',
		name: '故宫博物院',
		cityId: 'bj',
		level: '5A',
		rating: 4.9,
		suggestedDuration: 240,
		location: [116.397, 39.918],
		tags: ['历史', '文化', '建筑'],
		price: 60,
		imageUrl:
			'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
	},
	// ... (We can keep minimal mock data or remove it since we use PlaceSearch)
];
