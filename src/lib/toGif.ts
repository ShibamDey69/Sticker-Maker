import ffmpeg from 'fluent-ffmpeg'
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'
import { tmpdir } from 'os'
import { writeFile, readFile, unlink } from 'fs/promises'
import { join } from 'path'
import { StickerTypes } from '../types/StickerTypes.js'
import TextOnGif from './textOnGif.js';
ffmpeg.setFfmpegPath(ffmpegInstaller.path)

const videoToGif = (buffer: Buffer, extType: string, type: StickerTypes, text:string = ''): Promise<Buffer> => {
    return new Promise(async (resolve, reject) => {
        const execute = async (attempt: number) => {
            const filename = join(tmpdir(), `${Math.random().toString(36)}.${extType}`)
            const outputFilename = join(tmpdir(), `${Math.random().toString(36)}.gif`)
            const retries = 3
            try {
                await writeFile(filename, buffer)

                const shape =
                    type === StickerTypes.SQUARE
                        ? 'scale=320:-1:flags=lanczos,fps=10,crop=min(iw\\,ih):min(iw\\,ih)'
                        : 'scale=320:-1:flags=lanczos,fps=20'

                await new Promise((resolveFfmpeg, rejectFfmpeg) => {
                    ffmpeg(filename)
                        .inputFormat(extType)
                        .outputOptions(['-vf', shape, '-loop', '0', '-lossless', '0', '-t', '7', '-preset', 'ultrafast'])
                        .toFormat('gif')
                        .save(outputFilename)
                        .on('end', resolveFfmpeg)
                        .on('error', rejectFfmpeg)
                })

                const gifBuffer = text ? await TextOnGif(outputFilename, text) : await readFile(outputFilename);
                await Promise.all([unlink(filename), unlink(outputFilename)])

                resolve(gifBuffer)
            } catch (error) {
                if (attempt < retries) {
                    execute(++attempt)
                } else {
                    await Promise.all([unlink(filename).catch(() => {}), unlink(outputFilename).catch(() => {})])
                    reject(error)
                }
            }
        }
         execute(1)
    })
}

export default videoToGif