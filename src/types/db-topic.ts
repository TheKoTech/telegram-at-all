import { DBUser } from './db-user.js'
import { UserId } from './user-id.js'

export type DBTopic = {
	users: Record<UserId, DBUser>
}
