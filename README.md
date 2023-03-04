# to-channel
 We take data from several Telegram channels, and publish it in our own.

# install
``git clone https://denis-skripnik/to-channel``

``cd to-channel``

``npm install``

We wait...

# channels configuration
After installation, open channels.json
- We change channel1 to the channel login, from where we take the data;
- In not_keywords, we write words or parts of words, in the presence of which we skip the post.
- In only_keywords - the words, in the presence of which we publish.
- Replace channel2 with the login of the second channel, and configure the words.
- If necessary, we add new logins by copying channel1 from " to }, inclusive. After that, we insert after the first channel.

# Configuration
1. Open config.json
2. Change @login to the login of your channel.
3. Change "ADD_HEAR_TOKEN" to your bot's API key (we get it via /newbot in https://t.me/BotFather )
4. minutes - change 5 to its value (if you want to change the data update time).
5. Change 500 to a different minimum number of characters of posts at which placement is made in your channel (0 - disable the function).

# Launch
node to_channel.js

To work in the background:
For the first time
``npm i pm2 --g``

Then only this:
``pm2 start to_channel.js -o logs/out.log -e logs/errors.log``