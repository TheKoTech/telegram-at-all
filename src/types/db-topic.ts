import { type DBUser } from './db-user.js'
import { type UserId } from './user-id.js'

export type DBTopic = {
	users: Record<UserId, DBUser>
}
