# Eyewitness 👀

A simple (and lightweight) service to observe the accessibility of web systems.

# how to

## deps

* node LTS
* mongoDb

## install
```
cp .env.example .env
<edit .env file>
npm i
```

## run
**start mongo db:**
```
npm run startDb
```
or if you're into Docker:
```
docker run -p 27017:27017 --rm mongo:3.4
```
for ephemeral/testing purpose

**start application:**
```
npm start
```

## develop
```
npm run watch
```

# access control

access control business logic:
1. frontend should only be accessible from ironshark local network (and VPN)
2. API endpoints should only be accessible via frontend
3. API endpoint `/api/v1/siteInfo` should also be accessable from public, but with some kind of authentication

## 1. frontend accessibility

The route `/` is protected by a middleware (see `src/backend/index.js`). The middleware checks for request header `"x-forwarded-for"` and compares to ironshark network public IPs. The authorized IPs are configured in `src/backend/config/index.js`.

*Note: You may have to change the configured IPs in the config when the ironshark public IPs change.*

For local development this protection is bypassed b/c `"x-forwarded-for"` header is not set.

## 2. API protection

The routes below (and including) `/api` are protected by a middleware (see `src/backend/index.js`). The middleware checks for request header `"x-auth"` that should contain the admin token. The token is configured in `src/backend/config/index.js`.

The frontends API requests are done with `"x-auth"` header so the frontend has full access to the API.

## 3. Public siteInfo endpoint

The API endpoint `/api/v1/siteInfo` is NOT protected by the `"x-auth"` header. If the `"x-auth"` header is NOT set it checks for the URL query parameter `token`.

Client tokens can be configured via the frontend ("Add Client")

Add the configured `token` as query param to the API request to get public access.

Public services should not use the `"x-auth"` header method to gain access. They should use the `token` query param method.

# Slackbot

Eyewitness also ships with a Slackbot.

Just take the token from the Bot created in [Slack](https://stuntcrew.slack.com/apps/manage/custom-integrations) and add it to the env variable `SLACK_TOKEN`.

See all Slackbot commands by typing `ey, help`.
