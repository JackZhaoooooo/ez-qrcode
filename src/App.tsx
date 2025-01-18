import React, { useEffect, useState } from 'react'
import { Layout, TabPane, Tabs, Button } from '@douyinfe/semi-ui'
import { IconMoon, IconSun } from '@douyinfe/semi-icons'
import QRCodeGenerator from './components/QRCodeGenerator'
import QRCodeDecoder from './components/QRCodeDecoder'

type Theme = 'light' | 'dark' | 'system'

const App: React.FC = () => {
	const [theme, setTheme] = useState<Theme>('system')

	useEffect(() => {
		// 从存储中读取主题设置
		chrome.storage.local.get(['theme'], (result) => {
			if (result.theme) {
				setTheme(result.theme as Theme)
				document.body.setAttribute('theme-mode', result.theme)
			}
		})
	}, [])

	useEffect(() => {
		// 检测系统主题
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
		const handleChange = (e: MediaQueryListEvent) => {
			if (theme === 'system') {
				document.body.setAttribute('theme-mode', e.matches ? 'dark' : 'light')
			}
		}

		// 设置初始主题
		if (theme === 'system') {
			document.body.setAttribute(
				'theme-mode',
				mediaQuery.matches ? 'dark' : 'light',
			)
		} else {
			document.body.setAttribute('theme-mode', theme)
		}

		mediaQuery.addListener(handleChange)
		return () => mediaQuery.removeListener(handleChange)
	}, [theme])

	const toggleTheme = () => {
		const currentTheme = document.body.getAttribute('theme-mode') as Theme
		const newTheme = currentTheme === 'light' ? 'dark' : 'light'
		setTheme(newTheme)
		document.body.setAttribute('theme-mode', newTheme)
		// 保存主题设置到存储
		chrome.storage.local.set({ theme: newTheme })
	}

	return (
		<Layout className='w-full h-full px-3 bg-[var(--semi-color-bg-0)]'>
			<Tabs
				type='line'
				tabBarExtraContent={
					<Button
						icon={theme === 'dark' ? <IconSun /> : <IconMoon />}
						type='tertiary'
						theme='borderless'
						size='small'
						onClick={toggleTheme}
					/>
				}
			>
				<TabPane
					tab='生成二维码'
					itemKey='1'
				>
					<QRCodeGenerator />
				</TabPane>
				<TabPane
					tab='二维码解码'
					itemKey='2'
				>
					<QRCodeDecoder />
				</TabPane>
			</Tabs>
		</Layout>
	)
}

export default App
