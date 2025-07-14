import { type ChatId } from './chat-id.js'
import { type DBChat } from './db-chat.js'
import { type GlobalUserConfig } from './global-user-config.js'
import { type UserId } from './user-id.js'

export type DBData = {
	chats: Record<ChatId, DBChat>
	users: Record<UserId, GlobalUserConfig>
}
