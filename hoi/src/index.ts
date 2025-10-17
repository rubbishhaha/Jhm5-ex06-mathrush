/**
 * Welcome to Cloudflare Workers!
 *
 * This is a template for a Scheduled Worker: a Worker that can run on a
 * configurable interval:
 * https://developers.cloudflare.com/workers/platform/triggers/cron-triggers/
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Run `curl "http://localhost:8787/__scheduled?cron=*+*+*+*+*"` to see your Worker in action
 * - Run `npm run deploy` to publish your Worker
 *
 * Bind resources to your Worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	async fetch(req: Request, env: Env) {
		const url = new URL(req.url);
		// simple API endpoint to return data from D1
		if (url.pathname === '/api/data') {
			try {
				// Query the d1 database binding
				const res = await env.DSE_ANA.prepare('SELECT id, no, description, type, day_school_candidates_no AS day_no, day_school_candidates_cumulative AS day_cum, all_candidates_no AS all_no, all_candidates_cumulative AS all_cum FROM exam_stats').all();
				const rows = res.results?.map(r => ({ id: r.id, label: r.description, value: r.day_no ?? r.all_no ?? 0, text: r.description })) ?? [];
				return new Response(JSON.stringify(rows), { headers: { 'Content-Type': 'application/json' } });
			} catch (e) {
				return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
			}
		}

		const schedUrl = new URL(req.url);
		schedUrl.pathname = '/__scheduled';
		schedUrl.searchParams.append('cron', '* * * * *');
		return new Response(`To test the scheduled handler, ensure you have used the "--test-scheduled" then try running "curl ${schedUrl.href}".`);
	},

	// The scheduled handler is invoked at the interval set in our wrangler.jsonc's
	// [[triggers]] configuration.
	async scheduled(event, env, ctx): Promise<void> {
		// A Cron Trigger can make requests to other endpoints on the Internet,
		// publish to a Queue, query a D1 Database, and much more.
		//
		// We'll keep it simple and make an API call to a Cloudflare API:
		let resp = await fetch('https://api.cloudflare.com/client/v4/ips');
		let wasSuccessful = resp.ok ? 'success' : 'fail';

		// You could store this result in KV, write to a D1 Database, or publish to a Queue.
		// In this template, we'll just log the result:
		console.log(`trigger fired at ${event.cron}: ${wasSuccessful}`);
	},
} satisfies ExportedHandler<Env>;
