import { Readable } from 'stream'
import fs from 'fs-extra'
export default class Utils {
    async buffer(data) {
        try {
            if (typeof data === 'string') return await fs.readFile(data)
            if (data instanceof Readable) return await this.streamToBuffer(data)
            return Buffer.from(data)
        } catch (error) {
            throw new Error(`Error converting to buffer: ${error}`)
        }
    }
    async streamToBuffer(stream) {
        const chunks = []
        return new Promise((resolve, reject) => {
            stream.on('data', chunk => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)))
            stream.on('end', () => resolve(Buffer.concat(chunks)))
            stream.on('error', reject)
        })
    }
    getQuality(data) {
        const bytes = Buffer.from(data).length / 1024
        return bytes > 4096 ? 70 : bytes > 3072 ? 80 : bytes > 2048 ? 85 : 90
    }
    async getMimeType(data) {
        try {
            const { fileTypeFromBuffer } = await import('file-type')
            return await fileTypeFromBuffer(data)
        } catch (error) {
            console.error(`Error getting MIME type: ${error}`)
            return undefined
        }
    }
    getId() {
        return [...Array(5)].map(() => Math.random().toString(36).substring(2, 15)).join('')
    }
}