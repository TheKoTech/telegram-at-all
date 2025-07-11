import { DBTopic } from './db-topic.js'
import { DBUser } from './db-user.js'
import { TopicId } from './topic-id.js'
import { UserId } from './user-id.js'

export type DBChat = {
	users: Record<UserId, DBUser>
	topics?: Record<TopicId, DBTopic>
}
