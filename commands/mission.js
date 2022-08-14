const numToName = require('number-to-words');

module.exports = async (botMsg, prev, Google, jdb) => {
    const question = botMsg.description.split('**')[1];
    const options = parseOptions(botMsg.description);

    const storedQnAs = jdb.getEl('qna', 'ans');
    if (Object.keys(storedQnAs).includes(question)) {
        console.log(options)
        console.log(storedQnAs[question])
        console.log(options.indexOf(storedQnAs[question].trim()) + 1)
        if (storedQnAs[question].includes('=')) storedQnAs[question] = storedQnAs[question].replace('=', '-')
        let correct = options.indexOf(storedQnAs[question].trim()) + 1;
        await prev.reply(`**Organic:** ${correct}\n*from memory*`);
    } else {
        Google(question, async (main, others) => {
            const [correctOption, type] = matchOptions(main, others, options);
            console.log(correctOption, type);
            const ansSent = await prev.reply(`**${type}:** ${correctOption}`)
            const exportQ = {}
            exportQ[question] = options[parseInt(correctOption) - 1]
            if (type === 'Organic') {
                await jdb.assignI('qna', 'ans', exportQ);
                console.log('stored!')
            } else {
                setTimeout(async () => {
                    const totalRxns = ansSent.reactions.cache.array().length;
                    if (totalRxns == 0) return;
                    await jdb.assignI('qna', 'ans', exportQ);
                    console.log('random_stored');
                    await ansSent.edit(`**${type}:** ${correctOption}, *stored random*`);
                }, 8000)
            }
        })
    }
}

function matchOptions(main, others, options) {
    const ignore = ['of', 'the', 'in', 'to', 'is', 'do', 'he', 'too', 'what', 'a']
    let correct;
    main = main.replace(/[^\w\s\']|_/g, "").replace(/\s+/g, " ");
    for (let word of main.split(' ')) {
        word = parseNumToName(word)
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
            word = parseNumToName(word)
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

function parseOptions(query) {
    const option = query.split('\n');
    option.shift();
    option.pop();
    option.pop();
    option.forEach((opt, ind) => {
        option[ind] = parseNumToName(opt.split(':')[2].trim().toLowerCase());
    });
    return option;
}

function parseNumToName(string) {
    let parsedString = '';
    string.split(' ').forEach(char => {
        let num = parseInt(char);
        if (!isNaN(num)) parsedString += numToName.toWords(num) + ' '
        else parsedString += char + ' '
    })
    return parsedString.trim();
}