import React, { useEffect, useState } from 'react'
import { Layout, TabPane, Tabs, Button } from '@douyinfe/semi-ui'
import { IconMoon, IconSun, IconLanguage } from '@douyinfe/semi-icons'
import { useTranslation } from 'react-i18next'
import QRCodeGenerator from './components/QRCodeGenerator'
import QRCodeDecoder from './components/QRCodeDecoder'
import './i18n'

type Theme = 'light' | 'dark' | 'system'
type Language = 'en' | 'zh'

const App: React.FC = () => {
	const [theme, setTheme] = useState<Theme>('system')
	const [language, setLanguage] = useState<Language>('zh')
	const { t, i18n } = useTranslation()

	useEffect(() => {
		// 从存储中读取主题和语言设置
		chrome.storage.local.get(['theme', 'language'], (result) => {
			if (result.theme) {
				setTheme(result.theme as Theme)
				document.body.setAttribute('theme-mode', result.theme)
			}
			if (result.language) {
				setLanguage(result.language as Language)
				i18n.changeLanguage(result.language)
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

	return (
		<Layout className='w-full h-full px-3 bg-[var(--semi-color-bg-0)]'>
			<Tabs
				type='line'
				tabBarExtraContent={
					<div className='flex items-center gap-2 h-full'>
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
					tab={t('qrcode.generate')}
					itemKey='1'
				>
					<QRCodeGenerator />
				</TabPane>
				<TabPane
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
