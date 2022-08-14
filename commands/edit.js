const details = require('../prvt');

module.exports = async (msg, jdb) => {
    if (!details.officials.includes(msg.author.id)) return;
    const qNa = jdb.getEl('qna', 'ans')
    const parsedQnA = {}
    Object.keys(qNa).forEach((q, i) => {
        if (i) parsedQnA[`${i}. ${q}`] = qNa[q].trim();
    });

    msg.content = msg.content.toLowerCase();
    if (msg.content.split('-').length !== 3) return;

    let [_, questionNo, answer] = msg.content.split('-');
    if (isNaN(questionNo) || answer === '' || answer === ' ') return;
    answer = answer.trim().toLowerCase(); questionNo = parseInt(questionNo)
    if (parseInt(questionNo) <= 0 || parseInt(questionNo) > Object.keys(parsedQnA).length) return;

    let question = Object.keys(parsedQnA)[questionNo - 1].substr(3).trim();
    if (question.startsWith('. ')) question = question.substring(2);
    const exportEdit = {}
    exportEdit[question] = answer;
    await jdb.assignI('qna', 'ans', exportEdit);
    await msg.channel.send(`Edited!\n\`\`\`json
"${Object.keys(parsedQnA)[questionNo - 1]}": "${answer}"\`\`\`
        `);

}