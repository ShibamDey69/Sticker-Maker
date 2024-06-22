import { exec } from 'child_process'
import { promisify } from 'util'
import { tmpdir } from 'os'
import { join } from 'path'
const execAsync = promisify(exec)

export default async function toGif(inputPath: string): Promise<string> {
    let outputPath = join(tmpdir(), `${Date.now()}.gif`)
    try {
        let args = `ffmpeg -i ${inputPath} -vf "fps=10,scale=320:-1:flags=lanczos" -t 7 -c:v gif -r 15 -preset slow -pix_fmt rgb24 ${outputPath}`
        await execAsync(args)
        return outputPath ?? ''
    } catch (error: unknown) {
        throw Error(`Error converting to gif: ${error}`)
    }
}
