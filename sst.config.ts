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
      proxy: true,
    });

    const email = new sst.aws.Email("MyEmail", {
      sender: `bentomlin101@gmail.com`,
    });

    const auth = new sst.aws.Auth("MyAuth", {
      issuer: {
        handler: "auth/index.handler",
        link: [email, db],
      },
    });

    new sst.aws.Nextjs("MyWeb", {
      vpc,
      link: [auth, db],
    });

    new sst.x.DevCommand("Studio", {
      link: [db],
      dev: {
        command: "npx drizzle-kit studio",
      },
    });
  },
});
