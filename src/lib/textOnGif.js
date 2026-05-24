import { promisify } from 'util'
import { execFile } from 'child_process'
import fs from 'fs-extra'
import os from 'os'
import path from 'path'

const exec = promisify(execFile)

export default class TextOnGif {
    constructor(maxCharsPerLine = 20) {
        this.maxCharsPerLine = maxCharsPerLine
    }

    wrapText(text, maxChars = 20) {
        const words = text.split(' ')
        const lines = []
        let currentLine = ''
        for (const word of words) {
            const test = currentLine ? `${currentLine} ${word}` : word
            if (test.length <= maxChars) currentLine = test
            else {
                if (currentLine) lines.push(currentLine)
                currentLine = word.length > maxChars ? word.substring(0, maxChars) : word
            }
        }
        if (currentLine) lines.push(currentLine)
        return lines
    }

    escapeText(text) {
        return text.replace(/'/g, "'\\''").replace(/:/g, '\\:').replace(/,/g, '\\,').replace(/%/g, '\\%')
    }

    escapeFontPath(fontPath) {
        return fontPath
            .replace(/\\/g, '/')
            .replace(/:/g, '\\:')
    }

    getFontPath() {
        const fonts = {
            win32: [
                'C:/Windows/Fonts/arialbd.ttf',
                'C:/Windows/Fonts/arial.ttf',
                'C:/Windows/Fonts/segoeui.ttf'
            ],
            darwin: [
                '/Library/Fonts/Arial Bold.ttf',
                '/System/Library/Fonts/Helvetica.ttc',
                '/Library/Fonts/Arial.ttf'
            ],
            linux: [
                '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
                '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',
                '/usr/share/fonts/truetype/freefont/FreeSansBold.ttf'
            ]
        }
        const list = fonts[process.platform] || fonts.linux
        for (const f of list) if (fs.existsSync(f)) return f
        return 'arial.ttf'
    }

    async drawText(gifBuffer, text, padding = { x: 10, y: 10 }) {
        const inputPath = path.join(os.tmpdir(), `input_${Date.now()}.gif`)
        const outputPath = path.join(os.tmpdir(), `output_${Date.now()}.gif`)
        const fontPath = this.escapeFontPath(this.getFontPath())

        try {
            await fs.writeFile(inputPath, gifBuffer)
            const { stdout } = await exec('ffprobe', [
                '-v', 'error',
                '-select_streams', 'v:0',
                '-show_entries', 'stream=width,height',
                '-of', 'csv=p=0:s=x',
                inputPath
            ])
            const [width, height] = stdout.trim().split('x').map(Number)
            if (!width || !height) throw new Error('Invalid GIF dimensions')

            const fontSize = Math.floor(height / 8)
            const lineHeight = fontSize * 1.2
            const lines = this.wrapText(text, this.maxCharsPerLine)

            const filters = lines.map((line, i) => {
                const y = Math.floor(height - padding.y - (lines.length - i) * lineHeight)
                return `drawtext=fontfile='${fontPath}':text='${this.escapeText(line)}':x=(w-text_w)/2:y=${y}:fontsize=${fontSize}:fontcolor=white:borderw=2:bordercolor=black`
            })

            await exec('ffmpeg', ['-y', '-i', inputPath, '-vf', filters.join(','), '-c:v', 'gif', outputPath])
            return await fs.readFile(outputPath)
        } catch (err) {
            console.error('TextOnGif error:', err.message)
            throw err
        } finally {
            await Promise.all([fs.remove(inputPath), fs.remove(outputPath)]).catch(() => {})
        }
    }
}