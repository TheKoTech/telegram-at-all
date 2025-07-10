import 'dotenv/config'
import { Telegraf } from 'telegraf'
import { DB } from './db.js'
import { addUser } from './add-user.js'

if (!process.env.BOT_TOKEN) {
	throw new Error('BOT_TOKEN environment variable is not set')
}

const bot = new Telegraf(process.env.BOT_TOKEN!)

bot.use(addUser)

bot.hears(/@(all|everyone)/, async ctx => {
	console.log('text message')

	const chat = ctx.chat
	const message = ctx.message
	const chatType = chat.type

	switch (chatType) {
		case 'private': {
			ctx.reply('Бот работает только в групповых чатах.')
			console.log('private chat')
			break
		}
		case 'group': {
			ctx.reply('Группа')
			console.log('group chat')
			break
		}
		case 'supergroup': {
			ctx.reply('СУПЕР группа')

			const topicId = message.message_thread_id

			console.log('supergroup chat', topicId)
			break
		}
	}
})

bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
