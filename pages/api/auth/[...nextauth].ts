import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

export default NextAuth({
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_SECRET!,
		}),
	],
	theme: {
		colorScheme: 'light',
		logo: '/logo.png',
	},
	// callbacks: {
	// 	async signIn({ data }) {
	// 		return true
	// 	},
	// 	async redirect({ url, baseUrl }) {
	// 		return baseUrl
	// 	},
	// 	async session({ session, user, token }) {
	// 		return session
	// 	},
	// 	async jwt({ token, user, account, profile, isNewUser }) {
	// 		return token
	// 	},
	// },
})
