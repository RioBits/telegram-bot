import Command from '../../types/command'

const command: Command = {
  name: 'all',
  description: 'Mention all members on RE Group. eg: /all, /all 2',
  usage: '<manytimes?>',
  execute(bot, chatId, args) {
    const resp = Number(args[0])
    const mentions = '@riobits @nyllre @x7thxo @CLK944 @p16d0 @U_D3L @Sab_o04'

    if (!resp) {
      return bot.sendMessage(chatId, mentions)
    }

    if (resp > 10 || resp < 0) {
      return bot.sendMessage(chatId, `choose between 1 - 10\neg: /all 2`)
    }

    let count = 1
    let scream = setInterval(() => {
      bot.sendMessage(chatId, mentions, { parse_mode: 'HTML' })

      if (count === resp) {
        clearInterval(scream)
      }
      count++
    }, 1000)
  },
}

export default command
