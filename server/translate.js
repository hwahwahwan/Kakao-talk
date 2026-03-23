const https = require('https')

// sourceLang 없으면 자동 감지
async function translateToKorean(text, sourceLang) {
  const source = sourceLang ?? 'autodetect'
  const email = process.env.TRANSLATE_EMAIL ?? ''
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${source}|ko&de=${email}`

  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = ''
      res.on('data', (chunk) => (data += chunk))
      res.on('end', () => {
        try {
          const json = JSON.parse(data)
          const translated = json.responseData?.translatedText
          resolve(translated && translated !== text ? translated : null)
        } catch {
          resolve(null)
        }
      })
    }).on('error', (err) => {
      console.error('[번역 실패]', err.message)
      resolve(null)
    })
  })
}

module.exports = { translateToKorean }
