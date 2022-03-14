import axios from 'axios'
import Command from '../../types/command'

const command: Command = {
  name: 'btcfearrate',
  description: 'show bitcoin fear rate.',
  aliases: ['btcfr'],
  async execute(bot, chatId) {
    const { data } = await axios.get('https://api.alternative.me/fng')
    bot.sendMessage(
      chatId,
      `<b>Bitcoin Fear Rate: </b>\n<em>${data.data[0].value_classification}</em>`,
      { parse_mode: 'HTML' }
    )
  },
}

export default command
