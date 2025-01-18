import React, { useState } from 'react'
import { TextArea, Upload, Toast } from '@douyinfe/semi-ui'
import { IconUpload } from '@douyinfe/semi-icons'
import jsQR from 'jsqr'

const QRCodeDecoder: React.FC = () => {
	const [result, setResult] = useState('')

	// 从图片文件解码
	const decodeFromFile = async (file: File) => {
		setResult('')

		try {
			// 创建文件的临时URL
			const objectUrl = URL.createObjectURL(file)

			// 加载图片
			const img = new Image()
			await new Promise<void>((resolve, reject) => {
				img.onload = () => resolve()
				img.onerror = () => reject(new Error('图片加载失败'))
				img.src = objectUrl
			})

			// 创建canvas并绘制图片
			const canvas = document.createElement('canvas')
			canvas.width = img.width
			canvas.height = img.height

			const ctx = canvas.getContext('2d')
			if (!ctx) {
				throw new Error('无法创建canvas上下文')
			}

			ctx.drawImage(img, 0, 0)

			// 获取图片数据并解码
			const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
			const code = jsQR(imageData.data, imageData.width, imageData.height)

			// 清理资源
			URL.revokeObjectURL(objectUrl)

			if (code) {
				setResult(code.data)
			} else {
				Toast.error('未能识别二维码')
			}
		} catch (error) {
			Toast.error('解码失败')
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
							<div className='mt-2'>点击或拖拽图片到此处</div>
						</div>
					}
					draggable
					action=''
					onError={() => false}
					onChange={(info) => {
						const file = info.currentFile.fileInstance
						if (file) {
							decodeFromFile(file)
						}
					}}
				/>
			</div>

			<TextArea
				placeholder='解码结果'
				value={result}
				readOnly
				autosize={{ minRows: 3, maxRows: 6 }}
			/>
		</div>
	)
}

export default QRCodeDecoder
