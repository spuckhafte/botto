module.exports = async (msg, jdb) => {
    const qNa = jdb.getEl('qna', 'ans')
    const parsedQnA = {}
    Object.keys(qNa).forEach((q, i) => {
        if (i && i <= 10) parsedQnA[`${i}. ${q}`] = qNa[q].trim();
    });
    const totalPages = Math.ceil(Object.keys(qNa).length / 10);
    await msg.channel.send(`**Page 1/${totalPages}:**\`\`\`json
${JSON.stringify(parsedQnA, true, 2)}\`\`\`
            `).then(msg => {
        msg.react("⏪")
        msg.react("⏩")
    })
}