import { Chat, User } from '@telegraf/types'
import { Low } from 'lowdb'
import { JSONFilePreset } from 'lowdb/node'
// import { dbDefaultData } from './db-default-data.mjs'
// import { DBData } from './types/db-data.mjs'
// import { DBEventReply } from './types/db-event-reply.mjs'
// import { DBEvent } from './types/db-event.mjs'
// import { DBUser } from './types/db-user.mjs'
// import { UserRole } from './enums/user-role.mjs'

type UserId = User['id']
type ChatId = Chat['id']
type TopicId = number

type DBUser = {
	username: string
	shouldPing: boolean
}

type DBTopic = {
	users: Record<UserId, DBUser>
}

type DBChat = {
	users: Record<UserId, DBUser>
	topics?: Record<TopicId, DBTopic>
}

type DBData = {
	chats: Record<ChatId, DBChat>
}

const dbDefaultData: DBData = {
	chats: {},
}

export class DB {
	static db: Low<DBData>

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
			return chat.topics[topicId].users
		}

		return chat.users
	}

	static async addChat(chatId: ChatId) {
		this.db.data.chats[chatId] = {
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

		const isAddedToChat = !!chat.users[userId]
		const isAddedToTopic = !!(!topicId || chat.topics?.[topicId].users[userId])
		if (isAddedToChat && isAddedToTopic) return

		const user: DBUser = {
			username,
			shouldPing,
		}

		chat.users[userId] = user

		if (topicId && chat.topics !== undefined) {
			chat.topics[topicId].users[userId] = user
		}

		await this.db.write()
	}

	// static getUserList({ chatId, topicId }: { userIds: number[] }): DBUser[] {
	// 	return Object.entries(this.db.data.users)
	// 		.filter(([k]) => userIds.includes(+k))
	// 		.map(([, v]) => v)
	// }

	// static addUser(user: User): undefined {
	// 	const existingUser = DB.getUser(user.id)
	// 	if (existingUser) return

	// 	const username = user.username

	// 	if (!username || user.is_bot) return

	// 	const newUser: DBUser = {
	// 		username: username,
	// 		shouldPing: true,
	// 	}

	// 	this.db.data.users[user.id] = newUser
	// 	this.db.write()

	// 	console.log('User added successfully')
	// }
}
