import Image from 'node-webpmux'
import { TextEncoder } from 'util'

export default class Exif {

    constructor(options) {
        this.data = {}
        this.data['sticker-pack-id'] = options.id || ''
        this.data['sticker-pack-name'] = options.pack || ''
        this.data['sticker-pack-publisher'] = options.author || ''
        this.data['emojis'] = options.category || ['😹']
        this.exif = null
    }

    build = () => {
        const data = JSON.stringify(this.data)
        const exif = Buffer.concat([
            Buffer.from([
                0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x16, 0x00, 0x00, 0x00
            ]),
            Buffer.from(data, 'utf-8')
        ])
        exif.writeUIntLE(new TextEncoder().encode(data).length, 14, 4)
        return exif
    }

    add = async (image) => {
        const exif = this.exif || this.build()
        
        // Load the image if it is not already an instance of Image.Image.
        image = image instanceof Image.Image
            ? image
            : await (async () => {
                const img = new Image.Image()
                await img.load(image)
                return img
            })()

        image.exif = exif
        return await image.save(null)
    }
}