import axios from 'axios'
import Command from '../../types/command'

const command: Command = {
  name: 'meme',
  description: 'Memes from reddit.',
  async execute(bot, chatId) {
    const { data } = await axios.get('https://reddit-meme-api.herokuapp.com/')

    bot.sendMessage(
      chatId,
      `[${data.title}](${data.image_previews[data.image_previews.length - 1]})`,
      {
        parse_mode: 'Markdown',
      }
    )
  },
}

export default command
