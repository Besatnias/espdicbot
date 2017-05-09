'use strict';
const fs = require('fs'),
    secrets = fs.readFileSync("secrets"),
    vars = JSON.parse(secrets),
    token = vars.telegram.bot.espdic,
    Tgfancy = require('tgfancy'),
    bot = new Tgfancy(token, { polling: true }),
    _ = require('lodash'),
    Promise = require('bluebird'),
    me = "EspDicBot",
    url = require('url');

function sendResult(msg, opts) {
    bot.sendMessage(msg.chat.id, opts.text, {
        parse_mode: "HTML",
        reply_markup: opts.keyboard
    })
}
function editResult(msg, opts) {
    bot.editMessageText( opts.text, {
        chat_id: msg.message.chat.id,
        message_id: msg.message.message_id,
        parse_mode: "HTML",
        reply_markup: opts.keyboard
    })
}

bot.onText(/^\/(?:helpo|helpu|helpi)(?:@EspDicBot|@ElMejorRobot)?$/, (msg, match)=>{
    sendHelp (msg, "eo")
})

bot.onText(/^\/(?:help|start)(?:@EspDicBot|@ElMejorRobot)?$/, (msg, match)=>{
    sendHelp (msg, "en")
})

function sendHelp(msg, lang) {
    let text, opts, keyboard;
    if (lang === "eo") {
        text = `Saluton! Mi estas *EspDicBot*. Vi povas serĉi tra mi en la *EspDic*.

Por serĉi de la angla al Esperanto, uzu la komandon \`\/eneo\` + \`vorto\`. Ekzemple:
\/eneo hatchet

Por serĉi de Esperanto al la angla, uzu la komandon \`\/eoen\` + \`vorto\`. Ekzemple:
\/eoen hundaĉo

Se vi trovas eraron (bug ktp) aŭ plibonigeblaĵon, bonvolu kontakti @Bestulo.`
        keyboard = {inline_keyboard: [[{text: "Read in English", callback_data: "help to english"}]]}

    } else if (lang === "en") {
        text = `Hello! I am *EspDicBot*. With me, you can search the Esperanto-English dictionary *EspDic*.

To search from English to Esperanto, use the command \`\/eneo\` + \`word\`. For example:
\/eneo juggle

To search from Esperanto to English, use the command \`\/eoen\` + \`word\`. For example:
\/eoen pioĉo

If you find any bug, error or have any feedback or suggestion, please contact @Bestulo.`
        keyboard = {inline_keyboard: [[{text: "Legi en Esperanto", callback_data: "help to esperanto"}]]}
    }
    if (msg.message) {
        return bot.editMessageText( text, {
            chat_id: msg.message.chat.id,
            message_id: msg.message.message_id,
            parse_mode: 'markdown',
            reply_markup: keyboard
        })
    } else if (msg.text) {
        return bot.sendMessage(msg.chat.id, text, {
            parse_mode: 'markdown',
            reply_markup: keyboard
        })
    }
}

bot.onText(/^\/(?:eoen|epoeng|eo)(?:@EspDicBot|@ElMejorRobot)? (.+)/, (msg, match)=>{
    if (match[1].length < 40) {
        const data = {
            from: "0",
            to: "5",
            lang: "eo",
            word: match[1],
            langs: "eoen",
            amount: "5",
            type: "message"
        }
        processCbData(data, msg)
    } else {
        if (data.lang === "en") {
            text = "I can only process words of up to 39 characters in order to function properly."
        } else if (data.lang === "eo") {
            text = "Pro funkciaj limigoj, mi nur povas serĉi vortoj malpli longaj ol 40 literoj."
        }
        bot.sendMessage(msg.chat.id, text)
    }
})

bot.onText(/^\/(?:engepo|eneo|en)(?:@EspDicBot|@ElMejorRobot)? (.+)/, (msg, match)=>{
    if (match[1].length < 40) {
        const data = {
            from: "0",
            to: "5",
            lang: "en",
            word: match[1],
            langs: "eneo",
            amount: "5",
            type: "message"
        }
        processCbData(data, msg)
    } else {
        if (data.lang === "en") {
            text = "I can only process words of up to 39 characters in order to function properly."
        } else if (data.lang === "eo") {
            text = "Pro funkciaj limigoj, mi nur povas serĉi vortoj malpli longaj ol 40 literoj."
        }
        bot.sendMessage(msg.chat.id, text)
    }
})

bot.on('callback_query', msg=>{
    if (msg.data === "help to english") {
        sendHelp(msg, "en")
    } else if (msg.data === "help to esperanto") {
        sendHelp(msg, "eo")
    } else {
        const match = msg.data.split(" ")
        const data = {
            from: match[0],
            to: match[1],
            lang: match[2],
            word: match[3],
            langs: match[4],
            command: match[5],
            amount: String(match[1] - match[0]),
            type: "callback_query"
        }
        processCbData(data, msg)
    }
})

function genKeyboard (data) {
    let key = ([data.from, data.to, data.lang, data.word, data.langs]).join(" ");
    let numberButtons = ["5", "10", "15", "20", "30"]
    let inline_keyboard = [[],[]]
    for (let i = 0; i < 5; i++) {
        if (!(data.amount === numberButtons[i])) {
            inline_keyboard[0].push({text: numberButtons[i], callback_data: `${key} ${numberButtons[i]}`})
        }
    }
    if (data.amount <= 30) {
        inline_keyboard[0].push({
            text: data.lang === "eo" ? "Ĉiuj" : "All",
            callback_data: `${key} ĉiuj`}
        )
    }
    if (Number(data.from) > 0) {
        inline_keyboard[1].push(data.lang === "en" ?
            {text: "Prev. page", callback_data: `${key} prev`} :
            {text: "Antaŭa paĝo", callback_data: `${key} prev`}
        )
    }
    if (Number(data.to) < Number(data.length)) {
        inline_keyboard[1].push(data.lang === "en" ?
            {text: "Next page", callback_data: `${key} next`} :
            {text: "Sekva paĝo", callback_data: `${key} next`}
        )
    }
    inline_keyboard[1].push(data.lang === "en" ?
        {text: "en Esperanto", callback_data: `${key} epo`} :
        {text: "in English", callback_data: `${key} eng`}
    )
    let keyboard = {
        inline_keyboard: inline_keyboard
    }
    return JSON.stringify(keyboard)
}

function processCbData(data, msg) {
    let newCb = '';
    if (data.type === "callback_query") {
        switch(data.command) {
            case 'epo':
            case 'eng':
                data.lang = data.command === "epo" ? "eo" : "en";
                if (data.amount > 15) {
                    moreThan15(data, msg)
                } else {
                    searchAndFormat(data).then(opts=>{
                        editResult(msg, opts)
                    })
                }
                break;
            case '5':
            case '10':
            case '15':
            case '20':
            case '30':
                searchAndFormat(data).then(opts=>{
                    if (opts.length < String(Number(data.from) + Number(data.command))) {
                        data.amount = String(opts.length - Number(data.from))
                        data.to = String(opts.length)
                    } else {
                        data.amount = data.command;
                        data.to = String(Number(data.from) + Number(data.command));
                    }
                    if (Number(data.command) > 15) {
                        moreThan15(data, msg)
                    } else {
                        searchAndFormat(data).then(opts=>{
                            editResult(msg, opts)
                        })
                    }
                })
                break;
            case 'ĉiuj':
                data.amount = '300'
                data.to = '300'
                data.from = '0'
                moreThan15(data, msg)
                break;
            case 'next':
            case 'prev':
                if (data.command === "prev") {
                    if (Number(data.from) - Number(data.amount) < 0) {
                        data.from = "0"
                        data.to = data.amount
                    } else {
                        data.from = String(Number(data.from) - Number(data.amount))
                        data.to = String(Number(data.from) + Number(data.amount))
                    }
                    if (data.amount > 15) {
                        moreThan15(data, msg)
                    } else {
                        searchAndFormat(data).then(opts=>{
                            editResult(msg, opts)
                        })
                    }
                }
                if (data.command === "next") {
                    searchAndFormat(data).then(opts=>{
                        if (Number(data.to) + Number(data.amount) > opts.length) {
                            data.to = String(opts.length)
                        } else {
                            data.to = String(Number(data.to) + Number(data.amount))
                        }
                        data.from = String(Number(data.to) - Number(data.amount))
                        if (data.amount > 15) {
                            moreThan15(data, msg)
                        } else {
                            searchAndFormat(data).then(opts=>{
                                editResult(msg, opts)
                            })
                        }
                    })
                }
                break;
            default:
                bot.sendMessage(237799109, "Hubo un error cuando alguien presionó una tecla en el inline_keyboard. A continuación toda la información relacionada:")
                bot.sendMessage(237799109, "cb msg:\n<pre>" + JSON.stringify(msg, null, 4) + "<\/pre>", {parse_mode: "HTML"})
                bot.sendMessage(237799109, "data:\n<pre>" + JSON.stringify(data, null, 4) + "<\/pre>", {parse_mode: "HTML"})
                // Troviĝis eraro; sendi informon al mi por ripari
                break;
        }
    } else if (data.type === "message") {
        searchAndFormat(data).then(opts=>{
            return sendResult(msg, opts)
        })
    }
}

function moreThan15(data, msg) {
    searchAndFormat(data).then(res=>{
        if ((msg.message && msg.message.chat.type === "private" && data.amount > 100) || (msg.message && msg.message.chat.type !== "private" && data.amount > 15) ) {
            let text;
            let key = ([data.from, data.to, data.lang, data.word, data.langs]).join("_");
            let link = url.format(`http://t.me/${me}?start=cb${key}`)
            let num;
            if (msg.message && msg.message.chat.type === "private" && res.length > 100) {
                num = 100
            } else {
                num = 15
            }
            if (data.lang === "en") {
                text = `To view more than ${num} results, please [click here](${link}) and then press _start_`
            } else if (data.lang === "eo") {
                text = `Por vidi pli ol ${num} rezultoj, bonvolu [klaki ĉi tie](${link}) kaj poste klaku _komenci_ (start)`
            }
            bot.editMessageText( text, {
                chat_id: msg.message.chat.id,
                message_id: msg.message.message_id,
                reply_markup: res.keyboard,
                parse_mode: 'markdown',
                disable_web_page_preview: true
            })
        } else {
            searchAndFormat(data).then(opts=>{
                editResult(msg, opts)
            })
        }
    })
}


bot.onText(/^\/start cb(.+)/, (msg, matcho)=>{
    let match = matcho[1].split("_")
    if (msg.chat.type === "private") {
        const data = {
            from: match[0],
            to: match[1],
            lang: match[2],
            word: match[3],
            langs: match[4],
            amount: String(match[1] - match[0]),
            type: "message"
        }
        searchAndFormat(data).then(opts=>{
            if (opts.length > 300){
                if (data.lang === "en") {
                    text = "The amount of results has been limited to 300. Original total: " + opts.length
                } else if (data.lang === "eo") {
                    text = "Montriĝos nur 300 rezultoj pro limigo. Kvanto originala: " + opts.length
                }
                bot.sendMessage(msg.chat.id, text)
            }
            sendResult(msg, opts)
        })
    }
})

function searchAndFormat(data) {
    return searchEspDic(data).then(res=>{
        const [lang, limit] = [data.lang, data.amount];
        let longText, shortText;
        if (lang === "en") {
            longText = `🔽 Here are <strong>${limit}<\/strong> results for your search <strong>${data.word}<\/strong> 🔽\n`;
            shortText = `🔽 Here are all (${res.length}) the results for your search <strong>${data.word}<\/strong> 🔽\n`;
        } else if (lang === "eo") {
            longText = `🔽 Jen <strong>${limit}<\/strong> rezultoj por via serĉo pri <strong>${data.word}<\/strong> 🔽\n`;
            shortText = `🔽 Jen ĉiuj la rezultoj por via serĉo pri <strong>${data.word}<\/strong> 🔽\n`;
        }
        let text = '';
        if (res.length > limit) {
            text += longText;
            for (let i = Number(data.from); i < Number(data.to); i++) {
                text += `\n<strong>${res[i].eo}:<\/strong> ${res[i].en}`
            }
        } else if (res.length <= limit) {
            text += shortText;
            res.forEach(x=>{
                text += `\n<strong>${x.eo}:<\/strong> ${x.en}`
            })
        }
        data.length = res.length
        let opts = {
            keyboard: genKeyboard(data),
            text: text,
            length: res.length
        }
        return opts
    })
}

function searchEspDic (data) {
    const [query, langs] = [data.word, data.langs]
    return new Promise(function(resolve, reject) {
        let word = new RegExp(query, "i")
        let text = ''
        fs.readFile('espdic.json', (err, data)=>{
            if (err) {
                console.log(err)
                reject (err)
            } else {
                let result = [];
                const dic = JSON.parse(data).vortaro;
                if (langs === "eoen") {
                    word = new RegExp(query, "i")
                    result = dic.filter(x=>{
                        return word.test(x.eo)
                    })
                    dic.filter(x=>{
                        let reg;
                        if (x.eo.startsWith("-") && x.eo.endsWith("-")) {
                            reg = new RegExp(x.eo.substring(1, x.eo.length - 1), "i")
                        } else if (!x.eo.startsWith("-") && x.eo.endsWith("-")) {
                            reg = new RegExp(x.eo.substring(0, x.eo.length - 1), "i")
                        } else if (x.eo.startsWith("-") && !x.eo.endsWith("-")) {
                            reg = new RegExp(x.eo.substring(1, x.eo.length), "i")
                        } else if (/o$/.test(x.eo)) {
                            reg = new RegExp(x.eo.substring(0, x.eo.length - 1), "i")
                        } else {
                            reg = new RegExp(x.eo, "i")
                        }
                        return reg.test(query)
                    }).forEach(x=>{
                        result.push(x)
                    })
                } else if (langs === "eneo") {
                    result = dic.filter(x=>{
                        return word.test(x.en)
                    })
                }
                resolve ( sortResult(result, query, langs) )
            }
        })
    })
}

function sortResult (result, query, langs) {
    const starting = new RegExp("^" + query, "i")
    const ending = new RegExp(query + "$", "i")
    const exact = new RegExp("^" + query + "$", "i")
    let finalResult = [],
        exactArr = [],
        startingArr = [],
        endingArr = [];
    if (langs === "eoen") {
        if (result.length > 0) {
            exactArr = result.filter(x=>{
                return exact.test(x.eo)
            })
            startingArr = result.filter(x=>{
                return starting.test(x.eo)
            })
            endingArr = result.filter(x=>{
                return ending.test(x.eo)
            })
        }
    } else if (langs === "eneo") {
        if (result.length > 0) {
            exactArr = result.filter(x=>{
                return exact.test(x.en)
            })
            startingArr = result.filter(x=>{
                return starting.test(x.en)
            })
            endingArr = result.filter(x=>{
                return ending.test(x.en)
            })
        }
    }
    if (exactArr.length > 0) {
        exactArr.forEach(x=>{
            finalResult.push(x)
        })
    }
    if (startingArr.length > 0) {
        startingArr.forEach(x=>{
            finalResult.push(x)
        })
    }
    if (endingArr.length > 0) {
        endingArr.forEach(x=>{
            finalResult.push(x)
        })
    }
    result.forEach(x=>{
        finalResult.push(x)
    });
    finalResult = _.uniq(finalResult)
    return finalResult
}
