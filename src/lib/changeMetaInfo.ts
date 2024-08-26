import Image from 'node-webpmux'
import { TextEncoder } from 'util'

/**
 * The Exif class is responsible for handling the metadata (Exif data)
 * for sticker images, particularly those used in messaging applications.
 */
export default class Exif {
    private data: any = {}
    private exif: Buffer | null = null

    /**
     * Constructs an Exif instance with the given options.
     * @param options - An object containing metadata for the sticker.
     */
    constructor(options: any) {
        this.data['sticker-pack-id'] = options.id || ''
        this.data['sticker-pack-name'] = options.pack || ''
        this.data['sticker-pack-publisher'] = options.author || ''
        this.data['emojis'] = options.category || ['😹']
    }

    /**
     * Builds the Exif metadata as a Buffer.
     * @returns A Buffer containing the constructed Exif data.
     */
    build = (): Buffer => {
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

    /**
     * Adds the Exif metadata to the given image.
     * @param image - A Buffer or Image instance representing the image to which Exif data should be added.
     * @returns A Promise that resolves to a Buffer containing the image with the added Exif data.
     */
    add = async (image: Buffer | Image.Image): Promise<Buffer> => {
        const exif = this.exif || this.build()
        // Load the image if it is not already an instance of Image.Image.
        image =
            image instanceof Image.Image
                ? image
                : await (async () => {
                      const img = new Image.Image()
                      await img.load(image)
                      return img
                  })()

        // Set the Exif data on the image and save it.
        image.exif = exif
        return await image.save(null)
    }
}
