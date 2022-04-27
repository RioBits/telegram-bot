import type { InlineKeyboardButton } from 'node-telegram-bot-api'
import Command from '../../types/command'
const command: Command = {
  name: 'test',
  description: 'test command.',
  usage: '<text?>',
  aliases: ['tst'],
  execute(bot, chatId) {
    const pricesButtons: InlineKeyboardButton[][] = [
      [
        {
          text: 'BTC 💰',
          callback_data: 'BTC-USD',
        },
      ],
      [
        {
          text: 'ETH 💰',
          callback_data: 'ETH-USD',
        },
      ],
      [
        {
          text: 'DOGE 💰',
          callback_data: 'DOGE-USD',
        },
      ],
    ]
    bot.sendMessage(chatId, 'New feature 🔥', {
      reply_markup: {
        inline_keyboard: pricesButtons,
      },
    })
  },
}

export default command
