import symb from '../../funcs/symbol'
import Command from '../../types/command'

const command: Command = {
  name: 'chatid',
  description: 'get chat id.',
  aliases: ['cid'],
  args: false,
  execute(bot, chatId) {
    bot.sendMessage(chatId, chatId.toString())
  },
}

export default command
