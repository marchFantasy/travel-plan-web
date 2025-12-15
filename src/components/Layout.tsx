import React from 'react';
import { Map, Calendar, Settings } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	return (
		<div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
			<header className="bg-white border-b border-slate-200 sticky top-0 z-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<div className="bg-blue-600 p-2 rounded-lg">
							<Map className="w-6 h-6 text-white" />
						</div>
						<span className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-600">
							ChinaTravel
						</span>
					</div>
					<nav className="flex gap-4">
						<button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
							<Calendar className="w-5 h-5 text-slate-600" />
						</button>
						<button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
							<Settings className="w-5 h-5 text-slate-600" />
						</button>
					</nav>
				</div>
			</header>
			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{children}
			</main>
		</div>
	);
};
