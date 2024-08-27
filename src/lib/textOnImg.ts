import { createCanvas, loadImage } from 'canvas';

export default class TextOnImage {
    private fontSize: number;
    private maxCharsPerLine: number;
    constructor(maxCharsPerLine = 18) {
        this.fontSize = 120;
        this.maxCharsPerLine = maxCharsPerLine;
    }

    wrapText(ctx:any, text:string) {
        const words = text.split(' ');
        let lines = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const testLine = `${currentLine} ${word}`;
            if (testLine.length > this.maxCharsPerLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }
        lines.push(currentLine);
        return lines;
    }

    async drawText(imageBuffer:Buffer, text:string, padding = { x: 10, y: 10 }) {
        const image = await loadImage(imageBuffer);
        const canvas = createCanvas(image.width, image.height);
        const ctx = canvas.getContext('2d');

        ctx.drawImage(image, 0, 0);

        ctx.font = `bold ${this.fontSize}px Arial`;
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.lineWidth = 6;
        ctx.strokeStyle = 'black';

        const lines = this.wrapText(ctx, text);

        const lineHeight = this.fontSize * 1.2;
        const totalTextHeight = lines.length * lineHeight;

        if (totalTextHeight + (2 * padding.y) > canvas.height) {
            this.fontSize = (canvas.height - (2 * padding.y)) / (lines.length * 1.2);
            ctx.font = `bold ${this.fontSize}px Arial`;
        }

        let y = canvas.height - totalTextHeight - padding.y;

        lines.forEach(line => {
            let x = canvas.width / 2;
            ctx.strokeText(line, x, y);
            ctx.fillText(line, x, y);
            y += lineHeight;
        });

        return canvas.toBuffer('image/png');
    }
}