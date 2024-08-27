declare module 'text-on-gif' {
  export interface TextOnGifOptions {
    file_path?: string;
    font_size?: string;
    font_color?: string;
    font_family?: string;
    stroke_color?: string;
    stroke_width?: number;
    text?: string;
    get_as_buffer?: boolean;
  }

  export class TextOnGif {
    constructor(options: TextOnGifOptions)
    textOnGif(options: TextOnGifOptions): Promise<Buffer>;
  }

  export default TextOnGif;
}