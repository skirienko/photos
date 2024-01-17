import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import registerServiceWorker from './registerServiceWorker';

const rootElement = ReactDOM.createRoot(document.getElementById('root'));
rootElement.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);

registerServiceWorker();