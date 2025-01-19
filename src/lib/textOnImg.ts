import { CanvasRenderingContext2D, createCanvas, loadImage } from 'canvas'
import { Stream } from 'stream'

export default class TextOnImage {
    fontSize
    maxCharsPerLine

    constructor(maxCharsPerLine = 25) {
        this.fontSize = 175
        this.maxCharsPerLine = maxCharsPerLine
    }

    wrapText(ctx: CanvasRenderingContext2D, text: string) {
        const words = text.split(' ')
        let lines = []
        let currentLine = words[0]

        for (let i = 1; i < words.length; i++) {
            const word = words[i]
            const testLine = `${currentLine} ${word}`
            const { width: testWidth } = ctx.measureText(testLine)

            if (testWidth > ctx.canvas.width * 0.9) {
                lines.push(currentLine)
                currentLine = word
            } else {
                currentLine = testLine
            }
        }

        lines.push(currentLine)
        return lines
    }

    async drawText(imageBuffer: string | Buffer, text: string, padding = { x: 10, y: 10 }) {
        const image = await loadImage(imageBuffer)
        const canvas = createCanvas(image.width, image.height)
        const ctx = canvas.getContext('2d')

        // Draw the image on canvas
        ctx.drawImage(image, 0, 0)

        // Calculate font size based on image height
        this.fontSize = Math.floor(image.height / 10)
        ctx.font = `bold ${this.fontSize}px Arial`
        ctx.fillStyle = 'white'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.lineWidth = 4
        ctx.strokeStyle = 'black'

        // Wrap the text to fit within the canvas width
        const lines = this.wrapText(ctx, text)
        const lineHeight = this.fontSize * 1.2
        const totalTextHeight = lines.length * lineHeight

        // If text height exceeds image height, adjust font size
        if (totalTextHeight + 2 * padding.y > canvas.height) {
            this.fontSize = Math.floor((canvas.height - 2 * padding.y) / (lines.length * 1.2))
            ctx.font = `bold ${this.fontSize}px Arial`
        }

        // Start text positioning at the bottom, above padding
        let y = canvas.height - totalTextHeight - padding.y

        // Draw each line of text with stroke and fill for better contrast
        lines.forEach((line) => {
            const x = canvas.width / 2
            ctx.strokeText(line, x, y)
            ctx.fillText(line, x, y)
            y += lineHeight
        })

        return canvas.toBuffer('image/png')
    }
}
