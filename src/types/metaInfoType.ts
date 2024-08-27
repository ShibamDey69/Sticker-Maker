import { category } from './categoryType.js'
import { StickerTypes } from './StickerTypes.js'
export interface MetaDataType {
    pack?: string
    author?: string
    id?: string
    category?: category[]
    type?: StickerTypes
    quality?: number
    text?: string
}
