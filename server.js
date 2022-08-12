const Discord = require('discord.js')
const serp = require('google-search-results-nodejs');
const numToName = require('number-to-words');
const jdb = require('json-db-jdb');
const details = require('./prvt');
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
    client.login(TOKEN)
}, 3000)

const client = new Discord.Client();

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
}

client.once('ready', () => {
    console.log('Ready');
});

client.on('messageReactionAdd', (msg, user) => {
    editQPage(msg, user);
})

client.on('messageReactionRemove', (msg, user) => {
    editQPage(msg, user);
})

function editQPage(msg, user) {
    if (user.bot) return;
    if (!msg.message || !msg.message.content || !msg.message.content.startsWith('**Page ') || !msg.message.author.bot || !msg.message.author.username.startsWith('botto')) return;
    let pageNo = parseInt(msg.message.content.split('**Page ')[1].split(':')[0]);
    if (msg.emoji.name == '⏩') pageNo = pageNo + 1;
    if (msg.emoji.name == '⏪') pageNo = pageNo - 1;
    if (pageNo <= 0) return

    // 1: (0)*10+1 -> 2: (1)*10+1 -> 3: (2)*10+1
    const start = (pageNo - 1) * 10 + 1;
    let end = start + 9;

    const qNa = jdb.getEl('qna', 'ans')


    if (start <= Object.keys(qNa).length && end > Object.keys(qNa).length) end = Object.keys(qNa).length;
    if (start > Object.keys(qNa).length || start <= 0 || end > Object.keys(qNa).length) return;

    const parsedQnA = {}
    Object.keys(qNa).forEach((q, i) => {
        if (i >= start && i <= end) parsedQnA[`${i}. ${q}`] = qNa[q].trim();
    });

    msg.message.edit(`**Page ${pageNo}:**\`\`\`json
${JSON.stringify(parsedQnA, true, 2)}\`\`\`
    `)
}

client.on('message', async msg => {
    if (msg.author.id === '770100332998295572') {
        const prev = msg.channel.messages.cache.array()[msg.channel.messages.cache.array().length - 2]
        const prevMsg = prev.content.toLowerCase();
        const botMsg = msg.channel.messages.cache.array()[msg.channel.messages.cache.array().length - 1].embeds[0]

        if (!botMsg || !botMsg.title) return;

        if (prevMsg == 'n r' && botMsg.title.includes('report info')) {
            const report = botMsg.description.toLowerCase();
            const username = botMsg.title.split(' ')[0].substring(0, botMsg.title.split(' ')[0].length - 2);
            const parsedReport = report.split('you saw a group of ')[1].split(' while wandering around the village')[0];
            const sent = await prev.reply(`**${parsedReport}**`);
            setTimeout(async () => {
                const options = parseReportOption(msg.embeds[0].description);
                let found = false;
                for (let word of parsedReport.split(' ')) {
                    for (let opt in options) {
                        let option = options[opt]
                        if (option.includes(word)) {
                            if (options[0].includes(word) && options[1].includes(word) && options[2].includes(word)) break;
                            if ((options[0].includes(word) && options[1].includes(word)) || (options[0].includes(word) && options[2].includes(word)) || (options[1].includes(word) && options[2].includes(word))) continue;
                            found = true;
                            let nums = { 1: '1️⃣', 2: '2️⃣', 3: '3️⃣' }
                            await sent.edit(`**Report: **${nums[parseInt(opt) + 1]}`)
                            break;
                        }
                    }
                    if (found) break;
                }
                setTimeout(async () => {
                    const rxns = msg.reactions.cache.array()
                    if (rxns.length === 0) return;
                    const found = false;
                    for (let rxn of rxns) {
                        if (parseInt(rxn.count) <= 1) continue;
                        let rxnUsers = rxn.users.cache.array()
                        for (let rxnUsr of rxnUsers) {
                            console.log(rxnUsr.username)
                            if (rxnUsr.username == username) {
                                found = true;
                                break;
                            }
                        }
                        if (found) break;
                    }
                    if (found) return;
                    await prev.reply('react **asap**');
                }, 4000)
            }, 8000)
        }
        if (botMsg.length == 0 || prevMsg != 'n m' || !botMsg.title.includes('rank mission')) return;

        const question = botMsg.description.split('**')[1];
        const options = parseOptions(botMsg.description);

        const storedQnAs = jdb.getEl('qna', 'ans');
        if (Object.keys(storedQnAs).includes(question)) {
            console.log(options)
            console.log(storedQnAs[question])
            console.log(options.indexOf(storedQnAs[question].trim()) + 1)
            const correct = options.indexOf(storedQnAs[question].trim()) + 1;
            await prev.reply(`**Organic:** ${correct}\n*from memory*`);
        } else {
            Google(question, async (main, others) => {
                const [correctOption, type] = matchOptions(main, others, options);
                console.log(correctOption, type);
                await prev.reply(`**${type}:** ${correctOption}`)
                const exportQ = {}
                exportQ[question] = options[parseInt(correctOption) - 1]
                if (type === 'Organic') {
                    await jdb.assignI('qna', 'ans', exportQ);
                    console.log('stored!')
                }
            })
        }
    }


    if (msg.content.toLowerCase() === '!show' || msg.content.toLowerCase() === '!s') {
        const qNa = jdb.getEl('qna', 'ans')
        const parsedQnA = {}
        Object.keys(qNa).forEach((q, i) => {
            if (i && i <= 10) parsedQnA[`${i}. ${q}`] = qNa[q].trim();
        });
        await msg.channel.send(`**Page 1:**\`\`\`json
${JSON.stringify(parsedQnA, true, 2)}\`\`\`
            `).then(msg => {
            msg.react("⏪")
            msg.react("⏩")
        })
    }

    if (msg.content.toLowerCase().startsWith('!range') || msg.content.toLowerCase().startsWith('!r')) {
        let arr = msg.content.split('-');
        if (arr.length != 3) return;
        if (isNaN(arr[2]) || isNaN(arr[1])) return;
        let [from, to] = [parseInt(arr[1]), parseInt(arr[2])];

        const qNa = jdb.getEl('qna', 'ans')
        const parsedQnA = {}

        if (from > Object.keys(qNa).length || from <= 0 || to > Object.keys(qNa).length && to < from) return;
        Object.keys(qNa).forEach((q, i) => {
            if (i >= from && i <= to) parsedQnA[`${i}. ${q}`] = qNa[q].trim();
        });
        await msg.channel.send(`\`\`\`json
${JSON.stringify(parsedQnA, true, 2)}\`\`\`
            `)

    }

    if (msg.content.toLowerCase().startsWith('!find') || msg.content.toLowerCase().startsWith('!f')) {
        const qNa = jdb.getEl('qna', 'ans')
        const parsedQnA = {}
        Object.keys(qNa).forEach((q, i) => {
            if (i) parsedQnA[`${i}. ${q}`] = qNa[q].trim();
        });

        msg.content = msg.content.toLowerCase();
        if (msg.content.split('-').length !== 3) return;
        let [_, searchType, searchQuery] = msg.content.split('-');
        searchQuery = searchQuery.trim();

        if (searchType === 'i' || searchType === 'index') {
            if (isNaN(searchQuery)) return;
            if (parseInt(searchQuery) <= 0 || parseInt(searchQuery) > Object.keys(parsedQnA).length) return;
            const res1 = Object.keys(parsedQnA)[parseInt(searchQuery) - 1];
            const res2 = parsedQnA[res1];

            await msg.channel.send(`**${res1}**\n**Ans:** \`${res2}\``);
        }

        if (searchType === 't' || searchType === 'text') {
            if (typeof searchType !== 'string') return;
            if (searchType === '' || searchType === ' ') return;

            const foundOnes = {}
            Object.keys(parsedQnA).forEach(key => {
                if (key.toLowerCase().includes(searchQuery)) foundOnes[key] = parsedQnA[key]
            })
            if (Object.keys(foundOnes).length === 0) await msg.channel.send(`None`)
            else await msg.channel.send(`\`\`\`json
${JSON.stringify(foundOnes, true, 2)}\`\`\`
                `);
        }
    }

    if (details.officials.includes(msg.author.id)) {
        if (!msg.content.toLowerCase().startsWith('!edit') && !msg.content.toLowerCase().startsWith('!e')) return;
        const qNa = jdb.getEl('qna', 'ans')
        const parsedQnA = {}
        Object.keys(qNa).forEach((q, i) => {
            if (i) parsedQnA[`${i}. ${q}`] = qNa[q].trim();
        });

        msg.content = msg.content.toLowerCase();
        if (msg.content.split('-').length !== 3) return;

        let [_, questionNo, answer] = msg.content.split('-');
        if (isNaN(questionNo) || answer === '' || answer === ' ') return;
        answer = answer.trim().toLowerCase(); questionNo = parseInt(questionNo)
        if (parseInt(questionNo) <= 0 || parseInt(questionNo) > Object.keys(parsedQnA).length) return;

        const question = Object.keys(parsedQnA)[questionNo - 1].substr(3).trim();
        const exportEdit = {}
        exportEdit[question] = answer;
        await jdb.assignI('qna', 'ans', exportEdit);
        await msg.channel.send(`Edited!\n\`\`\`json
"${Object.keys(parsedQnA)[questionNo - 1]}": "${answer}"\`\`\`
        `);
    }
})

// let que = `** How many gates did Lee open during the first Chūnin Exams ?**
// :one: 5
// :two: 6
// :three: 3
// ══════════════════════
// **Type the number of correct answer in chat!**`
// Google('How many gates did Lee open during the first Chūnin Exams?', (main, oth) => {
//     const correct = matchOptions(main, oth, parseOptions(que));
//     console.log(correct)
// })

function parseOptions(query) {
    const option = query.split('\n');
    option.shift();
    option.pop();
    option.pop();
    option.forEach((opt, ind) => {
        option[ind] = parse(opt.split(':')[2].trim().toLowerCase());
    });
    return option;
}

function matchOptions(main, others, options) {
    const ignore = ['of', 'the', 'in', 'to', 'is', 'do', 'he', 'too', 'what', 'a']
    let correct;
    main = main.replace(/[^\w\s\']|_/g, "").replace(/\s+/g, " ");
    for (let word of main.split(' ')) {
        word = parse(word)
        for (let optionInd in options) {
            if (options[optionInd].split(options[optionInd].includes(',') ? ', ' : ' ').includes(word)) {
                if (options[0].includes(word) && options[1].includes(word) && options[2].includes(word)) continue;
                if (ignore.includes(word)) continue;
                console.log(options, word)
                console.log(main)
                correct = parseInt(optionInd);
                break;
            }
        }
        if (typeof correct === 'number') break;
    }
    if (typeof correct === 'number') return [correct + 1, 'Organic'];

    for (let other of others) {
        other = other.replace(/[^\w\s\']|_/g, "").replace(/\s+/g, " ");
        for (let word of other.split(' ')) {
            word = parse(word)
            for (let optionInd in options) {
                if (options[optionInd].split(options[optionInd].includes(',') ? ', ' : ' ').includes(word)) {
                    if (options[0].includes(word) && options[1].includes(word) && options[2].includes(word)) continue;
                    if (options[0].includes(word) && options[2].includes(word)) continue;
                    if (options[1].includes(word) && options[2].includes(word)) continue;
                    if (options[1].includes(word) && options[2].includes(word)) continue;
                    if (ignore.includes(word)) continue;
                    console.log(options, word)
                    console.log(other)
                    correct = parseInt(optionInd);
                    break;
                }
            }
            if (typeof correct === 'number') break;
        }
        if (typeof correct === 'number') break;
    }
    if (typeof correct === 'number') return [correct + 1, 'Organic'];
    else {
        console.log('Random')
        console.log(others, options)
        return [[0, 1, 2][Math.floor(Math.random() * [0, 1, 2].length)] + 1, 'Random'];
    }
}

// let string = `:one: Reporting 4 suspicious individuals in black in the dango shop
// :two: Reporting 3 suspicious individuals in grey by the gate
// :three: Reporting 4 suspicious individuals in grey in the dango shop`

function parseReportOption(string = '') {
    const options = string.split('\n');
    const parsed = [];
    options.forEach(opt => {
        parsed.push(opt.split(': ')[1]);
    })
    return parsed;
}

// parseReportOption(string)


function parse(string) {
    let parsedString = '';
    string.split(' ').forEach(char => {
        let num = parseInt(char);
        if (!isNaN(num)) parsedString += numToName.toWords(num) + ' '
        else parsedString += char + ' '
    })
    return parsedString.trim();
}
// console.log(parse('hi 4 is best 3'))

// Google('Who was killed by Orochimaru?', (main, others) => {
//     const correctOption = matchOptions(main, others, parseOptions(que));
//     console.log(correctOption)
// })


// Google('What a curious little one you are', (main, ot) => {
//     console.log(main)
// })
