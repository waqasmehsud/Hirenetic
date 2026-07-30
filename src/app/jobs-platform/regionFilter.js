// A job counts as "Pakistan" if it was manually curated (source === 'manual',
// meaning you confirmed it's a real PK posting) OR its location text mentions
// Pakistan or a major Pakistani city — this catches any crawler source that
// happens to surface a real local listing too.

const PK_LOCATION_PATTERN = /pakistan|lahore|karachi|islamabad|rawalpindi|faisalabad|multan|peshawar|quetta|sialkot|gujranwala|hyderabad,\s*pk|\bpk\b/i

export function isPakistanJob(job) {
  if (job.source === 'manual' || job.source === 'njp_gov_pk') return true
  if (job.location && PK_LOCATION_PATTERN.test(job.location)) return true
  return false
}

export function isGlobalJob(job) {
  return !isPakistanJob(job)
}