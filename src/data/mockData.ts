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
	// Anhui
	{
		id: 'hf',
		name: '合肥',
		province: '安徽',
		center: [117.2272, 31.8206],
		description: '大湖名城，创新高地。',
	},
	{
		id: 'hs',
		name: '黄山',
		province: '安徽',
		center: [118.3375, 29.7147],
		description: '天下第一奇山，徽州文化。',
	},
	// Xinjiang
	{
		id: 'wlmq',
		name: '乌鲁木齐',
		province: '新疆',
		center: [87.6168, 43.8256],
		description: '亚心之都，西域风情。',
	},
	{
		id: 'ks',
		name: '喀什',
		province: '新疆',
		center: [75.9898, 39.4704],
		description: '丝路明珠，古城风貌。',
	},
	// Tibet
	{
		id: 'ls',
		name: '拉萨',
		province: '西藏',
		center: [91.1409, 29.6456],
		description: '日光城，布达拉宫，信仰之地。',
	},
	{
		id: 'lz',
		name: '林芝',
		province: '西藏',
		center: [94.3615, 29.6491],
		description: '西藏江南，桃花源，雅鲁藏布大峡谷。',
	},
	// Hunan
	{
		id: 'cs',
		name: '长沙',
		province: '湖南',
		center: [112.9388, 28.2282],
		description: '星城，娱乐之都，美食圣地。',
	},
	{
		id: 'zjj',
		name: '张家界',
		province: '湖南',
		center: [110.4792, 29.1174],
		description: '奇峰三千，阿凡达取景地。',
	},
	// Guangxi
	{
		id: 'gl',
		name: '桂林',
		province: '广西',
		center: [110.2902, 25.2736],
		description: '山水甲天下，阳朔西街。',
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
