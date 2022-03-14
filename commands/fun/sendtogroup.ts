import Command from '../../types/command'

const command: Command = {
  name: 'sendtogroup',
  description: 'Send messages to RE Group.',
  aliases: ['stg'],
  args: true,
  usage: '<message>',
  execute(bot, _, args) {
    bot.sendMessage(Number(process.env.MAIN_GROUP_ID), args.join(' '))
  },
}

export default command
