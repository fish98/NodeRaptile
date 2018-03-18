const fetch = require('node-fetch')
const fs = require('fs')
const cheerio = require('cheerio')
const FormData = require('form-data')

let site =  `http://xxxx.net`


async function DownImg() {
    fetch(site,{
      method: "POST", 
    }).then(
        res => res.text()
    ).then(
        body => {
            let $ = cheerio.load(body)
            let fish = $("#image").attr("src").toString()
            console.log(fish.slice(2))
        }
    )
}

DownImg()