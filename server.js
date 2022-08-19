const Discord = require('discord.js')
const serp = require('google-search-results-nodejs');
const details = require('./prvt');
const jdb = require('json-db-jdb')

const mission = require('./commands/mission');
const report = require('./commands/report');
const show = require('./commands/show');
const range = require('./commands/range');
const find = require('./commands/find');
const edit = require('./commands/edit');
const turnPage = require('./commands/turnPage');
const { manageOnline, showOnline, hideOnline } = require('./commands/online');
const ready = require('./commands/ready');

let search = new serp.GoogleSearch(details.keys[0]);
let key = 0;

search.account(function test(data) {
    let searchesLeft = data.plan_searches_left;
    if (searchesLeft == 0) {
        key = key + 1;
        search = new serp.GoogleSearch(details.keys[key]);
        search.account(data => test(data))
    }
})
setTimeout(() => {
    client.login(details.TOKEN);
}, 3000)

const client = new Discord.Client({
    intents: [
        Discord.Intents.FLAGS.GUILDS,
        Discord.Intents.FLAGS.GUILD_MESSAGES,
        Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS
    ]
})
client.once('ready', async () => ready(jdb));

client.on('messageReactionAdd', (msg, user) => turnPage(msg, user, jdb));
client.on('messageReactionRemove', (msg, user) => turnPage(msg, user, jdb));
client.on('messageCreate', async msg => {
    if ((msg.content.toLowerCase().trim() === 'n m' || msg.content.toLowerCase().trim() === 'n mission' || msg.content.toLowerCase().trim() === 'n r' || msg.content.toLowerCase().trim() === 'n report') && !msg.author.bot) {
        manageOnline(msg, jdb);
    }
    if (msg.author.id === '770100332998295572') {
        const prev = msg.channel.messages.cache.toJSON()[msg.channel.messages.cache.toJSON().length - 2];
        const botMsg = msg.channel.messages.cache.toJSON()[msg.channel.messages.cache.toJSON().length - 1].embeds[0];
        if (!botMsg || !botMsg.title) return;

        if (botMsg.title.includes('report info')) report(botMsg, prev, msg);
        if (botMsg.title.includes('rank mission')) mission(botMsg, prev, Google, jdb);
    }

    if (msg.content.toLowerCase().trim() === '!show' || msg.content.toLowerCase().trim() === '!s') show(msg, jdb);
    if (msg.content.toLowerCase().trim().startsWith('!range-') || msg.content.toLowerCase().trim().startsWith('!r-')) range(msg, jdb);
    if (msg.content.toLowerCase().trim().startsWith('!find-') || msg.content.toLowerCase().trim().startsWith('!f-')) find(msg, jdb);
    if (msg.content.toLowerCase().trim().startsWith('!edit-') || msg.content.toLowerCase().trim().startsWith('!e-')) edit(msg, jdb);
    if (msg.content.toLowerCase().trim().startsWith('!online') || msg.content.toLowerCase().trim().startsWith('!on')) showOnline(msg, Discord.MessageEmbed, jdb);
    if (msg.content.toLowerCase().trim().startsWith('!hide')) hideOnline(msg, jdb);

    if (msg.content.toLowerCase().startsWith('!servers')) {
        const guilds = [];
        for (let guild of client.guilds.cache.toJSON()) guilds.push(`**${guild.name}**\n`);
        const embed = new Discord.MessageEmbed()
            .setTitle('Servers')
            .setDescription(guilds.join(''))
            .setFooter(`Total: ${client.guilds.cache.toJSON().length}`)
            .setColor('BLUE');
        msg.channel.send({ embeds: [embed] });
    };

    if (msg.content.toLowerCase().startsWith('!reqs')) {
        new serp.GoogleSearch(details.keys[key]).account(async data => {
            await msg.channel.send(`**Searches Left: ${data.plan_searches_left}**`)
        })
    }
})

function Google(question, results) {
    search.json({
        q: question,
    }, result => {
        if (!result.answer_box) result.answer_box = {};
        let answerBoxResult = result.answer_box.snippet ? result.answer_box.snippet.toLowerCase() : 'Default';
        const otherAnswers = [];

        result.organic_results.forEach(res => {
            if (res.snippet) otherAnswers.push(res.snippet.toLowerCase());
        });
        results(answerBoxResult, otherAnswers);
    })
};