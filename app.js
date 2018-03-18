const fetch = require('node-fetch')
const fs = require('fs')
const cheerio = require('cheerio')
const FormData = require('form-data')
const http = require('http')
const conf = require('./config')

let allClass = []
let sites
let imgnum = 0

let start = conf.start
let end = conf.end
let conpage = conf.conpage

// const form = new FormData() fs.readFileSync('webRequest', {   encoding:
// 'utf8' }).split('\n').forEach(item => {   const [a, b] = item.split(':')   if
// (!b)     form.append(a, b)   })  console.log(form)

async function sendRequest() {
  console.log("Start getting pics pages")
  let Promises = []
  for (let page = start; page <= (start + conpage); page++) {
    site = `http://xxxxx.net/post?page=${page}`
    Promises.push(fetch(site, {method: "POST"}).then(res => res.text()).then(body => {
      let $ = cheerio.load(body)
      $("li > div > a").each((index, ele) => {
        allClass.push($(ele).text())
      })
    }).then(res => {}).catch(err => {
      console.log(err)
    }))

    if (page % conf.c === 0) {
      await Promise.all(Promises)
      Promises = []
    }

    console.log(`Successfully load page ${page}`)
  }
}

async function getUrl() {
  await sendRequest()
  console.log("Get urls complete")
}

async function getOrigin() {
  console.log("Start parsing origin img urls")
  let result = []
  let promises = []
  for (let i = 0; i < allClass.length; i++) {
    try {
      promises.push((async item => {
        let y
        let z = item.slice(4)
        // const z = item
        console.log(`Parse Img ` + i + ` Complete`)
        let res = await fetch(z, {method: "POST"})
        let body = await res.text()
        let $ = cheerio.load(body)
        y = $("#image").attr("src")
        return y
      })(allClass[i]))

      if (i % conf.c === 0) {
        result = result.concat(await Promise.all(promises))
        promises = []
      }
      
    } catch (err) {
      console.log(err)
    }
  }
  console.log("Parsing urls complete")
  return result
}

async function getImg(){
  console.log("Start downloading imgs")
  allClass = await getOrigin()
  allClass = allClass.map(item => "http:".concat(item))
  let promises = []
  for ( i = 0; i < allClass.length; i++) {
    let p = new Promise((resolve, reject) => {
      const item = allClass[i]
      const stream = fs.createWriteStream(`img/${imgnum}.jpg`)
      try {
        http.get(item, res => {
          res.pipe(stream)
        })
        stream.on('finish', () => {
          console.log(`Write ${imgnum}.jpg OK`)
          imgnum++
          resolve()
        })
      } catch (err) {
        console.log(err)
      }
    })
    promises.push(p)

    if (i % conf.c === 0) {
      await Promise.all(promises)
      promises = []
    }
  }
  console.log(" Happy Reptile &&  Happy TTfish")
}

async function fish() {
  await getUrl()
  await getImg()
}

fish()
