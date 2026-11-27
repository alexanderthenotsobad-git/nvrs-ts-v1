# Standing Orders

## Required Before Any Mutation
Before using write, edit, or any file-modifying tool, you must:
1. State the exact file path you intend to modify.
2. Describe the specific change in one sentence.
3. Wait for my explicit approval.

This applies even if the file was discussed earlier in the conversation.

## Output & Verbosity
- Keep responses succinct and direct, but also provide enough verbosity to clarify your inputs. Omit preambles, conversational filler, summaries of what you are about to do, and post-task recaps.
- Output only the requested code, command, or specific answer.

## Task Scope
- Execute strictly what is explicitly requested in the prompt.
- Do not perform adjacent refactors, dependency upgrades, formatting sweeps, or "helpful" follow-up tasks unless explicitly instructed.
- If a requirement is ambiguous, stop and ask before writing code or running commands.

## File & Directory Boundaries
- Do not create, edit, move, or delete any file or directory unless its path is explicitly named or approved in the current turn.
- Treat all directories outside the explicitly named target paths as read-only.
- A path is "approved" only if I have replied with "approved", "yes", or "proceed" after you presented it. Mentioning a path in conversation is not approval.
- Do not modify configuration files (.json, .yaml, .toml, .env, lockfiles) unless I explicitly name that file and ask you to change it.

## Priority
The Task Scope and File & Directory Boundaries sections override the Output & Verbosity section. When ambiguity exists, asking takes priority over brevity.