// Modules
const fs = require('fs'),
    Tgfancy = require('tgfancy'),
    _ = require('lodash'),
    Promise = require('bluebird'),
    url = require('url'),
// Variables
    secrets = fs.readFileSync("secrets.json"),
    vars = JSON.parse(secrets),
    token = vars.test_token,
    bot = new Tgfancy(token, { polling: true }),
    me = "ElMejorRobot";


bot.onText(/^\/eoen (.+)/, (msg, match)=>{
    if (match[1].length < 40) {
        msg.data = {
            from: "0",
            to: "5",
            lang: "eo",
            word: match[1],
            langs: "eoen",
            amount: "5",
            type: "message"
        }
        bot.emit('eoen', msg)
    } else {
        if (data.lang === "en") {
            text = "I can only process words of up to 39 characters in order to function properly."
        } else if (data.lang === "eo") {
            text = "Pro funkciaj limigoj, mi nur povas serĉi vortoj malpli longaj ol 40 literoj."
        }
        bot.sendMessage(msg.chat.id, text)
    }
})

bot.onText(/^\/eneo (.+)/, (msg, match)=>{
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
})
