import { handle } from "hono/aws-lambda";
import { issuer } from "@openauthjs/openauth";
import { CodeUI } from "@openauthjs/openauth/ui/code";
import { CodeProvider } from "@openauthjs/openauth/provider/code";
import { MemoryStorage } from "@openauthjs/openauth/storage/memory";
import { subjects } from "./subjects";
import { Resource } from "sst";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@volly/db/drizzle";
import { users } from "@volly/db/drizzle-schema";

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
		primary: "hsl(16, 100%, 44%)",
		background: {
			light: "hsl(0, 0%, 98%)",
			dark: "hsl(240, 4%, 17%)",
		},
	},
});

export const handler = handle(app);
