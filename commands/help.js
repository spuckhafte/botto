module.exports = async (msg, MessageEmbed, MessageActionRow, MessageButton) => {
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
            { name: '`!csv-1-7` **- sends you a csv file of *n list***', value: 'Alternatives: *none*' },
            { name: '`!cact` **- shows no. of active csv conversions *(max: 5)***', value: 'Alternatives: *cactive*' },
            { name: '`!csvcd` **- shows cooldown for the csv conversion command**', value: 'Alternatives: *none*' },
        );

    const inviteAndUpvote = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setURL('https://top.gg/bot/964474872912822323/vote')
                .setLabel('Vote - Top.gg')
                .setStyle('LINK'),
            new MessageButton()
                .setURL('https://discordbotlist.com/bots/botto-7972/upvote')
                .setLabel('Vote - DBL')
                .setStyle('LINK'),
            new MessageButton()
                .setURL('https://discord.gg/RPz3zbH5vw')
                .setLabel('Official Server')
                .setStyle('LINK')
        );

    msg.reply({
        embeds: [embed],
        components: [inviteAndUpvote],
        allowedMentions: {
            repliedUser: false
        }
    });
}