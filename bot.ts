import fs from 'fs'
import { config } from 'dotenv'
import TelegramBot, { InlineKeyboardButton } from 'node-telegram-bot-api'
import Command from './types/command'
import { executeAfterMilliseconds } from './funcs/utility'
import fetchPrices from './funcs/fetchPrices'
import checkOffers from './funcs/checkOffers'
import axios from 'axios'

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

const ONE_HOUR = 1000 * 60 * 60

executeAfterMilliseconds(async () => {
  const data: string = await fetchPrices({
    symbols: 'TRY=X,BTC-USD,ETH-USD,EURUSD=X',
  })
  return bot.sendMessage(Number(process.env.INVESTING_CHANNEL_ID), `${data}`)
}, ONE_HOUR)

executeAfterMilliseconds(async () => {
  await checkOffers(bot)
}, ONE_HOUR)

bot.on('polling_error', console.log)

// TODO: let's make better file stracture for this feature
bot.on('callback_query', async function onCallbackQuery(callbackQuery) {
  const action = callbackQuery.data
  const msg = callbackQuery.message as TelegramBot.Message
  console.log(action)

  const buttons: InlineKeyboardButton[][] = [
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

  let opts: any = {
    chat_id: msg.chat.id,
    message_id: msg.message_id,
  }

  let data = ''

  switch (action) {
    case 'BTC-USD':
      data = await fetchPrices({ symbols: 'BTC-USD' })
      opts = {
        ...opts,
        reply_markup: {
          inline_keyboard: buttons,
        },
      }
      break
    case 'ETH-USD':
      data = await fetchPrices({ symbols: 'ETH-USD' })
      opts = {
        ...opts,
        reply_markup: {
          inline_keyboard: buttons,
        },
      }
      break
    case 'DOGE-USD':
      data = await fetchPrices({ symbols: 'DOGE-USD' })
      opts = {
        ...opts,
        reply_markup: {
          inline_keyboard: buttons,
        },
      }
      break
    case 'meme':
      const { data: meme } = await axios.get(
        'https://meme-api.herokuapp.com/gimme'
      )
      data = `[${meme.title}](${meme.preview[meme.preview.length - 1]})`
      opts = {
        ...opts,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[{ text: 'Meme 🐜', callback_data: 'meme' }]],
        },
      }
      break
    default:
      data = 'Unknown button'
  }

  bot.editMessageText(data, opts)
})

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
