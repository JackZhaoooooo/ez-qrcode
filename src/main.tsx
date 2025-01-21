import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import '@douyinfe/semi-ui/dist/css/semi.min.css'
import './index.css'
import './i18n'

// 检查是否是弹出窗口
const isPopup = window.innerWidth <= 540 && window.innerHeight <= 600
if (isPopup) {
	document.documentElement.setAttribute('data-popup', 'true')
}

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
)
