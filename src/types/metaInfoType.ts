import { category } from './categoryType.js'
import { StickerTypes } from './StickerTypes.js'
export interface MetaDataType {
    pack?: string
    author?: string
    id?: string | null
    category?: category[]
    type?: StickerTypes | string
    quality?: number
    background?: String | undefined
}
