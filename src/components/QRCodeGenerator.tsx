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
	const { t } = useTranslation()

	useEffect(() => {
		// 获取当前页面的标题和URL
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			const currentTab = tabs[0]
			setName(currentTab.title || '')
			setUrl(currentTab.url || '')
		})
	}, [])

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
					Toast.success(t('qrcode.copied'))
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
				Toast.success(t('qrcode.copied'))
			}

			img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
		}
	}

	return (
		<div className='flex flex-col h-full py-1'>
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
						onChange={setName}
						showClear
						autosize={{ minRows: 1, maxRows: 1 }}
					/>
					<TextArea
						placeholder={t('qrcode.input')}
						value={url}
						onChange={setUrl}
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
