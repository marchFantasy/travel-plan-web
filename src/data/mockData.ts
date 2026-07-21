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
	// Jiangxi (江西)
	{
		id: 'jdz',
		name: '景德镇',
		province: '江西',
		center: [117.2146, 29.2926],
		description: '千年瓷都，陶瓷艺术与文艺慢生活小镇。',
	},
	{
		id: 'wy',
		name: '婺源',
		province: '江西',
		center: [117.861, 29.248],
		description: '中国最美乡村，徽派建筑与梯田晒秋。',
	},
	{
		id: 'sqs',
		name: '三清山',
		province: '江西',
		center: [118.069, 28.908],
		description: '道教名山，奇峰怪石与高空云海栈道。',
	},
	{
		id: 'nc',
		name: '南昌',
		province: '江西',
		center: [115.8579, 28.6829],
		description: '英雄城，滕王阁，赣江夜景与网红美食。',
	},
	{
		id: 'ls-jx',
		name: '庐山',
		province: '江西',
		center: [115.986, 29.559],
		description: '人文圣山，避暑胜地，匡庐奇秀。',
	},
	// Hunan (湖南)
	{
		id: 'cs',
		name: '长沙',
		province: '湖南',
		center: [112.9388, 28.2282],
		description: '星城，娱乐美食之都，橘子洲与岳麓山。',
	},
	{
		id: 'zjj',
		name: '张家界',
		province: '湖南',
		center: [110.4792, 29.1174],
		description: '奇峰三千，天门山与阿凡达悬浮山取景地。',
	},
	{
		id: 'fhgc',
		name: '凤凰古城',
		province: '湖南',
		center: [109.601, 27.948],
		description: '湘西边城风情，吊脚楼与沱江璀璨夜景。',
	},
	{
		id: 'cz',
		name: '郴州',
		province: '湖南',
		center: [113.0149, 25.7705],
		description: '雾漫小东江，高椅岭丹霞地貌。',
	},
	{
		id: 'hy',
		name: '衡阳',
		province: '湖南',
		center: [112.572, 26.895],
		description: '五岳之南岳衡山，宗教祈福与祝融峰。',
	},
	{
		id: 'yy',
		name: '岳阳',
		province: '湖南',
		center: [113.132, 29.370],
		description: '洞庭天下水，岳阳天下楼。',
	},
	// Shaanxi
	{
		id: 'xa',
		name: '西安',
		province: '陕西',
		center: [108.9398, 34.3416],
		description: '十三朝古都，兵马俑故乡。',
	},
	// Sichuan & Chongqing
	{
		id: 'cd',
		name: '成都',
		province: '四川',
		center: [104.0668, 30.5728],
		description: '天府之国，美食与熊猫。',
	},
	{
		id: 'jzg',
		name: '九寨沟',
		province: '四川',
		center: [103.9186, 33.26],
		description: '童话世界，九寨归来不看水。',
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
	{
		id: 'zh',
		name: '珠海',
		province: '广东',
		center: [113.5767, 22.2707],
		description: '百岛之市，情侣路与长隆海洋王国。',
	},
	// Zhejiang
	{
		id: 'hz',
		name: '杭州',
		province: '浙江',
		center: [120.1551, 30.2741],
		description: '人间天堂，西湖美景。',
	},
	{
		id: 'nb',
		name: '宁波',
		province: '浙江',
		center: [121.5497, 29.8683],
		description: '书藏古今，港通天下，天一阁与东钱湖。',
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
	{
		id: 'yz',
		name: '扬州',
		province: '江苏',
		center: [119.4129, 32.3942],
		description: '烟花三月下扬州，瘦西湖与淮扬美食。',
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
	{
		id: 'dl',
		name: '大理',
		province: '云南',
		center: [100.2257, 25.5894],
		description: '风花雪月，苍山洱海与双廊古镇。',
	},
	{
		id: 'xgll',
		name: '香格里拉',
		province: '云南',
		center: [99.7065, 27.8268],
		description: '心中的日月，独克宗古城与普达措。',
	},
	// Fujian
	{
		id: 'xm',
		name: '厦门',
		province: '福建',
		center: [118.0894, 24.4798],
		description: '海上花园，鼓浪屿。',
	},
	{
		id: 'qz',
		name: '泉州',
		province: '福建',
		center: [118.6757, 24.8741],
		description: '世遗之城，半城烟火半城仙。',
	},
	// Hainan
	{
		id: 'sy',
		name: '三亚',
		province: '海南',
		center: [109.5119, 18.2528],
		description: '热带海滨度假胜地，阳光沙滩与蜈支洲岛。',
	},
	// Hubei
	{
		id: 'wh-hb',
		name: '武汉',
		province: '湖北',
		center: [114.3055, 30.5928],
		description: '江城，黄鹤楼，东湖樱花与热干面。',
	},
	// Shandong
	{
		id: 'qd',
		name: '青岛',
		province: '山东',
		center: [120.3826, 36.0671],
		description: '黄海明珠，啤酒之都与红瓦绿树碧海蓝天。',
	},
	{
		id: 'wh-sd',
		name: '威海',
		province: '山东',
		center: [122.1204, 37.5131],
		description: '最美沿海公路与成山头。',
	},
	// Heilongjiang
	{
		id: 'hrb',
		name: '哈尔滨',
		province: '黑龙江',
		center: [126.5349, 45.8038],
		description: '冰城夏都，冰雪大世界与欧式风情。',
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
	// Guangxi
	{
		id: 'gl',
		name: '桂林',
		province: '广西',
		center: [110.2902, 25.2736],
		description: '山水甲天下，阳朔西街。',
	},
	{
		id: 'bh',
		name: '北海',
		province: '广西',
		center: [109.1193, 21.4733],
		description: '银滩明珠，涠洲岛火山海景。',
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
	{
		id: 'yl',
		name: '伊犁',
		province: '新疆',
		center: [81.3241, 43.9169],
		description: '塞外江南，草原花海与那拉提。',
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
