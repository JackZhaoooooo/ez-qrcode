import React, { useState, useEffect } from 'react'
import {
	Table,
	Button,
	SideSheet,
	Toast,
	Popover,
	TextArea,
	Input,
} from '@douyinfe/semi-ui'
import {
	IconQrCode,
	IconDownload,
	IconEdit,
	IconCopy,
	IconDelete,
	IconSearch,
} from '@douyinfe/semi-icons'
import { QRCodeSVG } from 'qrcode.react'
import ReactDOMServer from 'react-dom/server'

interface FavoriteItem {
	id: number
	name: string
	url: string
}

const FavoriteList: React.FC = () => {
	const [favorites, setFavorites] = useState<FavoriteItem[]>([])
	const [visible, setVisible] = useState(false)
	const [currentItem, setCurrentItem] = useState<FavoriteItem | null>(null)
	const [editName, setEditName] = useState('')
	const [editUrl, setEditUrl] = useState('')
	const [searchText, setSearchText] = useState('')

	useEffect(() => {
		loadFavorites()
	}, [])

	const loadFavorites = () => {
		chrome.storage.local.get(['favorites'], (result) => {
			setFavorites(result.favorites || [])
		})
	}

	const filteredFavorites = favorites.filter(
		(item) =>
			item.name.toLowerCase().includes(searchText.toLowerCase()) ||
			item.url.toLowerCase().includes(searchText.toLowerCase()),
	)

	const handleEdit = (record: FavoriteItem) => {
		setCurrentItem(record)
		setEditName(record.name)
		setEditUrl(record.url)
		setVisible(true)
	}

	const handleUpdate = () => {
		if (!currentItem || !editName || !editUrl) {
			Toast.error('名称和链接不能为空')
			return
		}

		const newFavorites = favorites.map((item) =>
			item.id === currentItem.id
				? { ...item, name: editName, url: editUrl }
				: item,
		)

		chrome.storage.local.set({ favorites: newFavorites }, () => {
			setFavorites(newFavorites)
			setVisible(false)
			Toast.success('更新成功')
		})
	}

	const handleDelete = (id: number) => {
		const newFavorites = favorites.filter((item) => item.id !== id)
		chrome.storage.local.set({ favorites: newFavorites }, () => {
			setFavorites(newFavorites)
			Toast.success('删除成功')
		})
	}

	const handleCopy = (url: string) => {
		navigator.clipboard.writeText(url).then(() => {
			Toast.success('复制成功')
		})
	}

	const handleDownload = (item: FavoriteItem) => {
		const tempDiv = document.createElement('div')
		tempDiv.style.position = 'absolute'
		tempDiv.style.left = '-9999px'
		document.body.appendChild(tempDiv)

		const qrElement = (
			<QRCodeSVG
				value={item.url}
				size={300}
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
				link.download = `${item.name}.png`
				link.href = canvas.toDataURL('image/png')
				link.click()

				document.body.removeChild(tempDiv)
				Toast.success('下载成功')
			}

			img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
		}
	}

	const columns = [
		{
			dataIndex: 'name',
			width: '55%',
			render: (text: string, record: FavoriteItem) => (
				<div className='flex'>
					<a
						href={record.url}
						target='_blank'
						rel='noopener noreferrer'
						className='text-[var(--semi-color-link)] hover:text-[var(--semi-color-link-hover)] truncate block flex-1 w-[0px]'
						title={text}
					>
						{text}
					</a>
				</div>
			),
		},
		{
			dataIndex: 'operation',
			render: (_: any, record: FavoriteItem) => (
				<div className='flex gap-1 justify-end'>
					<Popover
						content={
							<div
								data-id={record.id}
								className='p-2'
							>
								<QRCodeSVG
									value={record.url}
									size={150}
								/>
							</div>
						}
						position='bottomRight'
						showArrow={false}
					>
						<Button
							icon={<IconQrCode />}
							type='tertiary'
							size='small'
							title='查看二维码'
						/>
					</Popover>
					<Button
						icon={<IconDownload />}
						type='tertiary'
						size='small'
						onClick={() => handleDownload(record)}
						title='下载二维码'
					/>
					<Button
						icon={<IconEdit />}
						type='tertiary'
						size='small'
						onClick={() => handleEdit(record)}
						title='编辑'
					/>
					<Button
						icon={<IconCopy />}
						type='tertiary'
						size='small'
						onClick={() => handleCopy(record.url)}
						title='复制链接'
					/>
					<Button
						icon={<IconDelete />}
						type='tertiary'
						size='small'
						onClick={() => handleDelete(record.id)}
						title='删除'
					/>
				</div>
			),
		},
	]

	return (
		<>
			<div className='mb-1'>
				<Input
					prefix={<IconSearch />}
					placeholder='搜索名称或链接'
					value={searchText}
					onChange={setSearchText}
					showClear
					size='small'
				/>
			</div>
			<Table
				columns={columns}
				dataSource={filteredFavorites}
				pagination={false}
				size='small'
				className='h-[200px] overflow-y-auto'
				empty='暂无历史记录'
			/>
			<SideSheet
				title='编辑二维码'
				visible={visible}
				onCancel={() => setVisible(false)}
				width={400}
				placement='right'
			>
				<div className='flex flex-col gap-2 p-4'>
					<TextArea
						placeholder='请输入名称'
						value={editName}
						onChange={setEditName}
						showClear
						autosize={{ minRows: 1, maxRows: 1 }}
					/>
					<TextArea
						placeholder='请输入链接'
						value={editUrl}
						onChange={setEditUrl}
						showClear
						autosize={{ minRows: 5, maxRows: 5 }}
					/>
					<Button
						type='primary'
						theme='solid'
						onClick={handleUpdate}
					>
						更新
					</Button>
				</div>
			</SideSheet>
		</>
	)
}

export default FavoriteList
