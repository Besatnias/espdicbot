'use strict';

const fs = require('fs'),
    _ = require('lodash'),
    Promise = require('bluebird');

searchEspDic("hand", "eneo").then(x=>
    console.log(x)
)

function searchEspDic (query, langs) {
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
                    result = dic.filter(x=>{
                        return word.test(x.eo)
                    })
                    if (result.length > 0) {
                        dic.filter(x=>{
                            let reg;
                            if (/o$/.test(x.eo)) {
                                reg = new RegExp(x.eo.substring(0, x.eo.length - 1), "i")
                            } else {
                                reg = new RegExp(x.eo, "i")
                            }
                            return reg.test(query)
                        }).forEach(x=>{
                            result.push(x)
                        })
                    }
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
