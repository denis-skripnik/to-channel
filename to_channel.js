const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const {CHANNEL_ID, TELEGRAM_BOT_TOKEN, minutes, min_length} = require('./config.json');
let channels_logins = [];

const { Bot } = require("grammy");
const bot = new Bot(TELEGRAM_BOT_TOKEN);
bot.start();

async function scrapeAndSend(login, only_keywords, not_keywords) {
  const url = `https://t.me/s/${login}`;

  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const posts = [];

    $('.tgme_widget_message').each((index, element) => {
      const post = {
        text: $(element).find('.tgme_widget_message_text').html(),
        url: `https://t.me/${$(element).data('post')}`,
        date: new Date($(element).find('.tgme_widget_message_date time').attr('datetime')).getTime()
      };

      posts.push(post);
    });

    const now = new Date().getTime();
    const hourAgo = now - minutes * 60 * 1000;

    const recentPosts = posts.filter(post => post.date > hourAgo);

    for (const post of recentPosts) {
      if (post.text === 'Live stream started') {
        post.text = `<a href="https://t.me/${login}?livestream">${post.text}</a>`;
      }
      if (channels_logins.some(function(v) { return post.text.indexOf(v) >= 0 && v !== login; })) continue;
      const htmlMessage = `<a href="${post.url}">${login}</a>\n${post.text}

${CHANNEL_ID}`;
const allowedTags = ['a', 'b', 'strong', 'i', 'em', 'code', 'pre', 'strike', 'del', 'u', 's', 'br', 'p'];
const message = htmlMessage
  .replace(/<(\/)?((?!\/?\s*)?(\b(?:a|b|strong|i|em|code|pre|strike|del|u|s|br|p)\b))(?:\s+(?!href)\S+="[^"]*")*(\s*href="[^"]*")?(?:(?:(?<=\s)\/)?>|(?<=\S)\/>)/gi, '<$1$2$4>')
  .replace(/(<p>|<\/p>|<br\/>|<br>)/gi, '\n')
  .replace('&nbsp;', '');
  if (message.length < min_length || message.indexOf('null') > -1) continue;
                const lowerCaseMessage = message.toLowerCase();
      if (only_keywords && only_keywords.length > 0 && only_keywords[0] !== '' && !only_keywords.some(keyword => lowerCaseMessage.includes(keyword))) continue;
      if (not_keywords && not_keywords.length > 0  && not_keywords[0] !== '' && not_keywords.some(keyword => lowerCaseMessage.includes(keyword))) continue;
     
      await bot.api.sendMessage(CHANNEL_ID, message, { parse_mode: 'HTML' });
    }
    console.log(`Scraped ${recentPosts.length} posts for @${login}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  } catch (error) {
    console.error(`Error scraping @${login}: ${error.message}`, JSON.stringify(error));
  }
}

async function main() {
const channels = JSON.parse(fs.readFileSync('channels.json', 'UTF-8'))
channels_logins = Object.keys(channels);

    for (let login in channels) {
    let search = (channels[login].only_keywords).split(',');
    let  not_keyword = (channels[login].not_keywords).split(',');
     await scrapeAndSend(login, search, not_keyword);
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
}
main();
setInterval(main, minutes * 60 * 1000); // Run every hour