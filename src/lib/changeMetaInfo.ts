import { MetaDataType } from "../types/metaInfoType";
import { StickerTypes } from "../types/StickerTypes";

function changeMetaInfo(data: Buffer, metaInfo: Partial<MetaDataType>): Buffer {
  try {
    const type = metaInfo.type === StickerTypes.CIRCLE
      ? "circle"
      : metaInfo.type === StickerTypes.SQUARE
      ? "square"
      : metaInfo.type === StickerTypes.FIT
      ? "fit"
      : "default";

    const { ...restMetaInfo } = metaInfo;
    const updatedMetaData: MetaDataType = { type, ...restMetaInfo };
    const metaDataString = JSON.stringify(updatedMetaData);
    const updatedData = Buffer.concat([data, Buffer.from(metaDataString)]);
    return updatedData;
  } catch (error: unknown) {
    throw new Error(`Error changing meta info: ${error}`);
  }
}

export default changeMetaInfo;