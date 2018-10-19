# authbot
Simple Discord bot that can add/remove SeAT roles to/from users.

To use:
- Create a Discord bot, note the token and client ID
- Create a SeAT token at `https://<YOUR-SEAT-URL>/api-admin`
- Add the bot to the server: `https://discordapp.com/oauth2/authorize?client_id=<YOUR-CLIENT-ID>&scope=bot`
- Clone this repo
- `npm install`
- `cp .env.example .env`
- Fill in all .env fields
- `node index.js`
