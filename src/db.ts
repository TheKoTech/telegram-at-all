import { Low } from 'lowdb'
import { JSONFilePreset } from 'lowdb/node'
import { dbDefaultData } from './constants/db-default-data.js'
import { type ChatId } from './types/chat-id.js'
import { type DBData } from './types/db-data.js'
import { type DBUser } from './types/db-user.js'
import { type TopicId } from './types/topic-id.js'
import { type UserId } from './types/user-id.js'
import type { User } from 'telegraf/types'

type ChatInfo = {
	chatId: ChatId
	topicId?: TopicId
}

export class DB {
	private static db: Low<DBData>

	private static get data(): DBData {
		return this.db.data
	}

	static async init() {
		console.log('initializing DB...')
		DB.db = await JSONFilePreset<DBData>('db.json', dbDefaultData)
		await DB.db.write()
		console.log('DB initialized')
	}

	static getUsers({
		chatId,
		topicId,
	}: ChatInfo): Record<UserId, DBUser> | undefined {
		const chat = DB.data.chats[chatId]

		if (!chat) return

		if (topicId && chat.topics !== undefined) {
			return chat.topics[topicId]?.users
		}

		return chat.users
	}

	static getUserName(userId: UserId) {
		return DB.data.users[userId]?.username
	}

	static shouldIgnore({
		userId,
		chatId,
		topicId,
	}: ChatInfo & { userId: UserId }): boolean | undefined {
		const chat = DB.data.chats[chatId]

		if (!chat) return

		const topicPreference =
			topicId !== undefined &&
			chat?.topics?.[topicId]?.users[userId]?.shouldIgnore
		if (topicPreference !== undefined) return topicPreference

		const chatPreference = chat.users[userId]?.shouldIgnore
		if (chatPreference !== undefined) return chatPreference

		const globalPreference = DB.data.users[userId]?.shouldIgnore
		return globalPreference !== undefined ? globalPreference : false
	}

	static async addChat(chatId: ChatId) {
		if (DB.data.chats[chatId]) return

		DB.data.chats[chatId] = { users: {} }

		await this.db.write()
	}

	static async addTopic(chatId: ChatId, topicId: TopicId) {
		const chat = DB.data.chats[chatId]

		if (!chat || chat?.topics?.[topicId]) return

		chat.topics ??= {}
		chat.topics[topicId] = { users: {} }

		await this.db.write()
	}

	static async addUser({
		chatId,
		topicId,
		userId,
		username,
	}: {
		chatId: ChatId
		topicId?: TopicId
		userId: UserId
		username: User['username']
	}) {
		const data = DB.data
		const chat = data.chats[chatId]

		if (!chat || !username) return

		const user: DBUser = {}

		DB.data.users[userId] ??= {
			username,
		}
		chat.users[userId] ??= user

		const topic = topicId && chat.topics?.[topicId]
		if (topic) topic.users[userId] ??= user

		await this.db.write()
	}
}
