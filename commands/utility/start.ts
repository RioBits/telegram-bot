import { botCommands } from '../../bot'
import Command from '../../types/command'

const command: Command = {
  name: 'start',
  description: 'Information about the arguments provided.',
  aliases: ['help', 'commands'],
  usage: '[command_name?]',
  execute(bot, chatId, args) {
    const data = []
    const allCommands = botCommands.map((obj) => `/${obj.name}`)

    if (!args.length) {
      data.push("Here's a list of all my commands:\n")
      data.push(`<b>${allCommands.join('\n')}</b>`)
      data.push(
        `\nYou can send <code>/start [command_name?]</code> to get info on a specific command!`
      )

      return bot.sendMessage(chatId, data.join(''), { parse_mode: 'HTML' })
    }

    const name = args[0].toLowerCase()
    const commandObj =
      botCommands.find((obj) => obj.name === name) ||
      botCommands.find(
        (obj) => obj.command.aliases && obj.command.aliases.includes(name)
      )

    if (!commandObj) {
      return bot.sendMessage(chatId, "that's not a valid command!")
    }

    data.push(`\n*Name:* ${commandObj.name}`)

    if (commandObj.command.aliases)
      data.push(`\n*Aliases:* ${commandObj.command.aliases.join(', ')}`)
    if (commandObj.command.description)
      data.push(`\n*Description:* ${commandObj.command.description}`)
    if (commandObj.command.usage)
      data.push(`\n*Usage:* /${commandObj.name} ${commandObj.command.usage}`)

    bot.sendMessage(chatId, data.join(''), { parse_mode: 'Markdown' })
  },
}

export default command
