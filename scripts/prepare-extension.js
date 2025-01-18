import { copyFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')
const distDir = join(rootDir, 'dist')

// 确保目标目录存在
mkdirSync(join(distDir, 'icons'), { recursive: true })

// 复制文件
copyFileSync(join(rootDir, 'manifest.json'), join(distDir, 'manifest.json'))

// 复制图标
const iconSizes = [16, 32, 48, 128]
iconSizes.forEach((size) => {
	copyFileSync(
		join(rootDir, `icons/icon${size}.png`),
		join(distDir, `icons/icon${size}.png`),
	)
})
