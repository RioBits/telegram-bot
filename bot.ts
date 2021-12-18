import axios from 'axios'
import { config } from 'dotenv'
import TelegramBot = require('node-telegram-bot-api')
import { stringify } from 'querystring'

import symb from './funcs/symbol'
import fnArgs from './funcs/financeArg'


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

bot.onText(/^\/scream (.+)$/, (msg: any, match: any) => {
  const chatId = msg.chat.id
  const resp = Number(match![1])

  if (resp > 10 || resp < 0) {
    return bot.sendMessage(
      chatId,
      `choose between 1 - 10 times\nexample: /scream 99453246239`
    )
  }

  let count = 1
  let scream = setInterval(() => {
    bot.sendMessage(
      chatId,
      `@riobits @nyllre @x7thxo @CLK944 @p16d0 @U_D3L @Sab_o04 <a href="https://www.youtube.com/watch?v=xvFZjo5PgG0">@Mark Zuckerberg</a>`,
      { parse_mode: 'HTML', disable_web_page_preview: true }
    )

    if (count === resp) {
      clearInterval(scream)
    }
    count++
  }, 1000)
})

bot.onText(/^\/all$/, (msg: any) => {
  bot.sendMessage(
    msg.chat.id,
    `@riobits @nyllre @x7thxo @CLK944 @p16d0 [@Mark Zuckerberg](https://www.youtube.com/watch?v=xvFZjo5PgG0)`,
    { parse_mode: 'MarkdownV2', disable_web_page_preview: true }
  )
})

bot.onText(/^\/start$/, (msg: any) => {
  bot.sendMessage(
    msg.chat.id,
    `This is a list of all my commands!\n\n/price: Show USD price in: TRY, EUR, SAR, AED\n\n/price <currency>: Show <currency> price in: TRY, EUR, USD, SAR, AED\n\n/crypto: Show BTC USD DOGE price in USD\n\n/crypto <crypto_code>: Show <crypto_code> in USD\n\nAdvanced:\n\n/fn try 60m 1m: display <asset> changes\n\n/symbol <name> <details:optional>: search for a companies asset name`
  )
})

bot.onText(/^\/help$/, (msg:any) => {
  bot.sendMessage(
    msg.chat.id,
    `This is a list of all my commands!\n\n/price: Show USD price in: TRY, EUR, SAR, AED\n\n/price <currency>: Show <currency> price in: TRY, EUR, USD, SAR, AED\n\n/crypto: Show BTC USD DOGE price in USD\n\n/crypto <crypto_code>: Show <crypto_code> in USD\n\nAdvanced:\n\n/finance <asset> <range> <interval>: display <asset> changes\n\n/symbol <name> <details:optional>: search for a companies asset name`
  )
})

bot.onText(/^\/crypto$/, async (msg:any) => {
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

bot.onText(/\/crypto (.+)/, async (msg: any, match:any) => {
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
    bot.sendMessage(
      chatId,
      'Please enter a valid cryptocurrency: BTC/ETH/DOGE etc..'
    )
  }
})

bot.onText(/^\/price$/, async (msg) => {

  var options: any = {
    method: 'GET',
    url: 'https://stock-data-yahoo-finance-alternative.p.rapidapi.com/v6/finance/quote',
    params: {symbols: 'TRY=X,BTC-USD,ETH-USD,EURUSD=X'},
    headers: {
      'x-rapidapi-host': 'stock-data-yahoo-finance-alternative.p.rapidapi.com',
      'x-rapidapi-key': '27f4a46847mshdb18aa5242e2e64p1fa70fjsnce9d0b4b1087'
    }
  }

  var data:any
  await axios.request(options)
    .then( res => {
      data = ""

      let first = res.data['quoteResponse']['result']
      console.log(first)
      for (let i = 0; i < first.length; i++) {
        data += `${first[i]['shortName']}: ${first[i]["regularMarketPrice"]} \n${first[i]['regularMarketDayRange']} \n\n`
      }
      
    })
    .catch( err => data = err )

  await bot.sendMessage(msg.chat.id, `${data}`)
})

bot.onText(/\/price (.+)/, async (msg, match) => {
  var prompt: any = match![1].split(" ")[0].toUpperCase()
  console.log(prompt)
  prompt = prompt.replace('TRY', 'TRY=X')
  prompt = prompt.replace('BTC', 'BTC-USD')
  prompt = prompt.replace('ETH', 'ETH-USD')
  prompt = prompt.replace('DOGE', 'DOGE-USD')
  console.log(prompt)
  var options: any = {
    method: 'GET',
    url: 'https://stock-data-yahoo-finance-alternative.p.rapidapi.com/v6/finance/quote',
    params: {symbols: `${prompt}`},
    headers: {
      'x-rapidapi-host': 'stock-data-yahoo-finance-alternative.p.rapidapi.com',
      'x-rapidapi-key': '27f4a46847mshdb18aa5242e2e64p1fa70fjsnce9d0b4b1087'
    }
  }

  var data:any
  await axios.request(options)
    .then( res => {
      data = ""

      let first = res.data['quoteResponse']['result']
      console.log(first)

      if (first.length >= 2) {

        for (let i = 0; i < first.length; i++) {
          data += `${first[i]['shortName']}: ${first[i]['regularMarketPrice']} \n\n`
        }

      } else {
        data = `${first[0]['shortName']}: ${first[0]['regularMarketPrice']}`
      }
    })
    .catch( err => data = `wrong symbol, try searching with /symbol` )

  await bot.sendMessage(msg.chat.id, `${data}`)
})

bot.onText(/\/sendToGroup (.+)/, async (msg, match) => {
  const chatId: number = msg.chat.id
  const prompt: any = match![1].split(" =>")
  const target = prompt[0]
  const toSend = prompt[1]
  // -1001729428661
  await bot.sendMessage(target, `${toSend}`)
})

bot.onText(/\/eval (.+)/, (msg:any, match:any) => {
  const chatId = msg.chat.id
  const resp = match![1]

  if (resp.includes('while') || resp.includes('for')) {
    bot.sendMessage(chatId, `shut the fuck up`)
  } else if (resp == '"I\'m a dumb bot"') {
    bot.sendMessage(chatId, `ur a dumb human`)
  } else {
    try {
      bot.sendMessage(chatId, `${eval(resp)}`)
    } catch (err) {
      bot.sendMessage(chatId, `${err}`)
    }
  }
})

bot.onText(/^\/fn$/, async (msg) => {
  const chatId: number = msg.chat.id
  var symbol: string = "TRY=X"
  var range: string = "4h"
  var interval: string = "15m"
  var listed = true

  var data:any
  var options:any = {
    method: 'GET',
    url: 'https://stock-data-yahoo-finance-alternative.p.rapidapi.com/v8/finance/spark',
    params: {symbols: symbol, range: range, interval: interval},
    headers: {
      'x-rapidapi-host': 'stock-data-yahoo-finance-alternative.p.rapidapi.com',
      'x-rapidapi-key': '27f4a46847mshdb18aa5242e2e64p1fa70fjsnce9d0b4b1087'
    }
  }
  await axios.request(options)
    .then( res => {
      let first = res.data[`${symbol}`]["close"]
      if (listed) {
        data = `${symbol} (${range} - ${interval}) ${[...first].map(num => '\n' + num)}`
      } else {
        data = `${symbol} (${range} - ${interval}) ${[...first].map(num => ' | ' + num)}`
      }
    })
    .catch( err => data = 'either the symbol is wrong or the interval is wrong \nintervals: 1m, 2m, 5m, 15m,\n30m, 60m, 90m, 120m,\n1d, 5d, 1wk, 1mo, 3mo\n' + err)
  await bot.sendMessage(chatId, `${data}`)
});

bot.onText(/\/fn (.+)/, async (msg,match) => {
  
  await bot.sendMessage(msg.chat.id, await fnArgs(match))
  
})

bot.onText(/\/symbol (.+)/, async (msg:any, match:any) => {

  await bot.sendMessage(msg.chat.id, await symb(match))

})

// bot.onText(/\/axios (.+)/, async (msg, match) => {
//   const chatId = msg.chat.id
//   const resp = match![1]
//   var result
//   await axios
//     .get(resp)
//     .then((res) => (result = JSON.stringify(res.data)))
//     .catch((err) => (result = JSON.stringify(err)))
//   await bot.sendMessage(chatId, `${result}`)
// })

function withCommas(value: string) {
  return Number(value).toLocaleString('en-us')
}

// function fixed2(value: number) {
//   return (Math.round(value * 100) / 100).toFixed(2)
// }
