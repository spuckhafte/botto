module.exports = async (msg, jdb) => {
    let onlineUsers = '';
    let total = 0;
    const bypassServers = ['875264404428574720', '1008657622691479633'];
    for (let entry = 1; entry < Object.keys(jdb.getEl('user', 'online')).length; entry++) {
        const userData = await jdb.getR('user', 'entry', entry);
        if (bypassServers.includes(msg.guild.id)) {
            if (parseInt(userData.online)) {
                onlineUsers += `**${userData.username}**${parseInt(userData.hide) ? ' *(hidden)*' : ''}\n`;
                total += 1;
            }
        } else {
            if (parseInt(userData.online) && !parseInt(userData.hide)) {
                onlineUsers += `**${userData.username}**\n`;
                total += 1;
            }
        }
    }
    return [onlineUsers, total]
};