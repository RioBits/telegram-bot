import axios from 'axios'
import { config } from 'dotenv'
import TelegramBot = require('node-telegram-bot-api')

config()

const token = process.env.TOKEN!

const bot = new TelegramBot(token, { polling: true })

interface apiResponse {
  data: {
    amount: string
    base: string
    currency: string
  }
}

bot.onText(/\/price/, async (msg) => {
  const chatId = msg.chat.id

  const {
    data: {
      data: { amount: BtcAmount },
    },
  } = await axios.get<apiResponse>(
    `https://api.coinbase.com/v2/prices/BTC-USD/spot`
  )
  const {
    data: {
      data: { amount: EthAmount },
    },
  } = await axios.get<apiResponse>(
    `https://api.coinbase.com/v2/prices/ETH-USD/spot`
  )
  const {
    data: {
      data: { amount: DogeAmount },
    },
  } = await axios.get<apiResponse>(
    `https://api.coinbase.com/v2/prices/DOGE-USD/spot`
  )

  return bot.sendMessage(
    chatId,
    `BTC => USD: ${BtcAmount}\nETH => USD: ${EthAmount}\nDOGE => USD: ${DogeAmount}\n`
  )
})

bot.onText(/\/price (.+)/, async (msg, match) => {
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
    const response = await axios.get<apiResponse>(
      `https://api.coinbase.com/v2/prices/${
        currency || resp.toUpperCase()
      }-USD/spot`
    )

    const { data } = response.data

    bot.sendMessage(chatId, `${data.base} => USD: ${data.amount}`)
  } catch (err) {
    console.error(err)
    bot.sendMessage(
      chatId,
      'Please enter a valid cryptocurrency: BTC/ETH/DOGE etc..'
    )
  }
})
