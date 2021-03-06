const axios = require('axios')
const cheerio = require('cheerio')
const request = require('request')

const tokens = require('./tokens.json')

const NOTIFY_URL = 'https://notify-api.line.me/api/notify'

const notify = (entry) => {
  const $ = cheerio.load(entry.content)
  const course = $('.take-btn a').attr('href')

  axios.get(course).then((res) => {
    const $ = cheerio.load(res.data)

    const rating = $('.ratingValues').text().trim().replace('(', '').replace(')', '/5')
    const published = $('.rightaTopBoxPrice div:nth-child(6) div:nth-child(2)').text().trim()

    tokens.forEach(function (token) {
      if (token.tags) {
        const found = token.tags.find((tag) => {
          return entry.categories.find((item) => {
            return item._.toLowerCase() === tag.toLowerCase()
          })
        })

        if (!found) {
          console.log(`no matched tags for ${token.name}`)
          return
        }
      }

      const title = entry.title
      const link = entry.link
      const data = {
        url: NOTIFY_URL,
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token.value}`
        },
        formData: {
          message: `${title}\r\nRating: ${rating}\r\nLast updated: ${published}\r\n${link}`
        }
      }

      console.log(`sending notification to ${token.name}...`)

      request.post(data, (err, res) => {
        if (err) {
          console.error(err)
        }
        console.log(res.body)
      })
    })
  })
}

module.exports = {
  notify
}
