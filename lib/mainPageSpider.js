const puppeteer = require('puppeteer');
const fs = require('fs');
const {subPageSpider} = require('./subPageSpider');
const asyncModule = require('async');
const log = console.log;
const projectPath = process.cwd();

async function mainPageSpider(url,comicName) {
    let pageInfoArray = [];
    const browser = await puppeteer.launch({
        ignoreHTTPSErrors: true,
    });
    const page = await browser.newPage();
    await page.goto(url);
    pageInfoArray = await page.evaluate(function(){
        //获取baseUrl
        let list = document.getElementsByClassName('list_con_li')[0];
        let listItem = list.getElementsByTagName('li');
        let tempArray = [];
        for(let i=0;i<listItem.length;i++){
            let current = listItem[i];
            let address = current.getElementsByTagName('a')[0].href;
            let title = current.getElementsByClassName('list_con_zj')[0].innerText;
            let tempObject = {};
            tempObject['title'] = title;
            tempObject['address'] = address;
            tempArray.push(tempObject);
        }
        return tempArray;
    });
    await browser.close();
    log('分页面数量：',pageInfoArray.length);
    log('****************************');
    
    //建立图片文件夹
    function bulidFolder(path){
        if(!fs.existsSync(path)){
            fs.mkdirSync(path)
        }
    }
    let rootPath = `${projectPath}/imgs/${comicName}`;
    bulidFolder(rootPath);

    pageInfoArray.forEach((element)=>{
        let path = `${projectPath}/imgs/${comicName}/${element.title}`;
        bulidFolder(path);
    })

    //分页面任务数组
    let tasks = [];

    //分页面爬取图片
    function runSubPageSpider(element){
        let url = element.address;
        let title = element.title;
        return function(callback){
            subPageSpider(url,title,comicName,callback);
        }
    }
    
    pageInfoArray.forEach((element)=>{
        let fn = runSubPageSpider(element);
        tasks.push(fn);
    })

    //串行控制
    asyncModule.series(tasks, function(err, values) {
        log('分页面任务状态：')
        log(values);
     });
    
  }
  exports.mainPageSpider = mainPageSpider;
//   mainPageSpider('https://www.dmzj.com/info/blame.html','blame')

