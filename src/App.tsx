import { useState } from 'react';
import { Layout } from './components/Layout';
import { Wizard } from './components/Planner/Wizard';
import { Dashboard } from './components/Planner/Dashboard';

function App() {
	const [isConfigured, setIsConfigured] = useState(false);

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
