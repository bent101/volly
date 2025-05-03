/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
	app(input) {
		return {
			name: "volly",
			removal: input?.stage === "production" ? "retain" : "remove",
			protect: ["production"].includes(input?.stage),
			home: "aws",
		};
	},

	async run() {
		const vpc = new sst.aws.Vpc("Vpc", {
			bastion: true,
			nat: "managed",
		});

		const db = new sst.aws.Postgres("Database", {
			vpc,
			dev: {
				username: "postgres",
				password: "password",
				database: "local",
				port: 7004,
			},
		});

		new sst.x.DevCommand("DockerCompose", {
			dev: {
				command: "npm run start-db",
			},
		});

		const dbConnectionString = $interpolate`postgresql://${db.username}:${db.password}@${db.host}:${db.port}/${db.database}`;

		const email = new sst.aws.Email("Email", {
			sender: `bentomlin101@gmail.com`,
		});

		const auth = new sst.aws.Auth("Auth", {
			issuer: {
				handler: "src/auth/index.handler",
				link: [email, db],
			},
		});

		new sst.x.DevCommand("Studio", {
			link: [db],
			dev: {
				command: "npx drizzle-kit studio",
			},
		});

		const replicationBucket = $dev
			? undefined
			: new sst.aws.Bucket(`ReplicationBucket`);

		const zeroEnv = {
			ZERO_UPSTREAM_DB: dbConnectionString,
			ZERO_AUTH_JWKS_URL: $interpolate`${auth.url}/.well-known/jwks.json`,
			ZERO_REPLICA_FILE: "sync-replica.db",
			ZERO_IMAGE_URL: `rocicorp/zero:0.19.2025043001`,
			...(replicationBucket && {
				ZERO_LITESTREAM_BACKUP_URL: $interpolate`s3://${replicationBucket.name}/backup`,
			}),
		};

		let zeroCacheUrl: string | $util.Output<string> = "http://localhost:4848/";

		if ($dev) {
			new sst.x.DevCommand("ZeroDev", {
				environment: zeroEnv,
				dev: {
					command: "npx zero-cache-dev -p src/db/schema.ts",
				},
			});
		} else {
			const cluster = new sst.aws.Cluster(`Cluster`, {
				vpc,
			});

			const replicationManager = new sst.aws.Service(`ReplicationManager`, {
				cluster,
				dev: false,
				cpu: "0.5 vCPU",
				memory: "1 GB",
				architecture: "arm64",
				image: zeroEnv.ZERO_IMAGE_URL,
				link: [replicationBucket],
				health: {
					command: ["CMD-SHELL", "curl -f http://localhost:4849/ || exit 1"],
					interval: "5 seconds",
					retries: 3,
					startPeriod: "300 seconds",
				},
				environment: {
					...zeroEnv,
					ZERO_CHANGE_MAX_CONNS: "3",
					ZERO_NUM_SYNC_WORKERS: "0",
				},
				loadBalancer: {
					public: false,
					ports: [
						{
							listen: "80/http",
							forward: "4849/http",
						},
					],
				},
				transform: {
					loadBalancer: {
						idleTimeout: 3600,
					},
					target: {
						healthCheck: {
							enabled: true,
							path: "/keepalive",
							protocol: "HTTP",
							interval: 5,
							healthyThreshold: 2,
							timeout: 3,
						},
					},
				},
			});

			const zeroCache = new sst.aws.Service(`ZeroCache`, {
				cluster,
				dev: false,
				cpu: "1 vCPU",
				memory: "2 GB",
				architecture: "arm64",
				image: zeroEnv.ZERO_IMAGE_URL,
				link: [replicationBucket],
				health: {
					command: ["CMD-SHELL", "curl -f http://localhost:4848/ || exit 1"],
					interval: "5 seconds",
					retries: 3,
					startPeriod: "300 seconds",
				},
				environment: {
					...zeroEnv,
					ZERO_CHANGE_STREAMER_URI: replicationManager.url,
				},
				logging: {
					retention: "1 month",
				},
				loadBalancer: {
					public: true,
					rules: [{ listen: "80/http", forward: "4848/http" }],
				},
				transform: {
					target: {
						healthCheck: {
							enabled: true,
							path: "/keepalive",
							protocol: "HTTP",
							interval: 5,
							healthyThreshold: 2,
							timeout: 3,
						},
						stickiness: {
							enabled: true,
							type: "lb_cookie",
							cookieDuration: 120,
						},
						loadBalancingAlgorithmType: "least_outstanding_requests",
					},
				},
			});

			zeroCacheUrl = zeroCache.url;
		}

		new sst.aws.StaticSite("Web", {
			build: {
				output: "dist",
				command: "npm run build",
			},
			environment: {
				VITE_ZERO_CACHE_URL: zeroCacheUrl,
				VITE_AUTH_ISSUER_URL: auth.url,
			},
		});
	},
});
