// how often should I fetch site info (in ms)
export const density = 30 * 1000 // 30sec
// how long should I save site info (in ms)
export const limit = 5 * 24 * 60 * 60 * 1000 // 5d
// api/v1/siteInfo response offset
export const fromOffset = 8 * 60 * 60 * 1000 // 8h

// admin request token
export const adminToken = process.env.API_TOKEN || '___PLEASE_USE_THE_ENV-FILE___'
// frontend access ips
export const accessIps = 'ACCESS_IPS' in process.env ? process.env.ACCESS_IPS.split(',') : []
