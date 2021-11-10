import axios from 'axios'
import { config } from 'dotenv'
import TelegramBot = require('node-telegram-bot-api')

config()

const token = process.env.TOKEN!

const bot = new TelegramBot(token, { polling: true })

bot.onText(/\/echo (.+)/, (msg, match) => {
  const chatId = msg.chat.id
  const resp = match![1]

  bot.sendMessage(chatId, resp)
})

interface apiResponse {
  data: {
    amount: string
    base: string
    currency: string
  }
}

bot.onText(/\/price (.+)/, async (msg, match) => {
  const chatId = msg.chat.id
  const resp = match![1].toLowerCase()
  let currency: string

  // Joke (not real)
  if (resp === 'redeast' || resp === 're' || resp === 'red') {
    return bot.sendMessage(chatId, 'RE => USD: 1267438.87')
  }

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

// bot.on('message', (msg) => {
//   const chatId = msg.chat.id

//   bot.sendMessage(chatId, 'Received your message')
// })
