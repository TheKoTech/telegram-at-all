import { Context } from 'telegraf'
import { DB } from './db.js'

export const addUser = async (ctx: Context, next: () => Promise<void>) => {
	const user = ctx.from
	const chat = ctx.chat

	if (!user?.username || !chat || !['group', 'supergroup'].includes(chat.type))
		return next()

	DB.addUser({
		chatId: chat.id,
		topicId: ctx.message?.message_thread_id,
		username: user.username,
		userId: user.id,
		shouldPing: true,
	})

	return next()
}
