
interface Metadata {
    [key: string]: string;
}

function readCustomMetadata(buffer: Buffer): Metadata | null {
    try {
        if (buffer.slice(0, 4).toString('hex') !== '52494646') {
            throw new Error('Buffer does not contain WebP format');
        }

        let offset = 12;
        while (offset < buffer.length) {
            const chunkID = buffer.slice(offset, offset + 4).toString('ascii');
            const chunkSize = buffer.readUIntLE(offset + 4, 4);
            if (chunkID === 'VP8X' || chunkID === 'EXIF' || chunkID === 'ICCP') {
                const metadataStartOffset = offset + 8;
                const metadata = buffer.slice(metadataStartOffset, metadataStartOffset + chunkSize);
                console.log(metadataStartOffset)
                const parsedMetadata = parseMetadataBuffer(metadata);
                return parsedMetadata;
            }

            offset += 8 + chunkSize;
        }

        throw new Error('No custom metadata found in WebP file');

    } catch (error: unknown) {
        console.error('Error reading WebP custom metadata:', error);
        return null;
    }
}

function parseMetadataBuffer(metadata: Buffer): Metadata {
    const metadataString = metadata.toString('utf8');
    const parsedMetadata: Metadata = {};
    const lines = metadataString.split('\n');
    lines.forEach(line => {
        const keyValue = line.split(':');
        if (keyValue.length === 2) {
            const key = keyValue[0].trim();
            const value = keyValue[1].trim();
            parsedMetadata[key] = value;
        }
    });
    return parsedMetadata;
}

export default readCustomMetadata;