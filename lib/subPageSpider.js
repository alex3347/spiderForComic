const phantom = require('phantom');
const fs = require('fs');
const https = require('https');
const asyncModule = require('async');
const log = console.log;
const projectPath = process.cwd();

async function subPageSpider(url,title,comicName,seriesCallback) {
    log('开始解析：',title)
    let pageInfoObject = {};

    const instance = await phantom.create(['--load-images=false','--ignore-ssl-errors=true']);
    const page = await instance.createPage();
    //open后的status返回过慢 用超时时间弥补
    page.setting('resourceTimeout',4000);
    await page.open(url);

    pageInfoObject = await page.evaluate(function(){
        var page_select = document.getElementById('page_select');
        if(page_select){
            var options = page_select.options;
            var reg = /(\w+):\/\/([^/:]+)(:\d*)?([^# ]*)/;
            var hostName = options[0].value.match(reg)[2];//images.dmzj.com
            var collection = [];
            for(var i=0;i<options.length;i++){
                var current = options[i].value;
                collection.push(current.match(reg)[4]);// /b/Blame!/Vol_01a/BLAME_第一卷_001.jpg
            }
            return {'hostName':hostName,'collection':collection};
        }else{
            return null;
        }
    })
    await instance.exit();

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
    asyncModule.mapLimit(collection.slice(0,1),1,function(i,callback){
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

