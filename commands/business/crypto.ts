import axios from 'axios'
import { withCommas } from '../../funcs/utility'
import Command from '../../types/command'

interface coinbaseApiResponse {
  data: {
    amount: string
    base: string
    currency: string
  }
}

const command: Command = {
  name: 'crypto',
  description: 'Crypto Prices.',
  usage: '<code?>',
  async execute(bot, chatId, args) {
    const resp = args[0]?.toLowerCase()

    if (!resp) {
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
    }

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
  },
}

export default command
