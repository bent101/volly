custom mutator
tanstack router
chat titles
model select, style select, search
	should all be part of the prompt, not the response
edit prompt
multiple root prompts
file upload/paste
delegation
fix auth
	not staying signed in (tokens deleting themselves)
	sometimes need to sign in twice
	api handler infinite looping?

fix weird default on schemas
figure out camel_case ?
deploy zero to prod
domain, email, deploy to prod

3 kinds of convesation branches:
	edits
		persist the active branch; user will probably stick to one, but we should still keep them all
	tangents
		persisted in a right sidebar (like a TOC), and the active one is not persisted (so it can be different between browser tabs)
	ai delegations
		prompt: analyze these 10 resumes
			ai: sure ill blah blah, then creates 10 tangents each with the same parentid as its own, then summarizes

add isTangent and isByAi to prompt
under a response:
	all the prompts that are tangents (in a list, sorted by createdat, open to side)
	all the prompts that arent (show as edits to the prompt with left/right arrows, sorted by createdat, open under)

prompt templates for repetitive self prompts?
	research the current state of \${\["food", "housing", "public transit"]} in \${\["SF", "Seattle", "Irvine"]}.


prompt A

response A

prompt B

response B




----- ---
----
------ -
- --
--- --
-
--
-- --