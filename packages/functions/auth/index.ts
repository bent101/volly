import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import { issuer } from "@openauthjs/openauth";
import { CodeProvider } from "@openauthjs/openauth/provider/code";
import { MemoryStorage } from "@openauthjs/openauth/storage/memory";
import { CodeUI } from "@openauthjs/openauth/ui/code";
import { db } from "@volly/db/drizzle";
import { users } from "@volly/db/drizzle-schema";
import { eq } from "drizzle-orm";
import { handle } from "hono/aws-lambda";
import { nanoid } from "nanoid";
import { Resource } from "sst";
import { subjects } from "./subjects";

async function getUserId(email: string) {
	const user = await db.query.users.findFirst({
		where: eq(users.email, email),
	});

	if (!user) {
		const newUser = await db
			.insert(users)
			.values({
				id: nanoid(),
				email,
			})
			.returning();
		return newUser[0].id;
	}

	return user.id;
}

const app = issuer({
	subjects,
	storage: MemoryStorage(),
	// Remove after setting custom domain
	allow: async () => true,
	providers: {
		code: CodeProvider(
			CodeUI({
				sendCode: async ({ email }, code) => {
					console.log("sending code", email, code);

					const client = new SESv2Client();

					await client.send(
						new SendEmailCommand({
							FromEmailAddress: Resource.Email.sender,
							Destination: {
								ToAddresses: [email],
							},
							Content: {
								Simple: {
									Subject: { Data: "Your code" },
									Body: { Text: { Data: `code: ${code}` } },
								},
							},
						}),
					);
				},
			}),
		),
	},
	success: async (ctx, value) => {
		if (value.provider === "code") {
			const userId = await getUserId(value.claims.email);
			console.log("userId", userId);
			return ctx.subject("user", {
				userId: userId,
			});
		}
		throw new Error("Invalid provider");
	},

	theme: {
		favicon: "http://localhost:5173/favicon.png",
		logo: "http://localhost:5173/favicon.png",
		radius: "lg",
		title: "Sign in | Volly",
		primary: "hsl(16, 75%, 45%)",
		background: {
			light: "hsl(0, 0%, 95%)",
			dark: "hsl(240, 0%, 14%)",
		},
	},
});

export const handler = handle(app);
