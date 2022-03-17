import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import type TelegramBot from 'node-telegram-bot-api'

type Offer = {
  title: string
  description: string
  link: string
}

type Offers = Offer[]

const URL =
  'https://mostaql.com/projects?category=development&budget_max=10000&sort=latest'

const chooseOffer = (index: number) => ({
  title: `body > div.wrapper.hsoub-container > div > div.page-body > div > div.row > div.col-md-9 > div > table > tbody > tr:nth-child(${index}) > td > div.card-title_wrapper > div.card--title > h2 > a`,
  description: `body > div.wrapper.hsoub-container > div > div.page-body > div > div.row > div.col-md-9 > div > table > tbody > tr:nth-child(${index}) > td > div:nth-child(2) > div > p > a`,
})

const offersSelectors = [
  chooseOffer(1),
  chooseOffer(2),
  chooseOffer(3),
  chooseOffer(4),
]

puppeteer.use(StealthPlugin())

export default async function checkOffers(bot: TelegramBot) {
  try {
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()

    await page.goto(URL)

    const newOffers: Offers = []

    for (let i = 0; offersSelectors.length > i; i++) {
      const elementTitle = await page.waitForSelector(offersSelectors[i].title)
      const elementDescription = await page.waitForSelector(
        offersSelectors[i].description
      )

      const title = await page.evaluate(
        (element) => element.innerHTML,
        elementTitle
      )
      const description = await page.evaluate(
        (element) => element.innerHTML,
        elementDescription
      )

      const link = await page.evaluate(
        (element) => element.getAttribute('href'),
        elementTitle
      )

      newOffers.push({ title, description, link })
    }

    let message = ''

    newOffers.forEach((offer, index) => {
      message += `<a href="${offer.link}"><b>${index + 1}. ${
        offer.title
      } </b></a>\n${offer.description.trim()}\n\n\n`
    })

    bot.sendMessage(Number(process.env.MAIN_GROUP_ID), message, {
      parse_mode: 'HTML',
    })

    await browser.close()
  } catch (err) {
    console.error(err)
  }
}
