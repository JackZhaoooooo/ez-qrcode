import React, { useState, useEffect } from 'react'
import { TextArea, Upload, Toast } from '@douyinfe/semi-ui'
import { IconUpload } from '@douyinfe/semi-icons'
import { useTranslation } from 'react-i18next'
import jsQR from 'jsqr'

const QRCodeDecoder: React.FC = () => {
	const [result, setResult] = useState('')
	const { t } = useTranslation()

	// 监听存储变化
	useEffect(() => {
		const handleStorageChange = (changes: {
			[key: string]: chrome.storage.StorageChange
		}) => {
			if (changes.decodedResult) {
				setResult(changes.decodedResult.newValue || '')
			}
		}

		chrome.storage.onChanged.addListener(handleStorageChange)
		return () => {
			chrome.storage.onChanged.removeListener(handleStorageChange)
		}
	}, [])

	// 初始化时从存储中读取解码结果
	useEffect(() => {
		chrome.storage.local.get(['decodedResult'], (result) => {
			if (result.decodedResult) {
				setResult(result.decodedResult)
			}
		})
	}, [])

	// 从图片文件解码
	const decodeFromFile = async (file: File) => {
		setResult('')
		chrome.storage.local.set({ decodedResult: '' })

		try {
			// 创建文件的临时URL
			const objectUrl = URL.createObjectURL(file)

			// 加载图片
			const img = new Image()
			await new Promise<void>((resolve, reject) => {
				img.onload = () => resolve()
				img.onerror = () => reject(new Error(t('qrcode.upload')))
				img.src = objectUrl
			})

			// 创建canvas并绘制图片
			const canvas = document.createElement('canvas')
			canvas.width = img.width
			canvas.height = img.height

			console.log(canvas.width, canvas.height)

			const ctx = canvas.getContext('2d')
			if (!ctx) {
				throw new Error(t('qrcode.upload'))
			}

			ctx.drawImage(img, 0, 0)

			// 获取图片数据并解码
			const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
			const code = jsQR(imageData.data, imageData.width, imageData.height)

			// 清理资源
			URL.revokeObjectURL(objectUrl)

			if (code) {
				setResult(code.data)
				chrome.storage.local.set({ decodedResult: code.data })
			} else {
				Toast.error(t('qrcode.upload'))
			}
		} catch (error) {
			Toast.error(t('qrcode.upload'))
		}
	}

	return (
		<div className='flex flex-col gap-2'>
			<div className='border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors border-[var(--semi-color-border)]'>
				<Upload
					accept='image/*'
					showUploadList={false}
					className='w-full'
					dragIcon={
						<div className='text-center'>
							<IconUpload size='extra-large' />
						</div>
					}
					dragMainText={
						<div className='mt-2'>
							{t('qrcode.drag')} {t('qrcode.or')} {t('qrcode.click')}
						</div>
					}
					draggable
					action=''
					onError={() => false}
					onFileChange={(info) => {
						console.log(info)
						const file = info[0]
						if (file) {
							decodeFromFile(file)
						}
					}}
				/>
			</div>

			<TextArea
				value={result}
				readOnly
				autosize={{ minRows: 3, maxRows: 6 }}
			/>
		</div>
	)
}

export default QRCodeDecoder
