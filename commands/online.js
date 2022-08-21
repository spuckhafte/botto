const _ = require("./_");

async function manageOnline(msg, jdb) {
    const checkOnlineTimeoutStack = {};
    const ids = jdb.getEl('user', 'userid');
    if (Object.values(ids).includes(msg.author.id)) {
        if (checkOnlineTimeoutStack[msg.author.id]) {
            clearTimeout(checkOnlineTimeoutStack[msg.author.id][0]);
            let entry = checkOnlineTimeoutStack[msg.author.id][1]
            await jdb.editR('user', entry, {
                "online": "1"
            });
            const userOfflineTimeout = setTimeout(async () => {
                await jdb.editR('user', entry.toString(), {
                    "online": '0'
                })
                delete checkOnlineTimeoutStack[msg.author.id];
            }, 60000);
            checkOnlineTimeoutStack[msg.author.id] = [userOfflineTimeout, entry];
        } else {
            let entry = await jdb.getR('user', 'moral', ['userid', msg.author.id])
            entry = entry['entry'];
            await jdb.editR('user', entry, {
                "online": "1"
            });
            const userOfflineTimeout = setTimeout(async () => {
                await jdb.editR('user', entry, {
                    "online": '0'
                })
                delete checkOnlineTimeoutStack[msg.author.id];
            }, 60000)
            checkOnlineTimeoutStack[msg.author.id] = [userOfflineTimeout, entry];
        };

    } else {
        const entry = await jdb.assignR('user', {
            "username": msg.author.username,
            "userid": msg.author.id,
            "online": '1', // 1 -> true, 0 -> false
            "hide": '0',
            "csv": 'n/a'
        });
        const userOfflineTimeout = setTimeout(async () => {
            await jdb.editR('user', entry.toString(), {
                "online": '0'
            })
            delete checkOnlineTimeoutStack[msg.author.id];
        }, 60000)
        checkOnlineTimeoutStack[msg.author.id] = [userOfflineTimeout, entry.toString()];
    }
}


async function showOnline(msg, MessageEmbed, jdb) {
    let [onlineUsers, total] = await _(msg, jdb)
    const embed = new MessageEmbed()
        .setTitle('Active Users')
        .setDescription(onlineUsers)
        .setColor('GREEN')
        .setFooter(`Active: ${total}`);
    if (msg.guild.me.permissions.has('EMBED_LINKS')) msg.channel.send({ embeds: [embed] });
    else msg.reply('**embed perm missing**');
};

async function hideOnline(msg, jdb) {
    const userData = await jdb.getR('user', 'moral', ['userid', msg.author.id]);
    if (!userData) return;
    const entry = userData.entry;
    const prevHiddenStatus = userData.hide;
    if (prevHiddenStatus == '1') {
        await jdb.editR('user', entry, {
            "hide": "0"
        });
        await msg.reply({
            content: '*You are visible*',
            allowedMentions: {
                repliedUser: false
            }
        });
    } else {
        await jdb.editR('user', entry, {
            "hide": "1"
        });
        await msg.reply({
            content: '*You are hidden*',
            allowedMentions: {
                repliedUser: false
            }
        });
    }
}

module.exports = { manageOnline, showOnline, hideOnline };