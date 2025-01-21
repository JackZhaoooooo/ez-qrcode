import { readFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

// 确保输出目录存在
mkdirSync(join(rootDir, 'icons'), { recursive: true })

// 需要生成的图标尺寸
const sizes = [16, 32, 48, 128]

// 生成不同尺寸的PNG
async function generateIcons() {
	try {
		// 读取SVG文件
		const svgBuffer = readFileSync(join(rootDir, 'icon.svg'))

		// 为每个尺寸生成PNG
		await Promise.all(
			sizes.map(async (size) => {
				try {
					await sharp(svgBuffer, {
						density: 300,  // 提高SVG渲染质量
					})
						.resize(size, size, {
							fit: 'contain',
							background: { r: 255, g: 255, b: 255, alpha: 1 }  // 白色背景
						})
						.png()
						.toFile(join(rootDir, `icons/icon${size}.png`))

					console.log(`✓ Generated ${size}x${size} icon`)
				} catch (err) {
					console.error(`Failed to generate ${size}x${size} icon:`, err)
					throw err
				}
			}),
		)

		console.log('✨ All icons generated successfully!')
	} catch (error) {
		console.error('Error generating icons:', error)
		process.exit(1)
	}
}

generateIcons()
