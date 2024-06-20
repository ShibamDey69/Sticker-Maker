import { Readable } from "stream";
import fs from "fs";
import { fileTypeFromBuffer } from "file-type";

export default class Utils {

  constructor() {}

  /**
   * Converts various types of input data to a Buffer.
   * @param data Input data as Buffer, string (file path), or Readable stream.
   * @returns Promise<Buffer> A Promise resolving to the converted Buffer.
   * @throws Error if conversion fails.
   */
  async buffer(data: Buffer | string | Readable): Promise<Buffer> {
    try {
      const buffer =
        typeof data === "string"
          ? await fs.promises.readFile(data)
          : data instanceof Readable
            ? await this.streamToBuffer(data)
            : Buffer.from(data);
      return buffer;
    } catch (error) {
      throw new Error(`Error converting to buffer: ${error}`);
    }
  }

  /**
   * Converts a Readable stream to a Buffer.
   * @param stream Readable stream to convert.
   * @returns Promise<Buffer> A Promise resolving to the converted Buffer.
   */
  async streamToBuffer(stream: Readable): Promise<Buffer> {
    const chunks: Buffer[] = [];

    return new Promise<Buffer>((resolve, reject) => {
      stream.on("data", (chunk: any) => {
        if (Buffer.isBuffer(chunk)) {
          chunks.push(chunk);
        } else {
          chunks.push(Buffer.from(chunk));
        }
      });

      stream.on("end", () => {
        resolve(Buffer.concat(chunks));
      });

      stream.on("error", (err: any) => {
        reject(err);
      });
    });
  }

  /**
   * Determines the quality of the data based on its size.
   * @param data Buffer containing the data.
   * @returns number Quality value based on data size.
   */
  getQuality(data: Buffer): number {
    let buffer = Buffer.from(data);
    let bytes = buffer.length/1024;
    let quality = bytes > 4 * 1024 ? 8 : bytes > 3 * 1024 ? 10 : bytes > 2 * 1024 ? 12 : 15;
    return quality;
  }

  /**
   * Determines the MIME type of the data buffer.
   * @param data Buffer containing the data.
   * @returns Promise<{ mime: string; ext: string }> A Promise resolving to an object with MIME type and extension.
   */
  async getMimeType(
    data: Buffer,
  ): Promise<{ mime: string; ext: string } | undefined> {
    try {
      const fileType = await fileTypeFromBuffer(data);
      return fileType;
    } catch (error) {
      console.error(`Error getting MIME type: ${error}`);
      return undefined;
    }
  }

  /**
   * Generates a random ID.
   * @returns string A random alphanumeric ID.
   */
  getId(): string {
    return [...Array(5)]
      .map(() => Math.random().toString(36).substring(2, 15))
      .join("");
  }
}
