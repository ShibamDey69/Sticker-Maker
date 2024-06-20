import fs from "fs";
import { Readable } from "stream";
import Utils from "./lib/utils";
import convert from "./lib/ToWebp";
import { MetaDataType } from "./types/metaInfoType";
import { StickerTypes } from "./types/StickerTypes";

class Sticker {
  private buffer: Buffer;
  private mimeType: string | undefined;
  private extType: string | undefined;
  private utils = new Utils();

  constructor(
    private data: Buffer | string | Readable,
    public metaInfo: Partial<MetaDataType> = {}
  ) {
    this.buffer = Buffer.from([]);
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
      this.metaInfo.author = this.metaInfo.author ?? "";
      this.metaInfo.id = this.metaInfo.id ?? this.utils.getId();
      this.metaInfo.category = this.metaInfo.category ?? [];
      this.metaInfo.type = this.metaInfo.type ?? StickerTypes.DEFAULT;
      this.metaInfo.quality =
        this.metaInfo.quality ?? this.utils.getQuality(this.buffer);
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
      const bufferData = await convert(
        this.buffer,
        this.metaInfo,
        this.extType,
        this.mimeType
      );
      return bufferData ?? Buffer.from([]);
    } catch (error) {
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
      const buffer = await this.toBuffer();
      await fs.promises.writeFile(outputPath, buffer);
    } catch (error) {
      console.error(`Error converting to file: ${error}`);
      throw new Error(`Conversion to file failed: ${error}`);
    }
  }
}

export default { Sticker, StickerTypes }

const data = fs.readFileSync("input.gif");
await new Sticker(data,{
  pack: "test",
  author: "test",
  id: "test",
  category: ["😂","😹"],
  type: StickerTypes.CIRCLE,
  quality: 100,
  background: "red"
}).toFile("lol.webp");