import { exec } from 'child_process'
import { mkdir, rm } from 'fs/promises'
import { join } from 'path'

const now = new Date()
const timestamp = now.toISOString().replace(/[T:]/g, '-').replace(/\..+/, '')

const zipDir = 'zip'
const zipName = `ez-qr-code-${timestamp}.zip`
const zipPath = join(zipDir, zipName)

// 清空并确保zip目录存在
await rm(zipDir, { recursive: true, force: true })
await mkdir(zipDir, { recursive: true })

exec(`cross-zip dist "${zipPath}"`, (error) => {
	if (error) {
		console.error('Error creating zip:', error)
		process.exit(1)
	}
	console.log(`Created ${zipPath}`)
})
