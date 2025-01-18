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
import { useTranslation } from 'react-i18next'
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
	const { t } = useTranslation()

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
			Toast.error(t('qrcode.input'))
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
			Toast.success(t('qrcode.copied'))
		})
	}

	const handleDelete = (id: number) => {
		const newFavorites = favorites.filter((item) => item.id !== id)
		chrome.storage.local.set({ favorites: newFavorites }, () => {
			setFavorites(newFavorites)
			Toast.success(t('qrcode.copied'))
		})
	}

	const handleCopy = (url: string) => {
		navigator.clipboard.writeText(url).then(() => {
			Toast.success(t('qrcode.copied'))
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
				Toast.success(t('qrcode.copied'))
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
							title={t('qrcode.generate')}
						/>
					</Popover>
					<Button
						icon={<IconDownload />}
						type='tertiary'
						size='small'
						onClick={() => handleDownload(record)}
						title={t('qrcode.download')}
					/>
					<Button
						icon={<IconEdit />}
						type='tertiary'
						size='small'
						onClick={() => handleEdit(record)}
						title={t('qrcode.favorite_add')}
					/>
					<Button
						icon={<IconCopy />}
						type='tertiary'
						size='small'
						onClick={() => handleCopy(record.url)}
						title={t('qrcode.copy')}
					/>
					<Button
						icon={<IconDelete />}
						type='tertiary'
						size='small'
						onClick={() => handleDelete(record.id)}
						title={t('qrcode.favorite_remove')}
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
					placeholder={t('qrcode.filter')}
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
				empty={t('qrcode.no_favorites')}
			/>
			<SideSheet
				title={t('qrcode.favorite_add')}
				visible={visible}
				onCancel={() => setVisible(false)}
				width={400}
				placement='right'
			>
				<div className='flex flex-col gap-2 p-4'>
					<TextArea
						placeholder={t('qrcode.input')}
						value={editName}
						onChange={setEditName}
						showClear
						autosize={{ minRows: 1, maxRows: 1 }}
					/>
					<TextArea
						placeholder={t('qrcode.input')}
						value={editUrl}
						onChange={setEditUrl}
						showClear
						autosize={{ minRows: 5, maxRows: 5 }}
					/>
					<Button
						theme='solid'
						type='primary'
						onClick={handleUpdate}
					>
						{t('qrcode.favorite_add')}
					</Button>
				</div>
			</SideSheet>
		</>
	)
}

export default FavoriteList
