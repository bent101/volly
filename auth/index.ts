import { handle } from "hono/aws-lambda";
import { issuer } from "@openauthjs/openauth";
import { CodeUI } from "@openauthjs/openauth/ui/code";
import { CodeProvider } from "@openauthjs/openauth/provider/code";
import { MemoryStorage } from "@openauthjs/openauth/storage/memory";
import { subjects } from "./subjects";
import { Resource } from "sst";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

async function getUser(email: string) {
  // Get user from database and return user ID
  return "123";
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
              FromEmailAddress: Resource.MyEmail.sender,
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
        id: await getUser(value.claims.email),
      });
    }
    throw new Error("Invalid provider");
  },

  theme: {
    primary: "#de3b00",
    background: {
      light: "#F0F0F0",
      dark: "#383838",
    },
  },
});

export const handler = handle(app);
