const english_inline_keyboard = JSON.stringify({
    inline_keyboard: [
        [
            {text: "5", callback_data: "5"},
            {text: "10", callback_data: "10"},
            {text: "15", callback_data: "15"},
            {text: "20", callback_data: "20"},
            {text: "30", callback_data: "30"},
            {text: "all", callback_data: "all"}
        ],
        [
            {text: "Prev. page", callback_data: "previous"},
            {text: "Next page", callback_data: "next"},
            {text: "en Esperanto", callback_data: "esperanto"}
        ],
    ]
})

const esperanto_inline_keyboard = JSON.stringify({
    inline_keyboard: [
        [
            {text: "5", callback_data: "5"},
            {text: "10", callback_data: "10"},
            {text: "15", callback_data: "15"},
            {text: "20", callback_data: "20"},
            {text: "30", callback_data: "30"},
            {text: "ĉiuj", callback_data: "ĉiuj"}
        ],
        [
            {text: "Antaŭa paĝo", callback_data: "antaŭa"},
            {text: "Sekva paĝo", callback_data: "sekva"},
            {text: "in English", callback_data: "english"}
        ],
    ]
})


/*

const data = {
    from: match[0],
    to: match[1],
    lang: match[2],
    word: match[3],
    langs: match[5],
    command: match[4],
    amount: match[1] - match[0]
}

*/
// searchEspDic("tomato", "eneo").then(res=>searchToText2(res, "en", 7)).then(object=>{  <<<----- here, searchToText should even calculate which keyboard to use
// bot.sendMessage()
// })

function searchToText(query, langs, limit = 7, lang) {
    return searchEspDic(query, langs).then(res=>{
        let longText, shortText;
        if (lang === "en") {
            longText = `🔽 Here are <strong>${limit}<\/strong> results for your search <strong>${query}<\/strong> 🔽\n`;
            shortText = `🔽 Here are all the results for your search <strong>${query}<\/strong> 🔽\n`;
        } else if (lang === "eo") {
            longText = `🔽 Jen <strong>${limit}<\/strong> rezultoj por via serĉo pri <strong>${query}<\/strong> 🔽\n`;
            shortText = `🔽 Jen ĉiuj la rezultoj por via serĉo pri <strong>${query}<\/strong> 🔽\n`;
        }
        let text = '';
        if (res.length > limit) {
            text += longText;
            for (let i = 0; i < limit; i++) {
                text += `\n<strong>${res[i].eo}:<\/strong> ${res[i].en}`
            }
        } else if (res.length <= limit) {
            text += shortText;
            res.forEach(x=>{
                text += `\n<strong>${x.eo}:<\/strong> ${x.en}`
            })
        }
        console.log("text is " + text)
        return {
            text: text,
            lang: lang
        };
    })
}
