/** Use the full source pixels, keeping the Scale tool and all trace coordinates in the same frame. */
export function traceRasters({ width, height, data: rgba }: ImageData) {
  const data = new Uint8Array(width * height)
  for (let i = 0; i < data.length; i++)
    data[i] = 0.299 * rgba[i * 4] + 0.587 * rgba[i * 4 + 1] + 0.114 * rgba[i * 4 + 2]
  return { gray: { width, height, data }, rgb: { width, height, data: rgba } }
}
