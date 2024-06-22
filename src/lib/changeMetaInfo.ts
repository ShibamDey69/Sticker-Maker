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
        this.data['sticker-pack-id'] = options.id
        this.data['sticker-pack-name'] = options.pack || ''
        this.data['sticker-pack-publisher'] = options.author || ''
        this.data['emojis'] = options.category || []
        this.data['sticker-quality'] = options.quality || '30'
        this.data['sticker-background'] = options.background || ''
        this.data = { ...this.data, ...options }
    }

    /**
     * Builds the Exif metadata as a Buffer.
     * @returns A Buffer containing the constructed Exif data.
     */
    build = (): Buffer => {
        const data = JSON.stringify(this.data)
        const dataBuffer = Buffer.from(data, 'utf-8')

        // Construct the Exif header.
        const exifHeader = Buffer.alloc(22) // Allocate a new buffer of the correct size
        exifHeader.write('Exif\0\0', 0) // Exif header
        exifHeader.writeUInt16LE(0x4949, 6) // II for little-endian
        exifHeader.writeUInt16LE(0x002a, 8) // TIFF header
        exifHeader.writeUInt32LE(0x00000008, 10) // Offset to first IFD

        // Write the APP1 marker and size
        const app1Marker = Buffer.from([0xff, 0xe1])
        const app1Size = Buffer.alloc(2)
        app1Size.writeUInt16BE(2 + exifHeader.length + dataBuffer.length)

        // Write the length of the data into the Exif header.
        exifHeader.writeUInt32LE(dataBuffer.length, 14)

        // Concatenate all parts
        const exif = Buffer.concat([app1Marker, app1Size, exifHeader, dataBuffer])

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

    /**
     * Loads the image from a Buffer or string and returns an Image instance.
     * @param image - A Buffer or string representing the image to be loaded.
     * @returns A Promise that resolves to an Image instance.
     */
    load = async (image: Buffer | string): Promise<Image.Image> => {
        const img = new Image.Image()
        await img.load(image)
        return img
    }
}
