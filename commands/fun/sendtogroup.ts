import Command from '../../types/command'

const command: Command = {
  name: 'sendtogroup',
  description: 'Send messages to RE Group.',
  aliases: ['stg'],
  args: true,
  usage: '<message>',
  execute(bot, _, args) {
    bot.sendMessage(-1001729428661, args.join(' '))
  },
}

export default command
