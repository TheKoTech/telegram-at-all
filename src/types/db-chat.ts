import { type DBTopic } from './db-topic.js'
import { type DBUser } from './db-user.js'
import { type TopicId } from './topic-id.js'
import { type UserId } from './user-id.js'

export type DBChat = {
	users: Record<UserId, DBUser>
	topics?: Record<TopicId, DBTopic>
}
