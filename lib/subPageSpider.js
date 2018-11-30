const puppeteer = require('puppeteer');
const fs = require('fs');
const https = require('https');
const asyncModule = require('async');
const log = console.log;
const projectPath = process.cwd();

async function subPageSpider(url,title,comicName,seriesCallback) {
    log('开始解析：',title)
    let pageInfoObject = {};

    const browser = await puppeteer.launch({
        ignoreHTTPSErrors: true,
        // devtools: true
    });
    const page = await browser.newPage();
    //启用请求拦截器
    await page.setRequestInterception(true);
    page.on('request', interceptedRequest => {
        if (interceptedRequest.url().startsWith('https://afpeng')){
            interceptedRequest.abort();
        }else{
            interceptedRequest.continue();
        }
    });
    await page.goto(url);
    
    pageInfoObject = await page.evaluate(function(){
        let page_select = document.getElementById('page_select');
        if(page_select){
            let options = page_select.options;
            let reg = /(\w+):\/\/([^/:]+)(:\d*)?([^# ]*)/;
            let hostName = options[0].value.match(reg)[2];//images.dmzj.com
            let collection = [];
            for(let i=0;i<options.length;i++){
                let current = options[i].value;
                collection.push(current.match(reg)[4]);// /b/Blame!/Vol_01a/BLAME_第一卷_001.jpg
            }
            return {'hostName':hostName,'collection':collection};
        }else{
            return null;
        }
    })
    await browser.close();

    if(pageInfoObject){
        log('分页面图片数量：',pageInfoObject.collection.length);
    }else{
        log('-----------------------------');
        seriesCallback(null,`分页面【${title}】下载失败`);
        return;
    }
    
    
    //图片下载逻辑
    let hostName = pageInfoObject.hostName;
    let collection = pageInfoObject.collection;
    let test = ['/b/Blame!/第10卷/Blame10-001.jpg','/b/Blame!/第10卷/Blame10-002.jpg'];
    //并行异步控制
    asyncModule.mapLimit(collection.slice(0,6),2,function(i,callback){
        let requestPath = encodeURI(i);
        let imgPath=`${projectPath}/imgs/${comicName}/${title}/${collection.indexOf(i)}.jpg`;
        let options = {
            hostname:hostName,
            path:requestPath,
            headers:{
                'Referer':url
            }
        }
        https.get(options,function(res){
            let imgData = "";
            res.setEncoding("binary");
            res.on("data", function(chunk){
                imgData+=chunk;
            });
            res.on("end", function(){
                fs.writeFileSync(imgPath, imgData, "binary");
                callback(null);
            });
        })
    },function(err,result){
        if(err){
            log(`分页面【${title}】下载失败`);
            log('-----------------------------');
            seriesCallback(null,`分页面【${title}】下载失败`)
        }else{
            log(`分页面【${title}】下载完成`);
            log('-----------------------------');
            seriesCallback(null,`分页面【${title}】下载完成`)
        }
    })
  }
  exports.subPageSpider = subPageSpider;
// subPageSpider('https://www.dmzj.com/view/blame/60376.html','Vol_01','blame');

