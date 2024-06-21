import fs from "fs";
import { Readable } from "stream";
import Utils from "./lib/utils";
import convert from "./lib/ToWebp";
import { MetaDataType } from "./types/metaInfoType";
import { StickerTypes } from "./types/StickerTypes";
import MetaInfoChanger from "./lib/changeMetaInfo";
import extractMetaData from "./lib/extractMetaData";

class Sticker {
  private buffer: Buffer;
  private mimeType: string | undefined;
  private extType: string | undefined;
  private utils = new Utils();
  private outBuffer: Buffer;
  private activeBuff: boolean;
  private activeMeta: boolean;
  constructor(
    private data: Buffer | string | Readable,
    public metaInfo: Partial<MetaDataType> = {},
  ) {
    this.buffer = Buffer.from([]);
    this.outBuffer = Buffer.from([]);
    this.activeBuff = false;
    this.activeMeta = false;
  }

  /**
   * Initializes the Converter instance.
   * - Sets default values for metaInfo.
   * - Reads and analyzes input data to determine MIME type and extension type.
   * - Generates ID and quality metadata if not provided.
   */
  private async initialize() {
    try {
      this.buffer = await this.utils.buffer(this.data);
      const fileType = await this.utils.getMimeType(this.buffer);
      this.mimeType = fileType?.mime;
      this.extType = fileType?.ext;
      // Set default values for metaInfo if not provided
      this.metaInfo.pack = this.metaInfo.pack ?? "";
      this.metaInfo.author = this.metaInfo.author || "";
      this.metaInfo.id = this.metaInfo.id || this.utils.getId();
      this.metaInfo.category = this.metaInfo.category || [];
      this.metaInfo.type = this.metaInfo.type ?? StickerTypes.DEFAULT;
      this.metaInfo.quality =
        this.metaInfo?.quality ?? this.utils.getQuality(this.buffer);
      this.metaInfo.background = this.metaInfo.background;
    } catch (error) {
      throw new Error(`Initialization error: ${error}`);
    }
  }

  /**
   * Converts input data to a Buffer containing the converted content.
   * @returns Promise<Buffer> A Promise resolving to the converted content as Buffer.
   */
  public async toBuffer(): Promise<Buffer> {
    try {
      await this.initialize();
      let buffer = await convert(
        this.buffer,
        this.metaInfo,
        this.extType,
        this.mimeType,
      );
      this.outBuffer = await new MetaInfoChanger(this.metaInfo).add(buffer);
      this.activeBuff = true;
      return this.outBuffer ?? Buffer.from([]);
    } catch (error) {
       this.activeBuff = false;
       throw new Error(`Conversion to buffer failed: ${error}`);
    }
  }

  /**
   * Converts input data and writes it to a file at the specified outputPath.
   * @param outputPath The path where the converted file will be saved.
   * @returns Promise<void> A Promise resolving when the file is successfully written.
   */
  public async toFile(outputPath: string): Promise<void> {
    try {
      if (!this.activeBuff && !this.activeMeta) {
        await this.changeMetaInfo()
      }
      await fs.promises.writeFile(outputPath, this.outBuffer);
    } catch (error) {
      console.error(`Error converting to file: ${error}`);
      throw new Error(`Conversion to file failed: ${error}`);
    }
  }

  public async changeMetaInfo(
    newMetaInfo: Partial<any> = {}
  ) : Promise<any | undefined> {
    try {
      await this.initialize()
      this.metaInfo = { ...this.metaInfo, ...newMetaInfo };
      this.outBuffer = await new MetaInfoChanger(this.metaInfo).add(this.buffer);
      this.activeMeta = true;
      return this.outBuffer;
    } catch (error) {
      this.activeMeta = false;
      throw new Error(`Error changing meta info: ${error}`);
    }
  }

  public async extractMetaData (data:Buffer) {
    try {
      await this.initialize();
      let metaData = extractMetaData(data);
      return metaData;
    } catch (error) {
      throw new Error(`Error extracting meta data: ${error}`);
    }
  }
}

export default { Sticker, StickerTypes };
