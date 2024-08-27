import TextOnGif from 'text-on-gif'

const textOnGif = async (fileName:string, text:string):Promise<Buffer> => {
    return new Promise(async (resolve, reject) => {
        try {
            const gif = new TextOnGif({
                file_path: fileName,
                font_size: "32px",
                font_color: "white",
                font_family: "Arial",
                stroke_color: "black",
                stroke_width: 3,
            });
            const buff = await gif.textOnGif({
                text,
                get_as_buffer: true,
            });
            resolve(buff);
        } catch (error) {
            reject(error);
        }
    });
};

export default textOnGif
