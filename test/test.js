import Sticker from '../src/index.js'
import fs from 'fs'
import path from 'path'

async function test() {
    try {
        const inputPath = path.join(process.cwd(), 'input.mp4')
        const outputPath = path.join(process.cwd(), 'output.webp')
        const sticker = new Sticker(inputPath, {
            pack: 'Test Pack',
            text: 'This',
            type: 'SQUARE',
            quality: 80
        }     )
        await sticker.toFile(outputPath)
        console.log('Sticker created successfully at:', outputPath)
    } catch (error) {
        console.error('Error creating sticker:', error)
    }
}

test()
