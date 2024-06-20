# @shibam/sticker-maker

`@shibam/sticker-maker` is a utility library for converting images and videos to stickers with customizable metadata. It supports various input types and ensures high-quality sticker conversion.

## Installation
# ⚠️ Before installing this make sure you have downloaded ffmpeg 
   
You can install the package using npm:

```sh
npm install @shibam/sticker-maker
```

## Usage

Here's a basic example of how to use the `Sticker` class from the library:

```typescript
import { Sticker, StickerTypes } from "@shibam/sticker-maker";

// Create a new Sticker instance
const sticker = new Sticker("path/to/image.png", {
  pack: "My Sticker Pack",
  author: "Shibam",
  id: "123467890",
  category: ['😂','😹'],
  type: StickerTypes.DEFAULT, // (Recommended)
  quality: 30, //by default automatically detected using buffer size
  background: "red" //by default transparent
});

// Convert the sticker to a buffer
 await sticker.toBuffer()

// Convert the sticker and save it to a file
await sticker.toFile("path/to/output.webp")
```
## Module 

### Class: `Sticker`

#### Constructor

```typescript
new Sticker(data: Buffer | string | Readable, metaInfo?: Partial<MetaDataType>)
```

- `data`: The input data for the sticker. It can be a Buffer, a file path as a string, or a Readable stream.
- `metaInfo` (optional): An object containing metadata about the sticker.

#### Methods

##### `toBuffer(): Promise<Buffer>`

Converts the input data to a Buffer containing the converted sticker content.

##### `toFile(outputPath: string): Promise<void>`

Converts the input data and writes the converted sticker to a file at the specified output path.

### Types

#### `MetaDataType`

Metadata information for the sticker.

```typescript
interface MetaDataType {
  pack: string;
  author: string;
  id: string;
  category: string[];
  type: StickerTypes;
  quality: number;
  background?: string;
}
```

#### `StickerTypes`

An enumeration of possible sticker types.

```typescript
enum StickerTypes {
  DEFAULT,
  CIRCLE,
  SQUARE,
  FIT
}
```

## License

MIT License


This README provides an overview of how to install, use, and understand the module of your `@shibam/sticker-formatter` package. You can modify it as needed to better fit the specifics of your library and any additional features or requirements you might have.if you wanna contribute feel free to contribute. <⁠(⁠￣⁠︶⁠￣⁠)⁠>
