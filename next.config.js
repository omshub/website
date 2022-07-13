/** @type {import('next').NextConfig} */

module.exports = {
	reactStrictMode: true,
	env: {
		baseUrl: process.env.BASE_URL,
		apiKey: process.env.API_KEY,
		authDomain: process.env.AUTH_DOMAIN,
		projectId: process.env.PROJECT_ID,
		storageBucket: process.env.STORAGE_BUCKET,
		messagingSenderId: process.env.MESSAGING_SENDER_ID,
		appId: process.env.APP_ID,
		measurementId: process.env.MEASUREMENT_ID,
	},
}
