import { ChatId } from './chat-id.js'
import { DBChat } from './db-chat.js'
import { GlobalUserConfig } from './global-user-config.js'
import { UserId } from './user-id.js'

export type DBData = {
	chats: Record<ChatId, DBChat>
	users: Record<UserId, GlobalUserConfig>
}
