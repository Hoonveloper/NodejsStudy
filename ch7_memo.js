var express = require('express')
  , http = require('http')
  , path = require('path')
  , multer= require('multer')
  ;

// Express의 미들웨어 불러오기
var bodyParser = require('body-parser')
  , cookieParser = require('cookie-parser')
  , static = require('serve-static')
  , errorHandler = require('errorhandler');

// 에러 핸들러 모듈 사용
var expressErrorHandler = require('express-error-handler');

// Session 미들웨어 불러오기
var expressSession = require('express-session');
 
// mongoose 모듈 사용
var mongoose = require('mongoose');


// 익스프레스 객체 생성
var app = express();
app.set('port', process.env.PORT || 3000);

// body-parser를 이용해 application/x-www-form-urlencoded 파싱
app.use(bodyParser.urlencoded({ extended: false }))

// body-parser를 이용해 application/json 파싱
app.use(bodyParser.json())

// public 폴더를 static으로 오픈
app.use('/public', static(path.join(__dirname, 'public')));
app.use('/uploads', static(path.join(__dirname,'uploads')))
// cookie-parser 설정
app.use(cookieParser());

// 세션 설정
app.use(expressSession({
	secret:'my key',
	resave:true,
	saveUninitialized:true
}));


var database;

// 데이터베이스 스키마 객체를 위한 변수 선언
var UserSchema;

// 데이터베이스 모델 객체를 위한 변수 선언
var UserModel;

function connectDB(){

    var url ='mongodb://localhost:27017/local';
    mongoose.Promise= global.Promise;

    mongoose.connect(url);
    database=mongoose.connection;

    database.on('error',console.error.bind(console, 'mongoose connection error!'));
    database.on('open', function () {
		console.log('데이터베이스에 연결되었습니다. : ' + url);
		
        
		// 스키마 정의
		UserSchema = mongoose.Schema({
		    name: {type: String, required: true, unique: true},
            date: {type: Date ,'default': Date.now},
            info: {type: String,required: true}
		});
		
		// 스키마에 static으로 findById 메소드 추가
		UserSchema.static('findById', function(id, callback) {
			return this.find({id:id}, callback);
		});
		
        // 스키마에 static으로 findAll 메소드 추가
		UserSchema.static('findAll', function(callback) {
			return this.find({}, callback);
		});
		
		console.log('UserSchema 정의함.');
		
		// UserModel 모델 정의
		UserModel = mongoose.model("users2", UserSchema);
		console.log('UserModel 정의함.');
		
		
	});
	
    // 연결 끊어졌을 때 5초 후 재연결
	database.on('disconnected', function() {
        console.log('연결이 끊어졌습니다. 5초 후 재연결합니다.');
        setInterval(connectDB, 5000);
    });


}


var router = express.Router();

var router = express.Router();

// 로그인 라우팅 함수 - 데이터베이스의 정보와 비교
router.route('/challenge/memo').post(function(req, res) {
	console.log('/challenge/memo 호출됨.');

	// 요청 파라미터 확인
    var paramName = req.body.name || req.query.name;
    var paramDate = req.body.date || req.query.date;
    var paramInfo = req.body.info || req.query.info;
	
    console.log('요청 파라미터 : ' + paramName + ', ' + paramDate+', ',paramInfo);
	
    // 데이터베이스 객체가 초기화된 경우, authUser 함수 호출하여 사용자 인증
	if (database) {
        saveData(database,paramName, paramDate, paramInfo,function(err,addedData){

            if(err){
                console.error('데이터 추가 중 에러 발생 : ' + err.stack);
                
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>사용자 추가 중 에러 발생</h2>');
                res.write('<p>' + err.stack + '</p>');
				res.end();
                return;

            }
            if (addedData){
                console.dir(addedData);
 
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>메모가 저장되었습니다.</h2>');
				res.end();

            }
        })
		
	} else {  // 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		res.write('<h2>데이터베이스 연결 실패</h2>');
		res.write('<div><p>데이터베이스에 연결하지 못했습니다.</p></div>');
		res.end();
	}
	
});

var saveData= function(database, name, date, info, callback){
    console.log("save data 호출");
    var user = UserModel({"name":name, "date":date, "info":info })

    user.save(function (err,addedData){
        if(err){
            callback(err,null);
            return;

        }
        else{
            console.log("데이터 저장 완료");
            callback(null, addedData)
        }

    });

};
//===== 서버 시작 =====//

// 프로세스 종료 시에 데이터베이스 연결 해제
process.on('SIGTERM', function () {
    console.log("프로세스가 종료됩니다.");
    app.close();
});

app.on('close', function () {
	console.log("Express 서버 객체가 종료됩니다.");
	if (database) {
		database.close();
	}
});
app.use('/',router);

// Express 서버 시작
http.createServer(app).listen(app.get('port'), function(){
  console.log('서버가 시작되었습니다. 포트 : ' + app.get('port'));

  // 데이터베이스 연결을 위한 함수 호출
  connectDB();
   
});
