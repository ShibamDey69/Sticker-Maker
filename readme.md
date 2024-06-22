# @shibam/sticker-maker

`@shibam/sticker-maker` is a lightweight utility library designed for converting images and videos into stickers while allowing customization of metadata. It supports various input types and ensures high-quality sticker conversion. This module has minimal dependencies, ensuring efficient performance. If you encounter any issues, please feel free to open an issue. However, please check if a similar issue has already been reported before creating a new one. Happy Coding (⁠≧⁠▽⁠≦⁠).

# Sticker Class

The `Sticker` class is a utility for converting images and videos into sticker format, with options for metadata customization and manipulation.

## Installation
# ⚠️ Before installing this make sure you have downloaded ffmpeg 
   
You can install the package using npm:

```sh
npm install @shibam/sticker-maker
```
## Usage

Here's how you can use the `Sticker` class:

```typescript
import fs from "fs";
import { Readable } from "stream";
import { Sticker, StickerTypes } from "@shibam/sticker-maker";

// Example 1: Create a new sticker instance and convert to buffer
const sticker = new Sticker("path/to/image.png", {
  pack: "My Sticker Pack",
  author: "Shibam",
  id: "123467890",
  category: ['😂','😹'],
  type: StickerTypes.DEFAULT,
  quality: 30,
  background: "red"
});

try {
  const buffer = await sticker.toBuffer();
  console.log("Sticker converted to buffer:", buffer);
} catch (error) {
  console.error("Error converting sticker to buffer:", error);
}

// Example 2: Create a new sticker instance and convert to file
const sticker2 = new Sticker("path/to/another/image.png", {
  pack: "Another Sticker Pack",
  author: "John Doe",
  id: "987654321",
  category: ['😊','👍'],
  type: StickerTypes.CIRCLE,
  quality: 50,
  background: "blue"
});

try {
  await sticker2.toFile("path/to/output.webp");
  console.log("Sticker converted and saved to file successfully.");
} catch (error) {
  console.error("Error converting sticker to file:", error);
}
```

## Class: `Sticker`

### Constructor

```typescript
new Sticker(data: Buffer | string | Readable, metaInfo?: Partial<MetaDataType>)
```

- `data`: Input data for the sticker. Can be a Buffer, file path as a string, or Readable stream.
- `metaInfo` (optional): Metadata about the sticker.

### Methods

#### `toBuffer(): Promise<Buffer>`

Converts input data to a Buffer containing the converted sticker content.

#### `toFile(outputPath: string): Promise<void>`

Converts input data and writes the converted sticker to a file at `outputPath`.

#### `changeMetaInfo(newMetaInfo: Partial<any>): Promise<any | undefined>`

Updates metadata information with `newMetaInfo` and applies changes to the sticker.

#### `extractMetaData(data: Buffer): Promise<any>`

Extracts metadata from `data` and returns the extracted information.

## Types

### `StickerTypes`

An enum specifying different types of stickers:

```typescript
enum StickerTypes {
  DEFAULT,
  CIRCLE,
  SQUARE,
  FIT
}
```

## License

This package is licensed under the MIT License.

## Contributing

Contributions are welcome. Feel free to open issues or submit pull requests on [GitHub](https://github.com/your/repository).

---

This README provides an overview of the `Sticker` class functionalities, installation instructions, examples of usage, information about types used, and guidelines for contributing to the project. Adjust paths and additional details based on your actual implementation and repository setup.