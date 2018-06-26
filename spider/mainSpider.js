const phantom = require('phantom');
const fs = require('fs');
const subPageSpider = require('./phantomNodeSpider.js').subPageSpider;
const asyncModule = require('async');

let pageInfoArray = [];
async function mainPageSpider(url) {
    //获取页面信息逻辑
    const instance = await phantom.create();
    const page = await instance.createPage();
    const status = await page.open(url);

    if(status === 'fail'){
        console.log('打开主页面失败')
    }else{
        console.log('打开主页面成功');
        //页面信息数组
        pageInfoArray = await page.evaluate(function(){
            //获取baseUrl
            var comicList = document.getElementById('comiclistn');
            var dd = comicList.getElementsByTagName('dd');
            var temp = [];
            for(var i=0;i<dd.length;i++){
                var ddCell = dd[i];
                var aHref = ddCell.getElementsByTagName('a')[0].href;
                var pageNum = aHref.match(/comiclist\/3\/(\S*)\/1.htm/)[1];
                temp.push(pageNum);
            }
            return temp;
        });
    }
    console.log('主页面链接数组获取成功');
    await instance.exit();

    //执行子页面爬取图片
    function runSubPageSpider(arg){
        let url = `http://comic.kukudm.com/comiclist/3/${arg}/1.htm`
        subPageSpider(url,arg);
    }
    
    //建立图片文件夹
    // for(let i = 0;i<pageInfoArray.length;i++){
        for(let i = 0;i<2;i++){
        fs.mkdir(`${__dirname}/imgs/${pageInfoArray[i]}`,function(err){  
            if(err)  
                console.error(err);  
            console.log('创建文件夹'+pageInfoArray[i]+'成功');  
        });
        runSubPageSpider(pageInfoArray[i]);
    }
    
  }

mainPageSpider('http://comic.kukudm.com/comiclist/3/');

