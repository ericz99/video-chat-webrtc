import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { ToastProvider } from 'react-toast-notifications';

import SocketContext, { socket } from './context/SocketContext';
import GlobalState from './context/GlobalState';
import './index.css';
import 'rodal/lib/rodal.css';
import Routes from './Routes';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
    <React.StrictMode>
        <SocketContext.Provider
            value={{
                socket,
            }}
        >
            <GlobalState>
                <ToastProvider>
                    <Router>
                        <Routes />
                    </Router>
                </ToastProvider>
            </GlobalState>
        </SocketContext.Provider>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
