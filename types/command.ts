import TelegramBot from 'node-telegram-bot-api'

export default interface Command {
  name: string
  description?: string
  aliases?: string[]
  args?: boolean
  usage?: string
  dmOnly?: boolean
  execute: (
    bot: TelegramBot,
    chatId: number,
    args: string[],
    msg?: TelegramBot.Message
  ) => void
}
