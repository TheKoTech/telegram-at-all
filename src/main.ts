import 'dotenv/config'
import { Telegraf } from 'telegraf'
import { DB } from './db.js'
import { updateChat } from './middleware/update-chat.js'
import { adminsOnly } from './middleware/admins-only.js'
import { execSync } from 'child_process'

if (!process.env.BOT_TOKEN) {
	throw new Error('BOT_TOKEN environment variable is not set')
}

const sanitizeUsername = (username: string) => username.replaceAll(/_/g, '\\_')

DB.init()
const bot = new Telegraf(process.env.BOT_TOKEN!)

bot.use(updateChat)

bot.hears(/@(all|everyone|here)/, async ctx => {
	const chat = ctx.chat
	const message = ctx.message
	const topicId = message.message_thread_id

	const fromId = ctx.from.id

	if (chat.type === 'private') {
		return ctx.reply('Бот работает только в групповых чатах.')
	}

	const atHere = ctx.match[0] === '@here'
	const chatMembers = DB.getUsers({
		chatId: chat.id,
		topicId: atHere ? topicId : undefined,
	})

	if (!chatMembers) return

	const replyText = Object.keys(chatMembers)
		.filter(
			userId =>
				+userId !== fromId &&
				!DB.shouldIgnore({
					userId: +userId,
					chatId: chat.id,
					topicId,
				}),
		)

		.reduce((acc, userId) => {
			const rawUserName = DB.getUserName(+userId)
			if (!rawUserName) return acc

			acc += `@${sanitizeUsername(rawUserName)} `

			return acc
		}, '')

	if (!replyText) return ctx.reply('Некого пинговать 🤷‍♀️')

	return ctx.reply(replyText, { parse_mode: 'Markdown' })
})

const checkForUpdates = () => {
	try {
		execSync('git fetch --tags', { stdio: 'pipe' })
		const currentTag = execSync(
			'git describe --tags --exact-match HEAD 2>/dev/null || echo "no-tag"',
			{ encoding: 'utf8' },
		).trim()
		const latestTag = execSync('git describe --tags --abbrev=0 origin/master', {
			encoding: 'utf8',
		}).trim()

		return { hasUpdates: currentTag !== latestTag, currentTag, latestTag }
	} catch {
		return { hasUpdates: false, currentTag: 'unknown', latestTag: 'unknown' }
	}
}

const stopBot = () => {
	setTimeout(() => {
		bot.stop('SIGING')
		process.exit(10)
	}, 5000)
}

bot.command('start', async ctx => {
	return ctx.reply(
		'Пингует всех в группе. Реагирует на: @all, @everyone и @here\n\n' +
			'@all и @everyone пингуют всех, кто оставлял сообщения в чате\n' +
			'@here пингует всех, кто оставлял сообщения в конкретном топике',
	)
})

bot.command('update', adminsOnly, async ctx => {
	const { currentTag, hasUpdates, latestTag } = checkForUpdates()

	if (!hasUpdates) return ctx.reply('Already on the newest version')

	await ctx.reply(`Updating from ${currentTag} to ${latestTag}...`)

	stopBot()
})

bot
	.catch((error, ctx) => {
		// @ts-expect-error weh
		if (error?.response?.description === 'Bad Request: TOPIC_CLOSED') {
			console.log('Some one tried to @all in a closed topic.')
			return
		}

		return console.error(error, ctx)
	})
	.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
