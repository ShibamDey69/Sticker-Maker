import fs from 'fs'
import { Readable } from 'stream'
import Utils from './lib/utils.js'
import convert from './lib/ToWebp.js'
import { MetaDataType } from './types/metaInfoType.js'
import { StickerTypes } from './types/StickerTypes.js'
import MetaInfoChanger from './lib/changeMetaInfo.js'
import extractMetaData from './lib/extractMetaData.js'

class Sticker {
    private buffer: Buffer
    private mimeType: string
    private extType: string
    private utils = new Utils()
    private outBuffer: Buffer
    private activeBuff: boolean
    private activeMeta: boolean

    constructor(
        private data: Buffer | string | Readable,
        public metaInfo: Partial<MetaDataType> = {}
    ) {
        this.buffer = Buffer.from([])
        this.outBuffer = Buffer.from([])
        this.activeBuff = false
        this.activeMeta = false
        this.mimeType = ''
        this.extType = ''
    }

    /**
     * Initializes the Sticker instance.
     * - Sets default values for metaInfo.
     * - Reads and analyzes input data to determine MIME type and extension type.
     * - Generates ID and quality metadata if not provided.
     */
    private async initialize(): Promise<void> {
        try {
            this.buffer = await this.utils.buffer(this.data)
            const fileType = await this.utils.getMimeType(this.buffer)
            this.mimeType = fileType?.mime ?? ''
            this.extType = fileType?.ext ?? ''

            this.metaInfo.pack = this.metaInfo.pack ?? ''
            this.metaInfo.author = this.metaInfo.author ?? ''
            this.metaInfo.id = this.metaInfo.id ?? this.utils.getId()
            this.metaInfo.category = this.metaInfo.category ?? []
            this.metaInfo.type = this.metaInfo.type ?? StickerTypes.DEFAULT
            this.metaInfo.quality = this.metaInfo?.quality ?? this.utils.getQuality(this.buffer)
        } catch (error) {
            throw new Error(`Initialization error: ${error}`)
        }
    }

    /**
     * Converts input data to a Buffer containing the converted content.
     * @returns Promise<Buffer> A Promise resolving to the converted content as Buffer.
     */
    public async toBuffer(): Promise<Buffer> {
        try {
            await this.initialize()
            const buffer = await convert(this.buffer, this.metaInfo, this.extType, this.mimeType)

            this.outBuffer = await new MetaInfoChanger(this.metaInfo).add(buffer)

            this.activeBuff = true
            return this.outBuffer
        } catch (error) {
            this.activeBuff = false
            throw new Error(`Conversion to buffer failed: ${error}`)
        }
    }

    /**
     * Converts input data and writes it to a file at the specified outputPath.
     * @param outputPath The path where the converted file will be saved.
     * @returns Promise<void> A Promise resolving when the file is successfully written.
     */
    public async toFile(outputPath: string): Promise<void> {
        try {
            if (!this.activeBuff && !this.activeMeta && this.extType?.includes('webp')) {
                await this.changeMetaInfo()
            } else {
                await this.toBuffer()
            }
            await fs.promises.writeFile(outputPath, this.outBuffer)
        } catch (error) {
            throw new Error(`Conversion to file failed: ${error}`)
        }
    }

    /**
     * Changes the metadata of the sticker.
     * @param newMetaInfo Partial metadata to update.
     * @returns Promise<Buffer> A Promise resolving to the Buffer with updated metadata.
     */
    public async changeMetaInfo(): Promise<Buffer> {
        try {
            await this.initialize()
            this.outBuffer = await new MetaInfoChanger(this.metaInfo).add(this.buffer)
            this.activeMeta = true
            return this.outBuffer
        } catch (error) {
            this.activeMeta = false
            throw new Error(`Error changing meta info: ${error}`)
        }
    }

    /**
     * Extracts metadata from the provided data.
     * @param data Buffer containing the data to extract metadata from.
     * @returns Promise<Partial<MetaDataType>> A Promise resolving to the extracted metadata.
     */
    public async extractMetaData(data: Buffer): Promise<Partial<MetaDataType>> {
        try {
            await this.initialize()
            return extractMetaData(data)
        } catch (error) {
            throw new Error(`Error extracting meta data: ${error}`)
        }
    }
}

export { Sticker, StickerTypes };
