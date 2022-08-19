module.exports = async (jdb) => {
    console.log('Ready');
    for (let i = 1; i < Object.keys(jdb.getEl('user', 'online')); i++) {
        await jdb.editR('user', i.toString(), {
            "online": "0"
        });
    };
}