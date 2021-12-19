import symb from '../../funcs/symbol'
import Command from '../../types/command'

const command: Command = {
  name: 'symbol',
  description: 'search for a companies asset name.',
  aliases: ['symb'],
  args: true,
  usage: '<name> <details?>',
  async execute(bot, chatId, args) {
    bot.sendMessage(chatId, await symb(args))
  },
}

export default command
