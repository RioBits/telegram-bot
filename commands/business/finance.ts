import axios from 'axios'
import fnArgs from '../../funcs/financeArg'
import Command from '../../types/command'

const command: Command = {
  name: 'finance',
  description: 'display <asset> changes',
  aliases: ['fn'],
  usage: 'try 60m 1m',
  async execute(bot, chatId, args) {
    if (!args || !args.length) {
      const symbol: string = 'TRY=X'
      const range: string = '4h'
      const interval: string = '15m'
      const listed = true

      let data = ''
      const options: any = {
        method: 'GET',
        url: 'https://stock-data-yahoo-finance-alternative.p.rapidapi.com/v8/finance/spark',
        params: { symbols: symbol, range: range, interval: interval },
        headers: {
          'x-rapidapi-host':
            'stock-data-yahoo-finance-alternative.p.rapidapi.com',
          'x-rapidapi-key': process.env.YAHOO_FA_TOKEN,
        },
      }

      try {
        const response = await axios.request(options)
        let first = response.data[`${symbol}`]['close']
        if (listed) {
          data = `${symbol} (${range} - ${interval}) ${[...first].map(
            (num) => '\n' + num
          )}`
        } else {
          data = `${symbol} (${range} - ${interval}) ${[...first].map(
            (num) => ' | ' + num
          )}`
        }
      } catch (err) {
        data =
          'either the symbol is wrong or the interval is wrong \nintervals: 1m, 2m, 5m, 15m,\n30m, 60m, 90m, 120m,\n1d, 5d, 1wk, 1mo, 3mo\n' +
          err
      }

      return bot.sendMessage(chatId, `${data}`)
    }
    return bot.sendMessage(chatId, await fnArgs(args))
  },
}

export default command
