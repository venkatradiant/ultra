# Ultra — demo sign-in credentials

**Last updated:** 2026-08-06

## Read this first

**These are not secrets.** Ultra is a scripted demo with no backend. Every credential below ships
inside the client-side bundle, so anyone who can load the page can read all of them —
`src/config/access.ts` says so at the top of the file and this document says so here. A client
credential does **not** keep that client's data away from anybody: all of it is in the same bundle.

What these credentials do buy is that a URL cannot be casually forwarded into a live demo, and that
the link you send a client opens *their* tenant and shows them nothing else. Treat them as a
courtesy, not as a control.

---

## The doors

Replace `<host>` with wherever the app is deployed (locally, `http://localhost:3000`).

### Clients

Each of these opens exactly one tenant. There is no market picker behind them, and no route to
another client. Signing out returns to the same page.

| Client | URL | Username | Password |
|---|---|---|---|
| Navy Federal Credit Union | `<host>/login/nfcu` | `nfcu` | `nfcu@9705` |
| United States Senate FCU | `<host>/login/ussfcu` | `ussfcu` | `ussfcu@9705` |
| Educational Systems FCU | `<host>/login/esfcu` | `esfcu` | `esfcu@9705` |
| Pentagon Federal Credit Union | `<host>/login/penfed` | `penfed` | `penfed@9705` |
| Newfold Digital | `<host>/login/newfold` | `newfold` | `newfold@9705` |
| Aramco — TrackLynk.AI | `<host>/login/aramco` | `aramco` | `aramco@9705` |
| AT&T — AI Billing Workbench | `<host>/login/att` | `att` | `att@9705` |
| Riverside Health System | `<host>/login/riverside` | `riverside` | `riverside@9705` |
| Financial Services (generic) | `<host>/login/fs` | `fs` | `fs@9705` |

Usernames are matched case-insensitively and surrounding spaces are ignored. Passwords are
case-sensitive.

### Platform

| | |
|---|---|
| **URL** | `<host>/login/ultra` |
| **Username** | `ultra` |
| **Password** | `ultra@9705` |

This is the door to the **market and client picker** — sign in here and you can enter any client.
Keep this one; hand out the client rows above.

### Bypass link

`<host>/?access=rdvr@9705` skips the platform sign-in entirely and lands on the picker. The token
is stripped from the URL on arrival, and the grant lasts for that browser tab only. It works on any
route. Overridable at build time via `VITE_POC_ACCESS_KEY`.

---

## Behaviour worth knowing

- **Each door takes only its own credential.** `ultra` / `ultra@9705` is rejected at
  `/login/nfcu`, and `nfcu`'s credential is rejected at `/login/aramco` and at `/login/ultra`.
- **The market picker has exactly two ways in:** the `?access=` link, or the platform credential
  entered at `/login/ultra`. Anyone signed in to a client who navigates there gets an **Access
  denied** screen naming their workspace and a button back into it — no sign-in form, and no
  mention of the token or the credential.
- **Signing out of a client returns to that client's sign-in page**, always — including when you
  entered through the Ultra picker. The platform door is a URL you have to know.
- **A session lasts for the browser tab.** Refreshing keeps you signed in; closing the tab does
  not. Two clients can be open side by side in two tabs.
- **A deep link while signed out** (say a bookmarked `/live-site`) returns to the last tenant's
  sign-in page rather than the platform's.
- **An unknown slug** — `/login/anything-else` — falls back to `/login/ultra`.
- **In development only**, each client page prints its own credential in small type under the
  footer. That hint is compiled out of production builds (`import.meta.env.DEV`).

---

## Adding a client

Two files, and a test that will fail if you miss one:

1. `src/config/clients.js` — add `loginSlug: '<slug>'` to the new entry.
2. `src/config/access.ts` — add `<clientId>: { slug: '<slug>', password: '<slug>@9705' }` to
   `CLIENT_CREDENTIALS`.

`src/config/access.test.ts` asserts every registered client has a credential, that the two files
agree, that slugs are unique and URL-safe, and that no client's credential opens another's. A
client registered without a front door fails the suite rather than shipping a tenant nobody can
reach.

Then update the table above — it is the handout, and nothing generates it.
