var express= require('express'), http= require('http'), path=require('path');


var bodyParser=require('body-parser'),static=require('serve-static');

var app= express();


app.set('port',process.env.PORT|| 3000);

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//public 폴더 열기
app.use('/public',static (path.join(__dirname,'public')));


var router = express.Router();

router.route('/challenge/memo').post( function(req,res) {
    console.log( 'challenge/memo 처리중');
    
    var paramauthor =req.body.name|| req.query.name;
    var paramdate=req.body.date || req.query.date;

    res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
    res.write('<h1>메모 저장완료</h1>');
    res.write('<div><p>Param id : ' + paramauthor + '</p></div>');
	res.write('<div><p>Param password : ' + paramdate+ '</p></div>');
	res.write("<br><br><a href='/public/memo.html'>메모 다시작성</a>");
	res.end();
    // var info ={};
    // info['record']= {'name':paramauthor,'date':paramdate};
    // res.send(info)

})

app.use('/',router)


http.createServer(app).listen(app.get('port'),function(){
    console.log(app.get('port')+'에 접속');

})