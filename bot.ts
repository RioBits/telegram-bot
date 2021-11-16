import axios from 'axios'
import { config } from 'dotenv'
import TelegramBot = require('node-telegram-bot-api')

config()

const token = process.env.TOKEN!

const bot = new TelegramBot(token, { polling: true })

interface exchangerateApiResponse {
  success: boolean
  base: string
  date: string
  rates: {
    TRY: number
    EUR: number
    USD: number
    SAR: number
    AED: number
  }
}

interface coinbaseApiResponse {
  data: {
    amount: string
    base: string
    currency: string
  }
}

bot.onText(/^\/help$/, async (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `This is a list of all my commands!\n\n/price: Show USD price in: TRY, EUR, SAR, AED\n\n/price <currency>: Show <currency> price in: TRY, EUR, USD, SAR, AED\n\n/crypto: Show BTC USD DOGE price in USD\n\n/crypto <crypto_code>: Show <crypto_code> in USD`
  )
})

bot.onText(/^\/crypto$/, async (msg) => {
  const chatId = msg.chat.id

  const {
    data: {
      data: { amount: BtcAmount },
    },
  } = await axios.get<coinbaseApiResponse>(
    `https://api.coinbase.com/v2/prices/BTC-USD/spot`
  )
  const {
    data: {
      data: { amount: EthAmount },
    },
  } = await axios.get<coinbaseApiResponse>(
    `https://api.coinbase.com/v2/prices/ETH-USD/spot`
  )
  const {
    data: {
      data: { amount: DogeAmount },
    },
  } = await axios.get<coinbaseApiResponse>(
    `https://api.coinbase.com/v2/prices/DOGE-USD/spot`
  )

  return bot.sendMessage(
    chatId,
    `BTC => USD: ${withCommas(BtcAmount)}\nETH => USD: ${withCommas(
      EthAmount
    )}\nDOGE => USD: ${withCommas(DogeAmount)}\n`
  )
})

bot.onText(/\/crypto (.+)/, async (msg, match) => {
  const chatId = msg.chat.id
  const resp = match![1].toLowerCase()
  let currency: string

  switch (resp) {
    case 'bitcoin':
      currency = 'BTC'
      break
    case 'ethereum':
    case 'ether':
      currency = 'ETH'
      break
    case 'shiba':
      currency = 'SHIB'
      break
    default:
      currency = ''
  }

  try {
    const response = await axios.get<coinbaseApiResponse>(
      `https://api.coinbase.com/v2/prices/${
        currency || resp.toUpperCase()
      }-USD/spot`
    )

    const { data } = response.data

    bot.sendMessage(chatId, `${data.base} => USD: ${withCommas(data.amount)}`)
  } catch (err) {
    console.error(err)
    bot.sendMessage(
      chatId,
      'Please enter a valid cryptocurrency: BTC/ETH/DOGE etc..'
    )
  }
})

bot.onText(/^\/price$/, async (msg) => {
  const chatId = msg.chat.id

  try {
    const response = await axios.get<exchangerateApiResponse>(
      `https://api.exchangerate.host/latest?base=USD`
    )

    const { success, date, rates } = response.data

    if (response.status !== 200 || !response.data || !success) {
      throw new Error()
    }

    bot.sendMessage(
      chatId,
      `Choosed default: USD\n\nTRY: ${fixed2(rates.TRY)}\n\nEUR: ${fixed2(
        rates.EUR
      )}\n\nSAR: ${fixed2(rates.SAR)}\n\nAED: ${fixed2(
        rates.AED
      )}\n\nDate: ${date}`
    )
  } catch (err) {
    console.error(err)
    bot.sendMessage(chatId, 'ERROR WHILE FETCHING THE DATA')
  }
})

bot.onText(/\/price (.+)/, async (msg, match) => {
  const chatId = msg.chat.id
  const resp = match![1].toUpperCase()

  try {
    const response = await axios.get<exchangerateApiResponse>(
      `https://api.exchangerate.host/latest?base=${resp}`
    )

    const { success, base, date, rates } = response.data

    if (response.status !== 200 || !response.data || !success) {
      throw new Error()
    }

    // API default if you typed incorrect currency: EURO
    if (base !== resp) {
      bot.sendMessage(
        chatId,
        `You entered incorrect currency!\ntry something like this:\n\n/price TRY\n\nchoosed default: EURO\n\nBase: ${base}\n\nTRY: ${fixed2(
          rates.TRY
        )}\n\nEUR: ${fixed2(rates.EUR)}\n\nUSD: ${fixed2(
          rates.USD
        )}\n\nSAR: ${fixed2(rates.SAR)}\n\nAED: ${fixed2(
          rates.AED
        )}\n\nDate: ${date}`
      )
    } else {
      bot.sendMessage(
        chatId,
        `Base: ${base}\n\nTRY: ${fixed2(rates.TRY)}\n\nEUR: ${fixed2(
          rates.EUR
        )}\n\nUSD: ${fixed2(rates.USD)}\n\nSAR: ${fixed2(
          rates.SAR
        )}\n\nAED: ${fixed2(rates.AED)}\n\nDate: ${date}`
      )
    }
  } catch (err) {
    console.error(err)
    bot.sendMessage(chatId, 'ERROR WHILE FETCHING THE DATA')
  }
})

function withCommas(value: string) {
  return Number(value).toLocaleString('en-us')
}

function fixed2(value: number) {
  return (Math.round(value * 100) / 100).toFixed(2)
}
