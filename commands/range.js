module.exports = async (msg, jdb) => {
    let arr = msg.content.split('-');
    if (arr.length != 3) return;
    if (isNaN(arr[2]) || isNaN(arr[1])) return;
    let [from, to] = [parseInt(arr[1]), parseInt(arr[2])];

    const qNa = jdb.getEl('qna', 'ans')
    const parsedQnA = {}

    if (from > Object.keys(qNa).length || from <= 0 || to > Object.keys(qNa).length && to < from) return;
    Object.keys(qNa).forEach((q, i) => {
        if (i >= from && i <= to) parsedQnA[`${i}. ${q}`] = qNa[q].trim();
    });
    await msg.channel.send(`\`\`\`json
${JSON.stringify(parsedQnA, true, 2)}\`\`\`
            `)
}