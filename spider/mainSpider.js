const phantom = require('phantom');
const fs = require('fs');

let pageInfoArray = [];
async function spider(url) {
    //获取页面信息逻辑
    const instance = await phantom.create();
    const page = await instance.createPage();
    const status = await page.open(url);

    if(status === 'fail'){
        console.log('打开页面失败')
    }else{
        console.log('打开页面成功');
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
    console.log('页面链接数组获取成功----',pageInfoArray);
    await instance.exit();

    //建立图片文件夹
    for(let i = 0;i<pageInfoArray.length+1;i++){
        fs.mkdir(`${__dirname}/imgs/${pageInfoArray[i]}`,function(err){  
            if(err)  
                console.error(err);  
            console.log('创建文件夹'+i+'成功');  
        });
    }
  }

spider('http://comic.kukudm.com/comiclist/3/');

