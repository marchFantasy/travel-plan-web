import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Wizard } from './components/Planner/Wizard';
import { Dashboard } from './components/Planner/Dashboard';
import { useSettingsStore } from './store/useSettingsStore';
import { useItineraryStore } from './store/useItineraryStore';

function App() {
	const [isConfigured, setIsConfigured] = useState(false);
	const { preferences } = useSettingsStore();
	const { setConfig } = useItineraryStore();

	useEffect(() => {
		if (preferences) {
			setConfig({
				transport: preferences.transport,
				travelers: preferences.travelers,
			});
		}
	}, [preferences, setConfig]);

	return (
		<Layout>
			{!isConfigured ? (
				<div className="py-12">
					<Wizard onComplete={() => setIsConfigured(true)} />
				</div>
			) : (
				<Dashboard onBack={() => setIsConfigured(false)} />
			)}
		</Layout>
	);
}

export default App;
