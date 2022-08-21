module.exports = async (msg, MessageEmbed) => {
    const embed = new MessageEmbed()
        .setTitle('Botto Guide📙')
        .setDescription('Bot will automatically help you with your **missions** and **reports**')
        .addFields(
            { name: '`!s` **- shows you all the questions stored**', value: 'Alternative: *show*' },
            { name: '`!f-t-Team 8` **- shows you all the questions containing "*Team 8"***', value: 'Alternative: *find-text-Team 8*' },
            { name: '`!r-1-5` **- shows you questions from index "1" to "5" (inclusive)**', value: 'Alternative: *range-1-5*' },
            { name: '`!on` **- lists all the active users**', value: 'Alternative: *online*' },
            { name: '`!hide` **- hides you from the list of active user, even if you are active**', value: 'Alternative: *none*' },
            { name: '`!h` **- shows you this guide**', value: 'Alternatives: *help*, *g*, *guide*' },
            { name: '`!csv-{start}-{end}` **- sends you a csv file of *n list***', value: 'Alternatives: *none*' },
            { name: '`!cact` **- shows no. of active csv conversions *(max: 5)***', value: 'Alternatives: *cactive*' },
            { name: '`!csvcd` **- shows cooldown for the csv conversion command**', value: 'Alternatives: *none*' },
        );
    msg.reply({
        embeds: [embed],
        allowedMentions: {
            repliedUser: false
        }
    });
}