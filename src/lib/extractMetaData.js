import Image from 'node-webpmux';
import Utils from './utils.js';

const utils = new Utils();
const extractMetadata = async (image) => {
    const img = new Image.Image();
    const buffer = await utils.buffer(image);
    const fileType = await utils.getMimeType(buffer);
    if (!fileType || fileType.ext !== 'webp') throw new Error('Unsupported file type for metadata extraction');
    await img.load(image);
    const exif = img.exif?.toString('utf-8') ?? '{}';
    return JSON.parse(exif.substring(exif.indexOf('{'), exif.lastIndexOf('}') + 1) ?? '{}');
};
export default extractMetadata;