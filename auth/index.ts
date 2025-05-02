import { handle } from "hono/aws-lambda";
import { issuer } from "@openauthjs/openauth";
import { CodeUI } from "@openauthjs/openauth/ui/code";
import { CodeProvider } from "@openauthjs/openauth/provider/code";
import { MemoryStorage } from "@openauthjs/openauth/storage/memory";
import { subjects } from "./subjects";
import { Resource } from "sst";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import { db } from "../src/db/drizzle";
import { eq } from "drizzle-orm";
import { theme } from "~/lib/theme";
import { users } from "~/db/drizzle-schema";

async function getUserId(email: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    const newUser = await db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
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
      return ctx.subject("user", {
        id: await getUserId(value.claims.email),
      });
    }
    throw new Error("Invalid provider");
  },

  theme,
});

export const handler = handle(app);
