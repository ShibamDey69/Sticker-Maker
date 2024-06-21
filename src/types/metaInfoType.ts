import { category } from './categoryType';
import { StickerTypes } from './StickerTypes';
export interface MetaDataType {
    pack?: string;
    author?: string;
    id?: string | null;
    category?: category[];
    type?: StickerTypes | string;
    quality?: number;
    background?: String | undefined;
}

