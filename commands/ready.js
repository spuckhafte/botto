module.exports = async (client, jdb) => {
    console.log('Ready');
    client.user.setActivity({ name: '!h || n m', type: 'LISTENING' })
    for (let i = 1; i < Object.keys(jdb.getEl('user', 'hide')).length; i++) {
        await jdb.editR('user', i, {
            "online": "0"
        })
    };
}