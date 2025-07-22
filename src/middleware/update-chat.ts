import { type Context } from 'telegraf'
import { DB } from '../db.js'

export const updateChat = async (ctx: Context, next: () => Promise<void>) => {
	const user = ctx.from
	const chat = ctx.chat

	if (!user?.username || !chat || !['group', 'supergroup'].includes(chat.type))
		return next()

	DB.addChat(chat.id)

	const topicId = ctx.message?.message_thread_id
	if (topicId) await DB.addTopic(chat.id, topicId)

	await DB.addUser({
		chatId: chat.id,
		topicId,
		username: user.username,
		userId: user.id,
	})

	return next()
}
