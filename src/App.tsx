import React, { useEffect, useState } from 'react'
import { Layout, TabPane, Tabs, Button } from '@douyinfe/semi-ui'
import {
	IconMoon,
	IconSun,
	IconLanguage,
	IconExpand,
} from '@douyinfe/semi-icons'
import { useTranslation } from 'react-i18next'
import QRCodeGenerator from './components/QRCodeGenerator'
import QRCodeDecoder from './components/QRCodeDecoder'
import './i18n'

type Theme = 'light' | 'dark' | 'system'
type Language = 'en' | 'zh'

// 定义消息类型
type MessageType = {
	type: 'themeChange' | 'languageChange' | 'tabChange'
	data: any
}

const App: React.FC = () => {
	const [theme, setTheme] = useState<Theme>('system')
	const [language, setLanguage] = useState<Language>('zh')
	const [activeTab, setActiveTab] = useState('1')
	const { t, i18n } = useTranslation()

	// 监听来自其他页面的消息
	useEffect(() => {
		const handleStorageChange = (changes: {
			[key: string]: chrome.storage.StorageChange
		}) => {
			if (changes.theme) {
				const newTheme = changes.theme.newValue as Theme
				setTheme(newTheme)
				document.body.setAttribute('theme-mode', newTheme)
			}
			if (changes.language) {
				const newLanguage = changes.language.newValue as Language
				setLanguage(newLanguage)
				i18n.changeLanguage(newLanguage)
			}
			if (changes.activeTab) {
				setActiveTab(changes.activeTab.newValue)
			}
		}

		chrome.storage.onChanged.addListener(handleStorageChange)
		return () => {
			chrome.storage.onChanged.removeListener(handleStorageChange)
		}
	}, [])

	useEffect(() => {
		// 从存储中读取主题、语言和当前标签页设置
		chrome.storage.local.get(['theme', 'language', 'activeTab'], (result) => {
			if (result.theme) {
				setTheme(result.theme as Theme)
				document.body.setAttribute('theme-mode', result.theme)
			}
			if (result.language) {
				setLanguage(result.language as Language)
				i18n.changeLanguage(result.language)
			}
			if (result.activeTab) {
				setActiveTab(result.activeTab)
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

	const toggleLanguage = () => {
		const newLanguage = language === 'zh' ? 'en' : 'zh'
		setLanguage(newLanguage)
		i18n.changeLanguage(newLanguage)
		// 保存语言设置到存储
		chrome.storage.local.set({ language: newLanguage })
	}

	const openFullscreen = () => {
		const url = chrome.runtime.getURL('index.html')
		// 查找所有标签页中是否已经打开了全屏页面
		chrome.tabs.query({ url: url }, (tabs) => {
			if (tabs.length > 0) {
				// 如果已经打开，则切换到该标签页
				chrome.tabs.update(tabs[0].id!, { active: true })
				// 关闭当前弹出窗口
				window.close()
			} else {
				// 如果没有打开，则新开标签页
				chrome.tabs.create({ url: url }, () => {
					// 关闭当前弹出窗口
					window.close()
				})
			}
		})
	}

	const handleTabChange = (key: string) => {
		setActiveTab(key)
		// 保存当前标签页到存储
		chrome.storage.local.set({ activeTab: key })
	}

	return (
		<Layout className='w-full bg-[var(--semi-color-bg-0)] px-[7px]'>
			<Tabs
				type='line'
				activeKey={activeTab}
				onChange={handleTabChange}
				className='main-tabs'
				tabBarExtraContent={
					<div className='flex items-center gap-2 h-full'>
						<Button
							icon={<IconExpand />}
							type='tertiary'
							theme='borderless'
							size='small'
							onClick={openFullscreen}
						/>
						<Button
							icon={<IconLanguage />}
							type='tertiary'
							theme='borderless'
							size='small'
							onClick={toggleLanguage}
						/>
						<Button
							icon={theme === 'dark' ? <IconSun /> : <IconMoon />}
							type='tertiary'
							theme='borderless'
							size='small'
							onClick={toggleTheme}
						/>
					</div>
				}
			>
				<TabPane
					className='main-tabs-1'
					tab={t('qrcode.generate')}
					itemKey='1'
				>
					<QRCodeGenerator />
				</TabPane>
				<TabPane
					className='main-tabs-2'
					tab={t('qrcode.decode')}
					itemKey='2'
				>
					<QRCodeDecoder />
				</TabPane>
			</Tabs>
		</Layout>
	)
}

export default App
