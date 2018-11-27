const phantom = require('phantom');
const fs = require('fs');
const {subPageSpider} = require('./subPageSpider');
const asyncModule = require('async');
const log = console.log;
const projectPath = process.cwd();

async function mainPageSpider(url,comicName) {
    let pageInfoArray = [];
    
    const instance = await phantom.create(['--load-images=false','--ignore-ssl-errors=true']);
    const page = await instance.createPage();
    const status = await page.open(url);
    log(url);
    if(status === 'fail'){
        log('打开主页面失败')
        return;
    }else{
        log('打开主页面成功');
        pageInfoArray = await page.evaluate(function(){
            //获取baseUrl
            var list = document.getElementsByClassName('list_con_li')[0];
            var listItem = list.getElementsByTagName('li');
            var tempArray = [];
            for(var i=0;i<listItem.length;i++){
                var current = listItem[i];
                var address = current.getElementsByTagName('a')[0].href;
                var title = current.getElementsByClassName('list_con_zj')[0].innerText;
                var tempObject = {};
                tempObject['title'] = title;
                tempObject['address'] = address;
                tempArray.push(tempObject);
            }
            return tempArray;
        });
    }
    await instance.exit();
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

