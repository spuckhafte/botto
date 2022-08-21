async function startCsv(msg, client, csv, jdb) {
    const msgArr = msg.content.toLowerCase().trim().split('-');
    if (msgArr.length !== 3) {
        await msg.reply({
            content: 'Invalid: `!csv-START-END` max cards: 20',
            allowedMentions: { repliedUser: false }
        });
        return;
    }

    const [_, start, end] = msgArr;
    if (isNaN(start) || isNaN(end)) {
        await msg.reply({
            content: 'Invalid: `!csv-START-END` max cards: 20',
            allowedMentions: { repliedUser: false }
        });
        return;
    }

    const userData = await jdb.getR('user', 'moral', ['userid', msg.author.id])
    if (!userData) {
        await msg.reply('Atleast do one mission or report to continue');
        return;
    }
    if (isNaN(userData.csv)) await exec();
    else {
        const minutesPassed = (msg.createdTimestamp - parseInt(userData.csv)) / (60 * 1000);
        if (minutesPassed < 5) {
            await msg.reply(`Wait: \`${Math.floor(minutesPassed)}/5\` *minutes*`);
            return;
        } else await exec();
    }

    async function exec() {
        let currentActive = parseInt(jdb.getEl('info', 'csv_on').current);
        if (currentActive >= 5) {
            msg.reply('Try again later, command is busy');
            return;
        }
        await csv(msg, client, jdb, currentActive, userData.entry);
    }
}

async function activeCsv(msg, jdb) {
    const active = jdb.getEl('info', 'csv_on').current;
    msg.reply(`**Active CSV conversions:** ${active}`);
}

async function csvCooldown(msg, jdb) {
    const userData = await jdb.getR('user', 'moral', ['userid', msg.author.id]);
    if (!userData) {
        await msg.reply('Atleast do one mission or report to continue');
        return;
    }
    const minutesPassed = (msg.createdTimestamp - parseInt(userData.csv)) / (60 * 1000);

    if (minutesPassed < 5) await msg.reply(`**Csv Cooldown:** \`${Math.floor(minutesPassed)}/5\` min`);
    else await msg.reply(`**Csv Cooldown:** ✅`);
}

module.exports = { startCsv, activeCsv, csvCooldown };