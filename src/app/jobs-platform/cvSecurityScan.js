// Scans a PDF's structural metadata for malicious PDF action tags
// (embedded JavaScript, auto-launch triggers, embedded files).
//
// Binary stream contents (between 'stream' and 'endstream') are ignored
// to prevent false positives from random byte sequences in compressed data.

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
    
    // Convert bytes to ASCII string for structural analysis
    let raw = ''
    const chunkSize = 8192
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize)
      raw += String.fromCharCode.apply(null, chunk)
    }

    // Remove binary stream contents to avoid false positives in compressed data
    const structureOnly = raw.replace(/stream[\s\S]*?endstream/gi, 'stream...endstream')

    const found = THREAT_PATTERNS.filter((tp) => tp.regex.test(structureOnly))

    return {
      safe: found.length === 0,
      warnings: found.map((f) => f.label),
    }
  } catch (err) {
    console.error('PDF security scan error:', err)
    // If scanning fails for any reason, allow file to proceed rather than blocking user
    return { safe: true, warnings: [] }
  }
}