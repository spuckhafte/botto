const details = require('../prvt');

module.exports = async (msg, user, jdb) => {
    if (user.bot) return;
    if (!msg.message || !msg.message.content || !msg.message.content.startsWith('**Page ') || !msg.message.author.bot || !msg.message.author.id == details.BOT_ID) return;
    let pageNo = parseInt(msg.message.content.split('**Page ')[1].split(':')[0]);
    if (msg.emoji.name == '⏩') pageNo = pageNo + 1;
    if (msg.emoji.name == '⏪') pageNo = pageNo - 1;
    if (pageNo <= 0) return

    // 1: (0)*10+1 -> 2: (1)*10+1 -> 3: (2)*10+1
    const start = (pageNo - 1) * 10 + 1;
    let end = start + 9;

    const qNa = jdb.getEl('qna', 'ans')
    const totalPages = Math.ceil(Object.keys(qNa).length / 10);

    if (start <= Object.keys(qNa).length && end > Object.keys(qNa).length) end = Object.keys(qNa).length;
    if (start > Object.keys(qNa).length || start <= 0 || end > Object.keys(qNa).length) return;

    const parsedQnA = {}
    Object.keys(qNa).forEach((q, i) => {
        if (i >= start && i <= end) parsedQnA[`${i}. ${q}`] = qNa[q].trim();
    });

    msg.message.edit(`**Page ${pageNo}/${totalPages}:**\`\`\`json
${JSON.stringify(parsedQnA, true, 2)}\`\`\`
    `)
}