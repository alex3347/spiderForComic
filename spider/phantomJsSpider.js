var webpage = require('webpage');
var page = webpage.create();
var pageInfoArray = [];

//open为异步方法
page.open('http://comic.kukudm.com/comiclist/3/3/1.htm',function(status){
    if(status === 'fail'){
        console.log('打开页面失败')
    }else{
        console.log('打开页面成功');
        //页面信息数组
        pageInfoArray = page.evaluate(function(){
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
        // process.send(pageInfoArray);
    }
    console.log('页面信息数组获取成功----',pageInfoArray);
    page.close();
    phantom.exit();
});


