import { promisify } from 'util'
import { execFile } from 'child_process'
import fs from 'fs-extra'
import os from 'os'
import path from 'path'
const exec = promisify(execFile)

export default async function toPng(buffer, mimeExt) {
    if (mimeExt === 'png') return buffer
    const timestamp = Date.now()
    const inputPath = path.join(os.tmpdir(), `input_${timestamp}.${mimeExt}`)
    const outputPath = path.join(os.tmpdir(), `output_${timestamp}.png`)
    try {
        await fs.writeFile(inputPath, buffer)
        await exec('ffmpeg', ['-y', '-i', inputPath, outputPath])
        const result = await fs.readFile(outputPath)
        return result
    } catch (err) {
        throw new Error(`Failed to convert to PNG: ${err.message}`)
    } finally {
        await Promise.all([fs.remove(inputPath), fs.remove(outputPath)]).catch(() => {}) 
    }
}