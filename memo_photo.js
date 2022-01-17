var express= require('express'), http= require('http'), path=require('path');


var bodyParser=require('body-parser'),static=require('serve-static');

var multer =require('multer');
var app= express();


app.set('port',process.env.PORT|| 3000);

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//public 폴더 열기
app.use('/public',static (path.join(__dirname,'public')));

//uploads 폴더 열기
app.use('/uploads', static(path.join(__dirname,'uploads')));


var storage= multer.diskStorage({
    destination: function(req, file ,callback) {
        callback(null,'uploads')

    },
    filename: function(req,file,callback) {
        callback(null,file.originalname+Date.now());

    }
});

var upload= multer({
    storage: storage,
    limits: {
        files:3,
        fileSize:1024*1024*1024

    }

})

var router = express.Router();

router.route('/challenge/memo').post( upload.array('photo',1),function(req,res) {
    var org_name='',filename='',mimetype='',size=0;
   try{
    console.log( 'challenge/memo 처리중');
    
    var paramauthor =req.body.name|| req.query.name;
    var paramdate=req.body.date || req.query.date;
    var parammemo=req.body.info || req.query.info;
    var  files = req.files;

    console.dir(req.files[0]);
    console.dir('=====');
    
    

    org_name= files[0].originalname;
    filename= files[0].filename;
    mimetype=files[0].mimetype;
    size=filees[0].size;
    
    console.log('현재 파일장보 : '+org_name +filename+mimetype+size);

    
    // var info ={};
    // info['record']= {'name':paramauthor,'date':paramdate};
    // res.send(info)
   }catch(err){
       console.dir(err.stack);



   }
   res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
    res.write('<h1>메모 저장완료</h1>');
    res.write('<div><p>Param 작성자 : ' + paramauthor + '</p></div>');
	res.write('<div><p>Param 날짜 : ' + paramdate+ '</p></div>');
	res.write('<div><p>Param 내용 : ' + parammemo+ '</p></div>');
	res.write('<br><br>');
    res.write('<h3>파일 업로드 성공</h3>');
    res.write('<p>원본 파일명 : ' + org_name + ' -> 저장 파일명 : ' + filename + '</p>');
	res.write('<p>MIME TYPE : ' + mimetype + '</p>');
	res.write('<p>파일 크기 : ' + size + '</p>');
	res.write("<br><br><a href='/public/memo_photo.html'>메모 다시작성</a>");
	res.end();

})

app.use('/',router)


http.createServer(app).listen(app.get('port'),function(){
    console.log(app.get('port')+'에 접속');

})