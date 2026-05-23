import fs from 'fs-extra'
import Utils from './lib/utils.js'
import ToWebp from './lib/ToWebp.js'
import MetaInfoChanger from './lib/changeMetaInfo.js'

export default class Sticker {
    constructor(data, metaInfo = {}) {
        this.data = data
        this.metaInfo = { ...metaInfo }
        this.utils = new Utils()
        this.buffer = null
        this.mimeType = ''
        this.extType = ''
        this.initialized = false
    }

    async initialize() {
        if (this.initialized) return
        this.buffer = await this.utils.buffer(this.data)
        const fileType = await this.utils.getMimeType(this.buffer)
        this.mimeType = fileType?.mime || ''
        this.extType = fileType?.ext || ''
        this.metaInfo.pack ??= ''
        this.metaInfo.author ??= ''
        this.metaInfo.id ??= this.utils.getId()
        this.metaInfo.category ??= []
        this.metaInfo.type ??= 'DEFAULT'
        this.metaInfo.quality ??= this.utils.getQuality(this.buffer)
        this.metaInfo.text ??= ''
        this.initialized = true
    }

    async toBuffer() {
        await this.initialize()
        const toWebp = await ToWebp(this.buffer, this.metaInfo, this.extType, this.mimeType)
        return new MetaInfoChanger(this.metaInfo).add(toWebp)
    }

    async toFile(outputPath) {
        await this.initialize()
        const buffer = this.extType === 'webp' ? await this.changeMetaInfo() : await this.toBuffer()
        await fs.writeFile(outputPath, buffer)
    }

    async changeMetaInfo() {
        await this.initialize()
        return new MetaInfoChanger(this.metaInfo).add(this.buffer)
    }
}

export { default as extractMetaData } from './lib/extractMetaData.js'
