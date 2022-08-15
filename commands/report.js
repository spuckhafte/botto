module.exports = async (botMsg, prev, msg) => {
    const report = botMsg.description.toLowerCase();
    const username = botMsg.title.split("'s report info")[0];
    const parsedReport = report.split('you saw a group of ')[1].split(' while wandering around the village')[0];
    console.log(parsedReport);
    const important = ['1', '2', '3', '4', '5', 'white', 'black', 'forest', 'dango']
    const ignore = ['shop', 'by']
    const sent = await prev.reply(`**${parsedReport}**`);
    setTimeout(async () => {
        const options = parseReportOption(msg.embeds[0].description);
        let found = false;
        let similar = 0;
        for (let opt in options) {
            const option = options[opt];
            for (let word of option.split(' ')) {
                if (parsedReport.includes(word)) {
                    if (options[0].includes(word) && options[1].includes(word) && options[2].includes(word) && !important.includes(word)) continue;
                    if (ignore.includes(word)) continue;
                    if (similar === 1 || similar === 0 || similar === 2) similar = similar + 1;
                    if (similar === 3) {
                        found = true;
                        let nums = { 1: '1️⃣', 2: '2️⃣', 3: '3️⃣' }
                        await sent.edit(`**Report: **${nums[parseInt(opt) + 1]}`)
                    }
                }
            }
            if (found) break;
            similar = 0;
        }
        setTimeout(async () => {
            const rxns = msg.reactions.cache.array()
            if (rxns.length === 0) return;
            let found = false;
            for (let rxn of rxns) {
                if (parseInt(rxn.count) <= 1) continue;
                let rxnUsers = rxn.users.cache.array()
                for (let rxnUsr of rxnUsers) {
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

function parseReportOption(string = '') {
    const options = string.split('\n');
    const parsed = [];
    options.forEach(opt => {
        parsed.push(opt.split(': ')[1]);
    })
    return parsed;
}