import { Low } from 'lowdb'
import { JSONFilePreset } from 'lowdb/node'
import { dbDefaultData } from './constants/db-default-data.js'
import { type ChatId } from './types/chat-id.js'
import { type DBData } from './types/db-data.js'
import { type DBUser } from './types/db-user.js'
import { type TopicId } from './types/topic-id.js'
import { type UserId } from './types/user-id.js'

export class DB {
	private static db: Low<DBData>

	static async init() {
		console.log('initializing DB...')
		DB.db = await JSONFilePreset<DBData>('db.json', dbDefaultData)
		await DB.db.write()
		console.log('DB initialized')
	}

	static getUsers({
		chatId,
		topicId,
	}: {
		chatId: ChatId
		topicId?: TopicId
	}): Record<UserId, DBUser> | undefined {
		const chat = this.db.data.chats[chatId]

		if (!chat) return

		if (topicId && chat.topics !== undefined) {
			return chat.topics[topicId]?.users
		}

		return chat.users
	}

	static async addChat(chatId: ChatId) {
		if (this.db.data.chats[chatId]) return

		this.db.data.chats[chatId] = {
			users: {},
		}

		await this.db.write()
	}

	static async addTopic(chatId: ChatId, topicId: TopicId) {
		const chat = this.db.data.chats[chatId]

		if (!chat?.topics?.[topicId]) return

		chat.topics[topicId] = {
			users: {},
		}
		await this.db.write()
	}

	static async addUser({
		chatId,
		topicId,
		userId,
		username,
		shouldPing = true,
	}: {
		chatId: ChatId
		topicId?: TopicId
		userId: UserId
		username: DBUser['username']
		shouldPing?: boolean
	}) {
		const chat = this.db.data.chats[chatId]

		if (!chat) return

		const user: DBUser = {
			username,
			shouldPing,
		}

		chat.users[userId] ??= user

		const topic = topicId && chat.topics?.[topicId]
		if (topic) topic.users ??= user

		await this.db.write()
	}
}
