import axios from 'axios'
import { withCommas } from '../../funcs/utility'
import Command from '../../types/command'
import fetchPrices from '../../funcs/fetchPrices'

const command: Command = {
  name: 'price',
  description: 'Show USD price in: TRY, EUR, SAR, AED, etc..',
  usage: '<currency>',
  async execute(bot, chatId, args) {
    if (!args || !args.length) {
      const data = await fetchPrices({
        symbols: 'TRY=X,BTC-USD,ETH-USD,EURUSD=X',
      })
      return bot.sendMessage(chatId, `${data}`)
    }

    let prompt = args[0].split(' ')[0].toUpperCase()

    prompt = prompt.replace('BTC', 'BTC-USD')
    prompt = prompt.replace('ETH', 'ETH-USD')
    prompt = prompt.replace('DOGE', 'DOGE-USD')
    prompt = prompt.replace('TRY', 'TRY=X')

    var options: any = {
      method: 'GET',
      url: 'https://stock-data-yahoo-finance-alternative.p.rapidapi.com/v6/finance/quote',
      params: { symbols: `${prompt}` },
      headers: {
        'x-rapidapi-host':
          'stock-data-yahoo-finance-alternative.p.rapidapi.com',
        'x-rapidapi-key': '27f4a46847mshdb18aa5242e2e64p1fa70fjsnce9d0b4b1087',
      },
    }
    let data: any
    await axios
      .request(options)
      .then((res) => {
        data = ''

        let first = res.data['quoteResponse']['result']
        if (first.length >= 2) {
          for (let i = 0; i < first.length; i++) {
            data += `${first[i]['shortName']}: ${withCommas(
              first[i]['regularMarketPrice']
            )} \n${first[i]['regularMarketDayRange']}\n\n`
          }
        } else {
          data = `${first[0]['shortName']}: ${withCommas(
            first[0]['regularMarketPrice']
          )}`
        }
      })
      .catch((err) => (data = `wrong symbol, try searching with /symbol`))

    await bot.sendMessage(chatId, `${data}`)
  },
}

export default command
