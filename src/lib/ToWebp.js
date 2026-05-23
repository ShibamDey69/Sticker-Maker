import { promisify } from 'util'
import { execFile } from 'child_process'
import fs from 'fs-extra'
import os from 'os'
import path from 'path'
import toGif from './toGif.js'
import TextOnImg from './textOnImg.js'

const exec = promisify(execFile)
const textOnImg = new TextOnImg()

export default async function ToWebp(buffer, metaInfo, mimeExt, mimeType) {
    const timestamp = Date.now()
    const inputPath = path.join(os.tmpdir(), `input_${timestamp}.${mimeExt}`)
    const outputPath = path.join(os.tmpdir(), `output_${timestamp}.webp`)

    try {
        if (mimeExt === 'webp') return buffer

        let processedData = buffer
        let currentExt = mimeExt
        const isAnimated = mimeType?.includes('video') || mimeExt === 'gif'

        if (mimeType?.includes('video')) {
            processedData = await toGif(buffer, mimeExt, metaInfo.type || 'DEFAULT', metaInfo.text ?? '')
            currentExt = 'gif'
        } else if (metaInfo.text) {
            processedData = await textOnImg.drawText(buffer, metaInfo.text)
            currentExt = 'png'
        }

        await fs.writeFile(inputPath, processedData)

        let videoFilter = ''
        if (metaInfo.type === 'CIRCLE') {
            videoFilter = 'scale=512:512:force_original_aspect_ratio=increase,crop=512:512,format=rgba,geq=r=\'r(X,Y)\':g=\'g(X,Y)\':b=\'b(X,Y)\':a=\'if(lte((X-256)*(X-256)+(Y-256)*(Y-256),65536),255,0)\''
        } else if (metaInfo.type === 'SQUARE') {
            videoFilter = 'scale=512:512:force_original_aspect_ratio=decrease'
        } else {
            videoFilter = 'scale=512:512:force_original_aspect_ratio=decrease'
        }

        const ffmpegArgs = ['-y', '-i', inputPath, '-vf', videoFilter]

        if (isAnimated) {
            ffmpegArgs.push('-loop', '0', '-pix_fmt', 'yuva420p')
        }

        ffmpegArgs.push(
            '-c:v', 'libwebp',
            '-quality', String(metaInfo.quality || 80),
            '-lossless', currentExt === 'gif' ? '1' : '0',
            outputPath
        )

        await exec('ffmpeg', ffmpegArgs)
        return await fs.readFile(outputPath)
    } finally {
        await Promise.all([fs.remove(inputPath), fs.remove(outputPath)]).catch(() => {})
    }
}