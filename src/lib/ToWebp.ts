import { MetaDataType } from '../types/metaInfoType.js'
import sharp from 'sharp'
import { StickerTypes } from '../types/StickerTypes.js'
import toGif from './toGif.js'
import TextOnImg from './textOnImg.js'
const textOnImg = new TextOnImg()
/**
 * Converts a given buffer to WebP format with optional transformations.
 *
 * @param {Buffer} buffer - The input buffer to be converted.
 * @param {Partial<MetaDataType>} metaInfo - Metadata information for the conversion.
 * @param {string} mimeExt - The MIME extension of the input buffer.
 * @param {string} mimeType - The MIME type of the input buffer.
 * @returns {Promise<Buffer>} - A promise that resolves to the converted WebP buffer.
 */

const ToWebp = async (
    buffer: Buffer,
    metaInfo: Partial<MetaDataType>,
    mimeExt: string,
    mimeType: string
): Promise<Buffer> => {
    try {
        if (mimeExt === 'webp') return buffer
        let data = mimeType?.includes('video')
            ? await toGif(buffer, mimeExt, metaInfo.type || StickerTypes.DEFAULT, metaInfo.text ?? '')
            : (metaInfo.text ? await textOnImg.drawText(buffer,metaInfo.text): buffer)

        let isAnimated = mimeType?.includes('video') || mimeExt?.includes('gif')
        const res = sharp(data, { animated: isAnimated })

        if (metaInfo.type === StickerTypes.CIRCLE) {
            res.resize(512, 512, {
                fit: sharp.fit.cover
            }).composite([
                {
                    input: Buffer.from(
                        `<svg width="512" height="512"><circle cx="256" cy="256" r="256" fill=""/></svg>`
                    ),
                    blend: 'dest-in',
                    gravity: 'northeast',
                    tile: true
                }
            ])
        } else if (metaInfo.type === StickerTypes.SQUARE && !mimeType?.includes('video')) {
            res.resize(512, 512, {
                fit: sharp.fit.fill
            })
        } else {
            res.resize(512, 512, {
                fit: sharp.fit.contain,
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            })

        }

        return res
            .toFormat('webp')
            .webp({
                quality: metaInfo.quality,
                lossless: mimeExt.includes('gif') ? true: false
            })
            .toBuffer()
    } catch (error: unknown) {
        throw new Error(`Conversion failed: ${error}`)
    }
}

export default ToWebp
