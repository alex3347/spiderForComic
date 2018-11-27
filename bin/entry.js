#!/usr/bin/env node


const program = require('commander')
const {mainPageSpider} = require('../lib/mainPageSpider.js')

program
  .version('0.0.1')
  .command('mainPageSpider <comicName>')
  .alias('name')
  .action(function(comicName){
    let url = `https://www.dmzj.com/info/${comicName}.html`;
    mainPageSpider(url,comicName);
  })

program.parse(process.argv)
