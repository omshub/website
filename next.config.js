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
	transpilePackages: ["@mui/system", "@mui/material", "@mui/icons-material"],
	modularizeImports: {
		"@mui/material/?(((\\w*)?/?)*)": {
		transform: "@mui/material/{{ matches.[1] }}/{{member}}",
		},
		"@mui/icons-material/?(((\\w*)?/?)*)": {
		transform: "@mui/icons-material/{{ matches.[1] }}/{{member}}",
		},
		async headers() {
    return [
		{	
			source: "/:path*",
			headers:[
				{
					
			key: "X-DNS-Prefetch-Control",
			value: "on",
		},
		{
			key: "Strict-Transport-Security",
			value: "max-age=63072000; includeSubDomains; preload",
		},
		{
			key: "X-XSS-Protection",
			value: "1; mode=block",
		},
		{
			key: "X-Frame-Options",
			value: "SAMEORIGIN",
		},
		{
			key: "X-Content-Type-Options",
			value: "nosniff",
		},
		{
			key: "Referrer-Policy",
			value: "origin-when-cross-origin",
		},
			]
		}
		
	]
  },
}
}
