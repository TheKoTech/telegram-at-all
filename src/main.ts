import { Telegraf } from 'telegraf'
import { message } from 'telegraf/filters'
import 'dotenv/config'

if (!process.env.BOT_TOKEN) {
  throw new Error('BOT_TOKEN environment variable is not set')
}

const bot = new Telegraf(process.env.BOT_TOKEN!)

bot.on(message('text'), async ctx => {
  if (!/@(all|everyone)/.test(ctx.message.text)) return

  await ctx.reply(`hey @every`)
})

bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
