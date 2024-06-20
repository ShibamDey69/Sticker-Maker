import { exec } from "child_process";
import { join } from "path";
import { readFile, writeFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { promisify } from "util";
import { MetaDataType } from "../types/metaInfoType";
import { StickerTypes } from "../types/StickerTypes";
const execAsync = promisify(exec);

/**
 * Converts input buffer to WebP format with optional metadata and background color.
 * @param buffer The input buffer to convert.
 * @param metaInfo Optional metadata for the converted WebP.
 * @param mimeExt File extension of the input buffer.
 * @param mimeType MIME type of the input buffer.
 * @returns Promise<Buffer | undefined> A Promise resolving to the converted content as Buffer.
 * @throws Error if conversion fails.
 */
const ToWebp = async (
  buffer: Buffer,
  metaInfo: Partial<MetaDataType>,
  mimeExt: string | undefined,
  mimeType: string | undefined,
): Promise<Buffer | undefined> => {
  const inputPath = join(tmpdir(), `${Date.now()}.${mimeExt}`);
  const outputPath = join(tmpdir(), `${Date.now()}.webp`);

  try {
    // Write input buffer to temporary file
    await writeFile(inputPath, buffer);

    // Construct arguments for ffmpeg conversion
    const args: string[] = [
      "-i",
      inputPath,
      metaInfo.type === StickerTypes.CIRCLE && !metaInfo.background
        ? StickerTypes.CIRCLE
        : metaInfo.type === StickerTypes.SQUARE && !metaInfo.background
          ? StickerTypes.SQUARE
          : metaInfo.type === StickerTypes.FIT && !metaInfo.background
            ? StickerTypes.FIT
            : "",
      metaInfo.background
        ? metaInfo.type === StickerTypes.CIRCLE
          ? StickerTypes.CIRCLE
          : `-filter_complex "color=${metaInfo.background} [c]; [c][0]scale2ref[cs][0s];[cs][0s]overlay=shortest=1, unsharp=3:3:0.5 ${
              metaInfo.type === StickerTypes.SQUARE ||
              metaInfo.type === StickerTypes.FIT
                ? `, ${metaInfo.type.replaceAll("-vf", "").replaceAll('"', "").trim()}`
                : ""
            }"`
        : "-pix_fmt yuva420p",
      mimeExt?.includes("gif") || mimeType?.includes("video")
        ? [
            "-c:v libwebp_anim",
            "-auto-alt-ref 0",
            "-lag-in-frames 0",
            "-preset default",
            "-loop 0",
            "-r 19",
            '-metadata:s:v:0 alpha_mode="1"',
            mimeExt === "gif" ? "-lossless 1" : "-lossless 0",
          ].join(" ")
        : "-c:v libwebp",
      metaInfo.author ? `-metadata author="${metaInfo.author}"` : "",
      metaInfo.pack ? `-metadata title="${metaInfo.pack}"` : "",
      metaInfo.id ? `-metadata id="${metaInfo.id}"` : "",
      metaInfo.category?.length
        ? `-metadata category="${metaInfo.category.join(",")}"`
        : "",
      "-q:v",
      `${metaInfo.quality}`,
      "-y",
      outputPath,
    ];

    // Execute ffmpeg command with constructed arguments
    await execAsync(`ffmpeg ${args.join(" ")}`);

    // Read converted WebP file back into a buffer
    const outputBuffer = await readFile(outputPath);
    return outputBuffer;
  } catch (error) {
    console.error(`Conversion error: ${error}`);
    throw new Error(`Conversion failed: ${error}`);
  } finally {
    // Cleanup temporary files
    await cleanup(inputPath, outputPath);
  }

  /**
   * Cleans up temporary files used during conversion.
   * @param inputPath Path to the input temporary file.
   * @param outputPath Path to the output temporary file.
   */
  async function cleanup(inputPath: string, outputPath: string): Promise<void> {
    try {
      await Promise.all([unlink(inputPath), unlink(outputPath)]);
    } catch (unlinkError) {
      console.error("Error cleaning output file:", unlinkError);
    }
  }
};

export default ToWebp;
