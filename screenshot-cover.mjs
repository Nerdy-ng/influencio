import puppeteer from 'puppeteer'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const filePath = resolve(__dirname, 'fb-cover-preview.html')

const browser = await puppeteer.launch({ headless: 'new' })
const page = await browser.newPage()
await page.setViewport({ width: 900, height: 400 })
await page.goto(`file://${filePath}`, { waitUntil: 'networkidle0' })

// Screenshot just the .cover element
const cover = await page.$('.cover')
await cover.screenshot({
  path: resolve(__dirname, 'brandior-fb-cover.jpg'),
  type: 'jpeg',
  quality: 100,
})

await browser.close()
console.log('Saved: brandior-fb-cover.jpg')
