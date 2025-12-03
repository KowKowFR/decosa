module.exports = {
	apps: [
		{
			name: "decosa-web",
			script: "node_modules/next/dist/bin/next",
			args: "start",
			cwd: process.cwd(),
			instances: 1,
			exec_mode: "fork",
			env: {
				NODE_ENV: "production",
				PORT: 3001,
			},
			error_file: "~/logs/web-error.log",
			out_file: "~/logs/web-out.log",
			log_date_format: "YYYY-MM-DD HH:mm:ss Z",
			merge_logs: true,
			autorestart: true,
			max_memory_restart: "1G",
			watch: false,
		},
	],
};
