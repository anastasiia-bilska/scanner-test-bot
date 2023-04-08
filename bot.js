const { Telegraf } = require("telegraf");
const TOKEN = "5823226377:AAFISE4Owq0of8nl6QhGKI4F5g3MoYN5Hhk";

const web_link = "https://aquamarine-pavlova-3a2162.netlify.app/";

const bot = new Telegraf(TOKEN);

bot.start((ctx) =>
  ctx.reply("Welcome :)))))", {
    reply_markup: {
      keyboard: [[{ text: "web app", web_app: { url: web_link } }]],
    },
  })
);

bot.launch();
