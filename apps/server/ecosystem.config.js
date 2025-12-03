module.exports = {
	apps: [
		{
			name: "decosa-server",
			script: "dist/index.js",
			cwd: process.cwd(),
			instances: 1,
			exec_mode: "fork",
			env: {
				NODE_ENV: "production",
				PORT: 3000,
			},
			error_file: "~/logs/server-error.log",
			out_file: "~/logs/server-out.log",
			log_date_format: "YYYY-MM-DD HH:mm:ss Z",
			merge_logs: true,
			autorestart: true,
			max_memory_restart: "1G",
			watch: false,
		},
	],
};
