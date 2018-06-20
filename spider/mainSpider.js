let http = require('http');
let fs = require('fs');
let cheerio = require('cheerio');
let request = require('request');
let url = "http://comic.kukudm.com/comiclist/3/3/1.htm";

function download(url,callback){
    http.get(url,function(res){
        let data = '';
        res.on('data',function(chunk){
            data += chunk;
        });
        res.on('end',function(){
            callback(data)
        })
    }).on('error',function (err) {
        console.log(err)
      })
}

download(url,function (data) {  
    if(data){
        let $=cheerio.load(data);
        // let imgs = $('img');
        console.log($('window.server'));
        console.log($('table').eq(1).find('script').eq(0).html());
        // $('img').each(function (i,elem) {
        //     let imgSrc = $(this).attr('src');
        //     console.log(imgSrc,1);
        //     if(imgSrc && i == 2){
        //         if(imgSrc.indexOf('https') == -1){
        //             imgSrc = 'https:' + imgSrc;
        //         }
        //         let imgPath="/"+i+"."+imgSrc.split(".").pop();
        //         request(imgSrc).pipe(fs.createWriteStream(__dirname + "/imgs"+imgPath)); 
        //     }
        //   })
    }
})