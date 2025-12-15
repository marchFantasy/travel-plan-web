import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import 'leaflet/dist/leaflet.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<App />
	</StrictMode>
);
window._AMapSecurityConfig = {
	securityJsCode: '0f01994a1ee2b5817f7ad89b02fc24e4',
};
