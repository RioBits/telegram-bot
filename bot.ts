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

bot.onText(/^\/start$/, async (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `This is a list of all my commands!\n\n/price: Show USD price in: TRY, EUR, SAR, AED\n\n/price <currency>: Show <currency> price in: TRY, EUR, USD, SAR, AED\n\n/crypto: Show BTC USD DOGE price in USD\n\n/crypto <crypto_code>: Show <crypto_code> in USD\n\nAdvanced:\n\n/finance <asset> <range> <interval>: display <asset> changes\n\n/symbol <name> <details:optional>: search for a companies asset name`
  )
})

bot.onText(/^\/help$/, async (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `This is a list of all my commands!\n\n/price: Show USD price in: TRY, EUR, SAR, AED\n\n/price <currency>: Show <currency> price in: TRY, EUR, USD, SAR, AED\n\n/crypto: Show BTC USD DOGE price in USD\n\n/crypto <crypto_code>: Show <crypto_code> in USD\n\nAdvanced:\n\n/finance <asset> <range> <interval>: display <asset> changes\n\n/symbol <name> <details:optional>: search for a companies asset name`
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
      `Choosed default: USD\n\nTRY: ${rates.TRY}\n\nEUR: ${rates.EUR}\n\nSAR: ${rates.SAR}\n\nAED: ${rates.AED}\n\nDate: ${date}`
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
        `You entered incorrect currency!\ntry something like this:\n\n/price TRY\n\nchoosed default: EURO\n\nBase: ${base}\n\nTRY: ${rates.TRY}\n\nEUR: ${rates.EUR}\n\nUSD: ${rates.USD}\n\nSAR: ${rates.SAR}\n\nAED: ${rates.AED}\n\nDate: ${date}`
      )
    } else {
      bot.sendMessage(
        chatId,
        `Base: ${base}\n\nTRY: ${rates.TRY}\n\nEUR: ${rates.EUR}\n\nUSD: ${rates.USD}\n\nSAR: ${rates.SAR}\n\nAED: ${rates.AED}\n\nDate: ${date}`
      )
    }
  } catch (err) {
    console.error(err)
    bot.sendMessage(chatId, 'ERROR WHILE FETCHING THE DATA')
  }
})

bot.onText(/\/eval (.+)/, async (msg, match) => {
  const chatId = msg.chat.id
  const resp = match![1]

  if ( resp.includes("while") || resp.includes("for") ) {
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

bot.onText(/\/finance (.+)/, async (msg,match) => {
  const chatId: number = msg.chat.id
  var prompt: any = match![1].split(" ")
  var symbol:any
  // const symbol = prompt[0].toUpperCase()
  if (prompt[0].toUpperCase() === "ETH" || prompt[0].toUpperCase() === "BTC") {
    symbol = prompt[0].toUpperCase() + "-USD"
  } else {
    symbol = prompt[0].toUpperCase()
  }
  const range = prompt[1] || "1mo"
  const interval = prompt[2] || "1wk"

  console.log({symbols: symbol, range: range, interval: interval});
  
  var data:any
  var options:any = {
    method: 'GET',
    url: 'https://stock-data-yahoo-finance-alternative.p.rapidapi.com/v8/finance/spark',
    params: {symbols: symbol, range: range, interval: interval},
    headers: {
      'x-rapidapi-host': 'stock-data-yahoo-finance-alternative.p.rapidapi.com',
      'x-rapidapi-key': '27f4a46847mshdb18aa5242e2e64p1fa70fjsnce9d0b4b1087'
    }
  };
  await axios.request(options)
    .then( res => {
      let first = res.data[`${symbol}`]["close"]
      data = `${symbol} (${range} - ${interval}) ${[...first].map(num => ' | ' + num)}`
    })
    .catch( err => data = 'either the symbol is wrong or the interval is wrong | intervals: 1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo' + err)
  await bot.sendMessage(chatId, `${data}`)
  await console.log("done");
  
})

bot.onText(/\/symbol (.+)/, async (msg, match) => {
  const chatId = msg.chat.id
  const mesg = match![1].split(" ")
  const resp = mesg[0]
  var options: any = {
    method: 'GET',
    url: 'https://stock-data-yahoo-finance-alternative.p.rapidapi.com/v6/finance/autocomplete',
    params: {query: resp, lang: 'en'},
    headers: {
      'x-rapidapi-host': 'stock-data-yahoo-finance-alternative.p.rapidapi.com',
      'x-rapidapi-key': '27f4a46847mshdb18aa5242e2e64p1fa70fjsnce9d0b4b1087'
    }
  }
  var data:any
  await axios.request(options)
    .then( res => {
      if (mesg[1] === "details"){
        data = JSON.stringify([...res.data["ResultSet"]["Result"]])
    } else {
      data = [...res.data["ResultSet"]["Result"]][0].symbol
    }
    })
    .catch( err => data = "symbol not found")
  
  await bot.sendMessage(chatId, `${data}`)
  // await console.log("done");
})

bot.onText(/\/axios (.+)/, async (msg, match) => {
  const chatId = msg.chat.id
  const resp = match![1]
  var result
  await axios.get(resp).then(
    res => result = JSON.stringify(res.data)
  ).catch(
    err => result = JSON.stringify(err)
  )
  await bot.sendMessage(chatId, `${result}`)
})  

function withCommas(value: string) {
  return Number(value).toLocaleString('en-us')
}

// function fixed2(value: number) {
//   return (Math.round(value * 100) / 100).toFixed(2)
// }

