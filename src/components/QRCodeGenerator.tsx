import React, { useState, useEffect } from 'react'
import { Button, Toast, TextArea } from '@douyinfe/semi-ui'
import { QRCodeSVG } from 'qrcode.react'
import { IconSave, IconDownload } from '@douyinfe/semi-icons'
import { useTranslation } from 'react-i18next'
import FavoriteList from './FavoriteList'
import ReactDOMServer from 'react-dom/server'

const QRCodeGenerator: React.FC = () => {
	const [name, setName] = useState('')
	const [url, setUrl] = useState('')
	const [refreshKey, setRefreshKey] = useState(0)
	const [isPopup, setIsPopup] = useState(true)
	const { t } = useTranslation()

	// 检查是否是弹出窗口
	useEffect(() => {
		setIsPopup(document.documentElement.hasAttribute('data-popup'))
	}, [])

	// 监听存储变化
	useEffect(() => {
		const handleStorageChange = (changes: {
			[key: string]: chrome.storage.StorageChange
		}) => {
			// 只有在全屏模式下才同步 currentQRCode
			if (!isPopup && changes.currentQRCode) {
				const { name: newName, url: newUrl } =
					changes.currentQRCode.newValue || {}
				setName(newName || '')
				setUrl(newUrl || '')
			}
			// 在非全屏模式下同步 popupQRCode
			if (isPopup && changes.popupQRCode) {
				const { name: newName, url: newUrl } =
					changes.popupQRCode.newValue || {}
				setName(newName || '')
				setUrl(newUrl || '')
			}
			if (changes.favorites) {
				setRefreshKey((prev) => prev + 1)
			}
		}

		chrome.storage.onChanged.addListener(handleStorageChange)
		return () => {
			chrome.storage.onChanged.removeListener(handleStorageChange)
		}
	}, [isPopup])

	useEffect(() => {
		if (isPopup) {
			// 在弹出窗口模式下，使用 activeTab 权限获取当前标签页信息
			chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
				const currentTab = tabs[0]
				// 先检查是否有置顶的数据
				chrome.storage.local.get(['popupQRCode'], (result) => {
					if (currentTab?.url && !currentTab.url.startsWith('chrome://')) {
						// 只有当标签页存在且不是 chrome:// 页面时才设置
						setName(currentTab.title || '')
						setUrl(currentTab.url || '')
					} else if (result.popupQRCode) {
						setName(result.popupQRCode.name)
						setUrl(result.popupQRCode.url)
					}
				})
			})
		} else {
			// 在全屏模式下，从存储中读取数据
			chrome.storage.local.get(['currentQRCode'], (result) => {
				if (result.currentQRCode) {
					setName(result.currentQRCode.name)
					setUrl(result.currentQRCode.url)
				}
			})
		}
	}, [isPopup])

	// 更新输入内容时同步到存储
	const handleNameChange = (value: string) => {
		setName(value)
		// 只有在全屏模式下才同步到存储
		if (!isPopup) {
			chrome.storage.local.set({
				currentQRCode: { name: value, url },
			})
		}
	}

	const handleUrlChange = (value: string) => {
		setUrl(value)
		// 只有在全屏模式下才同步到存储
		if (!isPopup) {
			chrome.storage.local.set({
				currentQRCode: { name, url: value },
			})
		}
	}

	const handleSave = () => {
		if (!name || !url) {
			Toast.error(t('qrcode.input'))
			return
		}

		chrome.storage.local.get(['favorites'], (result) => {
			const favorites = result.favorites || []
			const newFavorite = { name, url, id: Date.now() }
			chrome.storage.local.set(
				{
					favorites: [newFavorite, ...favorites],
				},
				() => {
					setRefreshKey((prev) => prev + 1)
				},
			)
		})
	}

	const handleDownload = () => {
		if (!url) {
			Toast.error(t('qrcode.input'))
			return
		}

		const tempDiv = document.createElement('div')
		tempDiv.style.position = 'absolute'
		tempDiv.style.left = '-9999px'
		document.body.appendChild(tempDiv)

		const qrElement = (
			<QRCodeSVG
				value={url}
				size={191}
			/>
		)
		const qrString = ReactDOMServer.renderToString(qrElement)
		tempDiv.innerHTML = qrString

		const svg = tempDiv.querySelector('svg')
		if (svg) {
			const svgData = new XMLSerializer().serializeToString(svg)
			const canvas = document.createElement('canvas')
			const ctx = canvas.getContext('2d')
			const img = new Image()

			img.onload = () => {
				canvas.width = img.width
				canvas.height = img.height
				ctx?.drawImage(img, 0, 0)

				const link = document.createElement('a')
				link.download = `${name || 'qrcode'}.png`
				link.href = canvas.toDataURL('image/png')
				link.click()

				document.body.removeChild(tempDiv)
			}

			img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
		}
	}

	return (
		<div className='flex flex-col h-full'>
			<div className='flex gap-2 mb-2'>
				<div className='w-[191px] flex items-center justify-center bg-gray-50 rounded-lg'>
					<QRCodeSVG
						value={url || ' '}
						size={191}
					/>
				</div>
				<div className='flex-1 flex flex-col gap-2'>
					<TextArea
						placeholder={t('qrcode.input')}
						value={name}
						onChange={handleNameChange}
						showClear
						autosize={{ minRows: 1, maxRows: 1 }}
					/>
					<TextArea
						placeholder={t('qrcode.input')}
						value={url}
						onChange={handleUrlChange}
						showClear
						autosize={{ minRows: 5, maxRows: 5 }}
					/>
					<div className='flex gap-2'>
						<Button
							icon={<IconSave />}
							onClick={handleSave}
							theme='solid'
							type='primary'
							title={t('qrcode.favorite_add')}
							className='flex-1'
						>
							{t('qrcode.favorite')}
						</Button>
						<Button
							icon={<IconDownload />}
							onClick={handleDownload}
							theme='solid'
							type='primary'
							title={t('qrcode.download')}
							className='flex-1'
						>
							{t('qrcode.download')}
						</Button>
					</div>
				</div>
			</div>
			<div className='flex-1 overflow-hidden'>
				<FavoriteList key={refreshKey} />
			</div>
		</div>
	)
}

export default QRCodeGenerator
