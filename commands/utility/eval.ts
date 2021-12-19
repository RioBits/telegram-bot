import Command from '../../types/command'

const command: Command = {
  name: 'eval',
  description: 'Write inline javascript code!',
  args: true,
  usage: '<code>',
  execute(bot, chatId, args) {
    const resp = args[0]

    if (resp.includes('while') || resp.includes('for')) {
      bot.sendMessage(chatId, `stfu`)
    } else if (resp == '"I\'m a dumb bot"') {
      bot.sendMessage(chatId, `ur a dumb human`)
    } else {
      try {
        bot.sendMessage(chatId, `${eval(resp)}`)
      } catch (err) {
        bot.sendMessage(chatId, `${err}`)
      }
    }
  },
}

export default command
