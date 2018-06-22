const phantom = require('phantom');
const fs = require('fs');
const request = require('request');

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
            var table = document.getElementsByTagName('table')[1];
            var img = table.getElementsByTagName('img')[0];
            var src = img.getAttribute('src');
            src = src.slice(0,-6);
            //获取总页数
            var td = table.getElementsByTagName('td')[0];
            var tdFirstChildText = td.firstChild.textContent;
            var pageNum = tdFirstChildText.match(/共(\S*)页/)[1];
            
            return [src,pageNum];
        })
    }
    console.log('页面信息数组获取成功----',pageInfoArray);
    await instance.exit();

    //图片下载逻辑
    let baseUrl = pageInfoArray[0];
    let maxNum = parseInt(pageInfoArray[1]);
    for(let i = 1;i<maxNum+1;i++){
        if(i<10){
            i = '0'+i;
        }
        let requestUrl = baseUrl + i + '.jpg';
        let imgPath="/"+i+".jpg";
        let writeStream = fs.createWriteStream(__dirname + "/imgs"+imgPath,{autoClose:true});
        request(requestUrl).pipe(writeStream); 
        writeStream.on('finish',function(){
            console.log(i+'.jpg 保存成功')
        })
    }
  }

spider('http://comic.kukudm.com/comiclist/3/3/1.htm');

