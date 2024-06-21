import Image from 'node-webpmux'
/**
 * Extracts metadata from a WebP image.
 * @param {Buffer}image - The image buffer to extract metadata from
 */
 const extractMetadata = async (image: Buffer): Promise<any> => {
    const img = new Image.Image()
    await img.load(image)
    const exif = img.exif?.toString('utf-8') ?? '{}'
    return JSON.parse(exif.substring(exif.indexOf('{'), exif.lastIndexOf('}') + 1) ?? '{}');
}

export default extractMetadata;