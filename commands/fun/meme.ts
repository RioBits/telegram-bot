import axios from 'axios'
import Command from '../../types/command'

const command: Command = {
  name: 'meme',
  description: 'Memes from reddit.',
  async execute(bot, chatId) {
    const { data } = await axios.get('https://meme-api.herokuapp.com/gimme')

    bot.sendMessage(
      chatId,
      `[${data.title}](${data.preview[data.preview.length - 1]})`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[{ text: 'Another 🐜', callback_data: 'meme' }]],
        },
      }
    )
  },
}

export default command
