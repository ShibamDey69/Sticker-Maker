import ffmpeg from 'fluent-ffmpeg'
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'
import { PassThrough } from 'stream'
import { StickerTypes } from '../types/StickerTypes.js'
ffmpeg.setFfmpegPath(ffmpegInstaller.path)

const videoToGif = (buffer: Buffer, extType: string, type: StickerTypes): Promise<Buffer> => {
    return new Promise(async (resolve, reject) => {
        try {
            const outputStream = new PassThrough()
            const inputStream = new PassThrough()
            inputStream.end(buffer)
            const chunks: Buffer[] = []

            outputStream.on('data', (chunk) => {
                chunks.push(chunk)
            })

            outputStream.on('end', async () => {
                resolve(Buffer.concat(chunks))
            })

            outputStream.on('error', async (err) => {
                await videoToGif(buffer, extType, type)
                reject(err)
            })

            const shape =
                type === StickerTypes.SQUARE
                    ? 'scale=320:-1:flags=lanczos,fps=10,crop=min(iw\\,ih):min(iw\\,ih)'
                    : 'scale=320:-1:flags=lanczos,fps=10'
            ffmpeg(inputStream)
                .inputFormat(extType)
                .outputOptions(['-vf', shape, '-loop', '0', '-lossless', '0', '-t', '6', '-preset', 'ultrafast'])
                .toFormat('gif')
                .pipe(outputStream, { end: true })
        } catch (error) {
            reject(error)
        }
    })
}

export default videoToGif
