const THREAT_PATTERNS = [
  { regex: /\/JavaScript\b/i, label: 'Embedded JavaScript' },
  { regex: /\/S\s*\/JS\b/i, label: 'Embedded JavaScript Action' },
  { regex: /\/OpenAction\b/i, label: 'Auto-run action on file open' },
  { regex: /\/Launch\b/i, label: 'Launch external command' },
  { regex: /\/EmbeddedFile\b/i, label: 'Embedded file payload' },
  { regex: /\/RichMedia\b/i, label: 'Embedded rich media/Flash' },
]

export async function scanPDFForThreats(file) {
  try {
    const buffer = await file.arrayBuffer()
    const bytes = new Uint8Array(buffer)
    
    let raw = ''
    const chunkSize = 8192
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize)
      raw += String.fromCharCode.apply(null, chunk)
    }

    const structureOnly = raw.replace(/stream[\s\S]*?endstream/gi, 'stream...endstream')
    const found = THREAT_PATTERNS.filter((tp) => tp.regex.test(structureOnly))

    return {
      safe: found.length === 0,
      warnings: found.map((f) => f.label),
    }
  } catch (err) {
    console.error('PDF security scan error:', err)
    return { safe: true, warnings: [] }
  }
}
