import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#131d2f',
            color: '#d8e0ec',
            border: '1px solid #1e2d44',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '13px',
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>,
)
