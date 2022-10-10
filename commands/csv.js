const fs = require('fs/promises');

module.exports = async (msg, client, jdb, currentActive, userEntry) => {
    let dir = await fs.readdir(`./sheets`);
    if (!dir.join(' ').includes(msg.author.id)) {
        await fs.appendFile(`./sheets/${msg.author.id}.csv`, '');
        msg.reply('Created a new file, try again');
        return;
    }
    if (!msg.reference) {
        msg.reply('Write this command while replying to the list!');
        return;
    }
    let nList = await msg.channel.messages.fetch(msg.reference.messageId)
    if (!nList.embeds[0]) {
        msg.reply('Write this command while replying to the list!');
        return;
    }
    let [_, start, end] = msg.content.split('-');
    start = parseInt(start);
    end = parseInt(end);

    if (nList.embeds[0].footer.text.includes('\'s ninjas') && !nList.embeds[0].footer.text.includes('Team power')) {

        let min = parseInt(nList.embeds[0].footer.text.split('-- ')[1].split('/')[0]);
        const max = parseInt(nList.embeds[0].footer.text.split('-- ')[1].split('/')[1].split(' ')[0]);
        if (end > max || end - start > 20 || end <= start) {
            msg.reply({
                content: '**Invalid Command:** `!csv-{start}-{end}` *max cards at once: 20*',
                allowedMentions: {
                    repliedUser: false
                }
            });
            return;
        }

        let num = [];
        let ids = [];
        let names = [];
        let level = [];
        let basePower = [];
        let totalPower = [];
        let weaponMulti = [];
        let chakraLevel = [];
        let netPower = [];
        let i = start;

        const loading = client.emojis.cache.toJSON().find(emoji => emoji.id == '1010597944040362114')
        const waiting = await msg.reply(loading.toString());

        await jdb.editR('user', userEntry, {
            csv: `${msg.createdTimestamp}`
        });
        await jdb.assignI('info', 'csv_on', { "current": `${currentActive + 1}` });

        try {
            while (i <= end) {
                const result = await parseNinja(nList);

                let has = false;
                if (min > 0 && min % 2 === 0 && nList.reactions.cache.toJSON().length === 0) has = true;
                for (let reaction of nList.reactions.cache.toJSON()) {
                    if (reaction.emoji.name != '⏩') continue;
                    for (let user of reaction.users.cache.toJSON()) {
                        if (user.username == client.user.username) {
                            has = true;
                            break;
                        }
                    }
                    if (has) break;
                }
                if (!ids.includes(result.id)) {
                    num.push(result.sNo);
                    ids.push(result.id)
                    names.push(result.name);
                    level.push(result.level);
                    basePower.push(result.basePower);
                    totalPower.push(result.totalPower);
                    weaponMulti.push(result.weaponMulti);
                    chakraLevel.push(result.chakraLevel);
                    netPower.push(result.netPower);

                    if (!has) await nList.react('⏩');
                    else await nList.reactions.resolve('⏩').users.remove(client.user.id);
                    i += 1;
                }
                await sleep(1);
            }
        } catch (e) {
            await jdb.editR('user', userEntry, { csv: 'n/a' });
            await jdb.assignI('info', 'csv_on', { "current": currentActive - 1 });
            await waiting.edit('**Expired**');
            return;
        }


        const head = "num,id,name,level,base power,power with level,weapon multiplier,chakra level,total power,\n"
        await fs.appendFile(`./sheets/${msg.author.id}.csv`, head)
        for (let i = 0; i < num.length; i++) {
            const row = `${num[i]},${ids[i]},${names[i]},${level[i]},${basePower[i]},${totalPower[i]},${weaponMulti[i]},${chakraLevel[i]},${netPower[i]},\n`;
            await fs.appendFile(`./sheets/${msg.author.id}.csv`, row);
        }
        waiting.edit({ files: [`./sheets/${msg.author.id}.csv`] }).then(async _ => {
            await waiting.edit('**Done** ✅')
            await fs.writeFile(`./sheets/${msg.author.id}.csv`, '');
            let currentActive = parseInt(jdb.getEl('info', 'csv_on').current);
            await jdb.assignI('info', 'csv_on', { current: `${currentActive - 1}` });
        })
    }
}


async function parseNinja(nList) {
    let embed = nList.embeds[0];
    const sNo = embed.footer.text.split('-- ')[1].split('/')[0];
    const id = embed.footer.text.split('-- ')[1].split('/')[1].split(' (')[1].split('id:')[1].split(')')[0];
    const name = embed.title.split(' (L')[0];
    let level = 'n/a';
    if (embed.title.includes('Lv.')) level = embed.title.split('Lv.')[1].replace(')', '');
    let basePower = '0';
    if (embed.description.includes('**Base +')) basePower = embed.description.split('Base + lvl power: **')[1].split('+')[0];
    let totalPower = '0';
    if (embed.description.includes('Total power:')) totalPower = `${parseInt(embed.description.split('Base + lvl power: **')[1].split('+')[0]) + parseInt(embed.description.split('Base + lvl power: **')[1].split('+')[1].split('\n')[0])}`
    let weaponMulti = '1';
    if (embed.description.includes('Equipped:')) weaponMulti = embed.description.split('Equipped:')[1].split('(x')[1].replace(')', '').split('\n')[0];
    let chakraLevel = '0';
    if (embed.description.includes('Chakra lvl:')) chakraLevel = embed.description.split('Chakra lvl:')[1].split(' (+')[0].replace(/\*/g, '').trim();
    let netPower = `${Math.floor(parseFloat(totalPower) * parseFloat(weaponMulti) + parseFloat(chakraLevel) * 3000)}`;
    return { sNo, id, name, level, basePower, totalPower, weaponMulti, chakraLevel, netPower };
}

function sleep(time = 0) {
    return new Promise((resolve) => setTimeout(resolve, time));
}