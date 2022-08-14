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

const client = new Discord.Client();
client.once('ready', () => console.log('Ready'));

client.on('messageReactionAdd', (msg, user) => turnPage(msg, user, jdb));
client.on('messageReactionRemove', (msg, user) => turnPage(msg, user, jdb));
client.on('message', async msg => {
    if (msg.author.id === '770100332998295572') {
        const prev = msg.channel.messages.cache.array()[msg.channel.messages.cache.array().length - 2];
        const botMsg = msg.channel.messages.cache.array()[msg.channel.messages.cache.array().length - 1].embeds[0];
        if (!botMsg || !botMsg.title) return;

        if (botMsg.title.includes('report info')) report(botMsg, prev, msg);
        if (botMsg.title.includes('rank mission')) mission(botMsg, prev, Google, jdb);
    }

    if (msg.content.toLowerCase().trim() === '!show' || msg.content.toLowerCase().trim() === '!s') show(msg, jdb);
    if (msg.content.toLowerCase().startsWith('!range') || msg.content.toLowerCase().startsWith('!r')) range(msg, jdb);
    if (msg.content.toLowerCase().startsWith('!find') || msg.content.toLowerCase().startsWith('!f')) find(msg, jdb);
    if (msg.content.toLowerCase().startsWith('!edit') || msg.content.toLowerCase().startsWith('!e')) edit(msg, jdb);

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