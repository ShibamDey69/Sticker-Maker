import Sticker, {extractMetaData, StickerTypes} from '../src/index.js'
import fs from 'fs'
import path from 'path'

async function test() {
    try {
        const inputPath = path.join(process.cwd(), 'input.jpg')
        const outputPath = path.join(process.cwd(), 'output.webp')
        const sticker = new Sticker(inputPath, {
            pack: 'Test Pack',
            text: 'This  is a test sticker with a very long text that should wrap properly on the image to ensure readability.',
            type: StickerTypes.DEFAULT,
            quality: 90
        }     )
        const buffer = await sticker.toBuffer()
        console.log('Sticker buffer created successfully, size: mb', (buffer.length / (1024 * 1024)).toFixed(2))
        await sticker.toFile(outputPath)
        console.log('Sticker created successfully at:', outputPath)
        const exifData = await extractMetaData(outputPath)
        console.log('Extracted EXIF Data:', exifData)
    } catch (error) {
        console.error('Error creating sticker:', error)
    }
}

test()
