import { PushProcessor } from "@rocicorp/zero/pg";
import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { parse } from "valibot";
import { createServerMutators } from "./server-mutators";
import { zqlDb } from "./zqlDb";

import { createSubjects } from "@openauthjs/openauth/subject";
import { InferOutput, object, string } from "valibot";

const subjects = createSubjects({
	user: object({
		userId: string(),
	}),
});

type DecodedJWT = { properties: InferOutput<typeof subjects.user> };

const processor = new PushProcessor(zqlDb);

export async function handlePush(authData: DecodedJWT, request: Request) {
	const postCommitTasks: (() => Promise<void>)[] = [];
	const mutators = createServerMutators(authData, postCommitTasks);
	const response = await processor.process(mutators, request);
	await Promise.all(postCommitTasks.map((task) => task()));
	return response;
}

const app = new Hono();

app.post("/zero-push", async (c) => {
	let { authorization } = c.req.header();

	if (authorization !== undefined) {
		if (!authorization.toLowerCase().startsWith("bearer ")) {
			return c.json({ error: "Invalid authorization header" }, 401);
		}
		authorization = authorization.substring("Bearer ".length);
	}

	const jwksUrl = process.env.ZERO_AUTH_JWKS_URL;
	let decodedJwt: DecodedJWT | undefined;

	try {
		if (jwksUrl && authorization) {
			const JWKS = createRemoteJWKSet(new URL(jwksUrl));

			const { payload } = await jwtVerify(authorization, JWKS);
			decodedJwt = {
				properties: parse(subjects.user, payload.properties),
			};
		}
	} catch (e) {
		console.error("JWT verification failed:", e);
		if (e instanceof Error) {
			return c.json({ error: e.message }, 401);
		}
		throw e;
	}

	if (!decodedJwt) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	const response = await handlePush(decodedJwt, c.req.raw);
	return c.json(response);
});

export { app };
export const handler = handle(app);
