import ffmpeg from 'fluent-ffmpeg'
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'
import { PassThrough } from 'stream'
import { StickerTypes } from '../types/StickerTypes.js'
ffmpeg.setFfmpegPath(ffmpegInstaller.path)

const videoToGif = (buffer: Buffer, extType: string, type: StickerTypes): Promise<Buffer> => {
    return new Promise(async (resolve, reject) => {
        try {
            const outputStream = new PassThrough({ allowHalfOpen: false })
            const inputStream = new PassThrough({ allowHalfOpen: false })
            inputStream.write(buffer)
            inputStream.end()
            const chunks: Buffer[] = []

            outputStream.on('data', (chunk) => {
                chunks.push(chunk)
            })

            outputStream.on('end', () => {
                resolve(Buffer.concat(chunks))
                inputStream.destroy()
                outputStream.destroy()
            })

            outputStream.on('error', (err) => {
                reject(err)
                inputStream.destroy()
                outputStream.destroy()
            })

            const shape =
                type === StickerTypes.SQUARE
                    ? 'scale=320:-1:flags=lanczos,fps=10,crop=min(iw\\,ih):min(iw\\,ih)'
                    : 'scale=320:-1:flags=lanczos,fps=10'
            ffmpeg(inputStream)
                .inputFormat(extType)
                .outputOptions(['-vf', shape, '-loop', '0', '-lossless', '0', '-t', '7', '-preset', 'ultrafast'])
                .toFormat('gif')
                .pipe(outputStream)
                .on('error', (err) => {
                    inputStream.destroy()
                    outputStream.destroy()
                    reject(err)
                })
        } catch (error) {
            reject(error)
        }
    })
}

export default videoToGif
