var webpage = require('webpage');
var page = webpage.create();
page.open('http://comic.kukudm.com/comiclist/3/3/1.htm',function(status){
    var data;
    if(status === 'fail'){
        console.log('open page fail!')
    }else{
        // console.log(page.content);
        var url = '';
        url = page.evaluate(function(){
            var table = document.getElementsByTagName('table')[1];
            var img = table.getElementsByTagName('img')[0];
            var src = img.getAttribute('src');
            return src;
        })
        console.log(url);
    }
    page.close();
    phantom.exit();
});
