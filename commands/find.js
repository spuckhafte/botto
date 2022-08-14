module.exports = async (msg, jdb) => {
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