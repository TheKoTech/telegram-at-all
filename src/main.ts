import 'dotenv/config'
import { Telegraf } from 'telegraf'
import { DB } from './db.js'
import { updateChat } from './middleware/update-chat.js'

if (!process.env.BOT_TOKEN) {
	throw new Error('BOT_TOKEN environment variable is not set')
}

DB.init()
const bot = new Telegraf(process.env.BOT_TOKEN!)

bot.use(updateChat)

bot.hears(/@(all|everyone|here)/, async ctx => {
	console.log('text message')

	const chat = ctx.chat
	const message = ctx.message
	const topicId = message.message_thread_id

	const authorUsername = ctx.from.username
	if (!authorUsername) return

	if (chat.type === 'private') {
		return ctx.reply('Бот работает только в групповых чатах.')
	}

	const chatMembers = DB.getUsers({
		chatId: chat.id,
		topicId,
	})

	if (!chatMembers) return

	const replyText = Object.values(chatMembers)
		.filter(user => user.shouldPing)
		.filter(user => user.username !== authorUsername)
		.reduce((acc, prev) => {
			acc += `@${prev.username}`
			return acc
		}, '')

	if (!replyText) return ctx.reply('Некого пинговать 🤷‍♀️')

	return ctx.reply(replyText, { parse_mode: 'Markdown' })
})

bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
