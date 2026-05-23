import { promisify } from 'util'
import { execFile } from 'child_process'
import fs from 'fs-extra'
import os from 'os'
import path from 'path'
import TextOnGif from './textOnGif.js'


const exec = promisify(execFile)
const textOnGif = new TextOnGif()

export default async function videoToGif(buffer, extType, type, text = '') {
    for (let attempt = 0; attempt < 3; attempt++) {
        const ts = Date.now()
        const inputPath = path.join(os.tmpdir(), `in_${ts}_${attempt}.${extType}`)
        const outputPath = path.join(os.tmpdir(), `out_${ts}_${attempt}.gif`)
        try {
            await fs.writeFile(inputPath, buffer)
            const vf = type === 'SQUARE'
                ? 'scale=320:-1:flags=lanczos,fps=10,crop=min(iw\\,ih):min(iw\\,ih)'
                : 'scale=320:-1:flags=lanczos,fps=20'
            await exec('ffmpeg', ['-y', '-i', inputPath, '-vf', vf, '-t', '7', '-loop', '0', '-f', 'gif', outputPath])
            let result = await fs.readFile(outputPath)
            if (text) result = await textOnGif.drawText(result, text)
            return result
        } catch (error) {
            if (attempt === 2) throw error
        } finally {
            await Promise.all([fs.remove(inputPath), fs.remove(outputPath)]).catch(() => {})
        }
    }
}