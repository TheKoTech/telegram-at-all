import { type Context } from 'telegraf'

export const adminsOnly = async (ctx: Context, next: () => Promise<void>) => {
	const admins = process.env.BOT_ADMINS?.split(',')
	const username = ctx.from?.username

	if (!admins || !username || !admins.includes(username)) return

	return next()
}
