import { ReadonlyJSONValue } from "@rocicorp/zero";
import {
	PostgresJSConnection,
	PushProcessor,
	ZQLDatabase,
} from "@rocicorp/zero/pg";
import { pg } from "@volly/db/drizzle";
import { schema } from "@volly/db/schema";
import { createServerMutators } from "./mutators";
import { handle } from "hono/aws-lambda";
import { Hono } from "hono";
import { DecodedJWT, subjects } from "../auth/subjects";
import { parse } from "valibot";
import { createRemoteJWKSet, jwtVerify } from "jose";

const processor = new PushProcessor(
	new ZQLDatabase(new PostgresJSConnection(pg), schema),
);

export async function handlePush(
	authData: DecodedJWT,
	params: Record<string, string> | URLSearchParams,
	body: ReadonlyJSONValue,
) {
	const postCommitTasks: (() => Promise<void>)[] = [];
	const mutators = createServerMutators(authData, postCommitTasks);
	console.log("mutators", mutators);
	const response = await processor.process(mutators, params, body);
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
			console.log("JWKS", JWKS);
			const { payload } = await jwtVerify(authorization, JWKS);
			decodedJwt = {
				properties: parse(subjects.user, payload),
			};
		}
	} catch (e) {
		if (e instanceof Error) {
			return c.json({ error: e.message }, 401);
		}
		throw e;
	}

	console.log("decodedJwt", decodedJwt);

	if (!decodedJwt) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	const body = await c.req.parseBody();
	console.log("zero-push", c.req.query(), body);
	const response = await handlePush(
		decodedJwt,
		c.req.query(),
		body as ReadonlyJSONValue,
	);
	return c.json(response);
});

export const handler = handle(app);
