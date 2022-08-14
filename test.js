function report() {
    const parsedReport = '2 suspicious individuals in white clothes in the forest'
    const options = ['reporting 2 suspicious individuals in black in the forest', 'reporting 3 suspicious individuals in white in the dango shop', 'reporting 2 suspicious individuals in white in the forest']
    const found = false;
    let similar = 0;
    for (let opt in options) {
        const option = options[opt];
        for (let word of option.split(' ')) {
            if (parsedReport.includes(word)) {
                if (options[0].includes(word) && options[1].includes(word) && options[2].includes(word)) continue;
                console.log(word)
                if (similar === 1 || similar === 0 || similar === 2) similar = similar + 1;
                if (similar === 3) {
                    return parseInt(opt) + 1;
                }
            }
        }
        similar = 0;
    }
}

console.log(report())

// for (let word of parsedReport.split(' ')) {
    //     for (let opt in options) {
    //         let option = options[opt]
    //         if (option.includes(word)) {
    //             console.log(options[0].includes(word) && options[1].includes(word) && options[2].includes(word), word)
    //             console.log((options[0].includes(word) && options[1].includes(word)) || (options[0].includes(word) && options[2].includes(word)) || (options[1].includes(word) && options[2].includes(word)), '---', word)
    //             console.log()
    //             if (options[0].includes(word) && options[1].includes(word) && options[2].includes(word)) break;
    //             if ((options[0].includes(word) && options[1].includes(word)) || (options[0].includes(word) && options[2].includes(word)) || (options[1].includes(word) && options[2].includes(word))) break;
    //             let nums = { 1: '1️⃣', 2: '2️⃣', 3: '3️⃣' }
    //             return `**Report: **${nums[parseInt(opt) + 1]}`
    //         }
    //     }
    // }