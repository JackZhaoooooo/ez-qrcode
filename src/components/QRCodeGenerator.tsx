import React, { useState, useEffect } from 'react'
import { Button, Toast, TextArea } from '@douyinfe/semi-ui'
import { QRCodeSVG } from 'qrcode.react'
import { IconSave, IconDownload } from '@douyinfe/semi-icons'
import FavoriteList from './FavoriteList'
import ReactDOMServer from 'react-dom/server'

const QRCodeGenerator: React.FC = () => {
	const [name, setName] = useState('')
	const [url, setUrl] = useState('')
	const [refreshKey, setRefreshKey] = useState(0)

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
			Toast.error('名称和链接不能为空')
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
					Toast.success('保存成功')
				},
			)
		})
	}

	const handleDownload = () => {
		if (!url) {
			Toast.error('链接不能为空')
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
				Toast.success('下载成功')
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
						placeholder='请输入名称'
						value={name}
						onChange={setName}
						showClear
						autosize={{ minRows: 1, maxRows: 1 }}
					/>
					<TextArea
						placeholder='请输入链接'
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
							title='保存到历史记录'
							className='flex-1'
						>
							收藏
						</Button>
						<Button
							icon={<IconDownload />}
							onClick={handleDownload}
							theme='solid'
							type='primary'
							title='保存二维码图片'
							className='flex-1'
						>
							保存图片
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
