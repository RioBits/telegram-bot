import fs from 'fs'
import { config } from 'dotenv'
import TelegramBot from 'node-telegram-bot-api'
import Command from './types/command'
import { executeAfterMilliseconds } from './funcs/utility'
import fetchPrices from './funcs/fetchPrices'
import checkOffers from './funcs/checkOffers'

config()

const token = process.env.TOKEN!

const bot = new TelegramBot(token, { polling: true })

type BotCommands = { name: string; command: Command }[]
export const botCommands: BotCommands = []

const commandFolders = fs.readdirSync('./commands')

for (const folder of commandFolders) {
  const commandFiles = fs
    .readdirSync(`./commands/${folder}`)
    .filter((file) => file.endsWith('.ts'))
  for (const file of commandFiles) {
    const command = require(`./commands/${folder}/${file}`)
    botCommands.push({ name: command.default.name, command: command.default })
  }
}

executeAfterMilliseconds(async () => {
  const data = await fetchPrices({
    symbols: 'TRY=X,BTC-USD,ETH-USD,EURUSD=X',
  })
  return bot.sendMessage(Number(process.env.INVESTING_CHANNEL_ID), `${data}`)
}, 1000 * 60 * 60) // 1 Hour

executeAfterMilliseconds(async () => {
  await checkOffers(bot)
}, 1000 * 60 * 40) // 40 min

bot.on('polling_error', console.log)

bot.on('message', async (msg) => {
  const chatId = msg.chat.id

  if (!msg.text || !msg.text.startsWith('/')) return

  const args = msg.text.slice(1).trim().split(/ +/)
  let commandName = args.shift()!.toLowerCase()

  if (commandName.includes('@extratoolsbot')) {
    commandName = commandName.split('@').splice(0, 1, '').join()
  }

  const command: Command | undefined =
    botCommands.find((obj) => obj.name === commandName)?.command ||
    botCommands.find(
      (obj) => obj.command.aliases && obj.command.aliases.includes(commandName)
    )?.command

  if (!command) {
    return
  }

  if (command.dmOnly && msg.chat.type === 'supergroup') {
    return bot.sendMessage(
      chatId,
      "I can't execute that command inside groups!"
    )
  }

  if (command.args && !args.length) {
    let reply = `You didn't provide any arguments!`

    if (command.usage) {
      reply += `\nThe proper usage would be: \`/${command.name} ${command.usage}\``
    }

    return bot.sendMessage(chatId, reply, { parse_mode: 'Markdown' })
  }

  try {
    await command.execute(bot, chatId, args)
  } catch (error) {
    console.error(error)
    bot.sendMessage(
      chatId,
      'there was an error trying to execute that command!'
    )
  }
})
