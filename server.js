const express = require('express');
var request = require('request');
const app = express();
const port = 8080;
const axios = require('axios');
const mysql = require('mysql');
app.use(express.json());
app.use(express.urlencoded({ extended: true}));
const config = require('./config/database.json');


// 커넥션을 정의합니다.
// RDS Console 에서 본인이 설정한 값을 입력해주세요.

var connection = mysql.createConnection({
  host: config.host,
  user: config.user,
  password: config.password,
  database: config.database,
});

// RDS 접속
connection.connect(function(err) {
	if (err) {
		throw err; // 접속 실패
	} else {
		// 접속 성공
		connection.query("SELECT cid, cName, uid FROM cats", function(err, rows) {
		console.log(rows); // 간단한 정보 출력
		});
	}
});

function sendrows(res, uid) {
	//user DB 접근
	connection.query("select id, nickName, camID from users where id=?;", [uid], (err, rows) => {
		if (err) {
			res.send('{"uid": "fail"}')
			return console.log(err)
		}
		res.send(rows[0])
		console.log(rows[0])
	});
};

app.post("/test", (req,res)=>{
	var uid = req.body.uid;
	console.log("??",req.body);
	connection.query("select id, nickName, camID from users where id=?;", [uid], (err, rows) => {
		if (err) {
			res.send('{"uid": "fail"}')
			return console.log(err)
		}
		res.send(rows[0])
		console.log(rows[0])
	});
})

//getUserInfo
app.post("/getUser", (req, res) => {
    var uid = req.body.uid;
	console.log("?!!?",req.body.uid);

	//cat DB 접근
	connection.query("select cid, cName, cPicture from cats where uid=?;", [uid], (err, rows) => {
		if (err) {
			res.send('{"uid": "fail"}')
			return console.log(err)
		}
		var resultCats = Object.values(JSON.parse(JSON.stringify(rows)))
		console.log(resultCats)

		//user DB 접근
		connection.query("select id, nickName, camID from users where id=?;", [uid], (err, rows) => {
			if (err) {
				res.send('{"uid": "fail"}')
				return console.log(err)
			}
			if (rows.length == 0) {
				res.send('{"uid": "fail"}')
				return console.log(err)
			}
			rows[0].cats = resultCats
			res.send(rows[0])
			console.log(rows[0])
		});
	});
});

//addUserInfo
app.post("/addUser", (req, res) => {
	var uid = req.body.uid;
	var nickName = req.body.nickName;
	var camID = req.body.camID;
	connection.query("INSERT INTO users (id, nickName, camID) VALUES (?, ?, ?) ", [uid, nickName, camID], (err, rows) => {
		if (err) {
			res.send('{"uid": "fail"}')
			return console.log(err)
		}
		console.log("USER UPDATED!");
	});
	sendrows(res, uid);
});

//updateUserInfo
app.post("/updateUser", (req, res) => {
    var uid = req.body.uid;
	var nickName = req.body.nickName;
	var camID = req.body.camID;

	connection.query("UPDATE users SET nickName=?, camID=? WHERE id=?;", [nickName, camID, uid], (err, rows) => {
		if (err) {
			res.send('{"uid": "fail"}')
			return console.log(err)
		}

		console.log('USER UPDATED!')
	});
	sendrows(res, uid);
});

//getCanInfo
app.post("/getCat", (req, res) => {
	var cid = req.body.cid;
	connection.query("select uid, cid, cName, breed, date_format(birthDate, '%Y-%m-%d') as birthDate, gender, cPicture, bio from cats where cid=?;", [cid], (err, rows) => { //cat DB 접근
		if (err) {
			res.send('{"uid": "fail"}')
			return console.log(err)
		}
		res.send(rows[0]);
	});
});

//addCatInfo
app.post("/addCat", (req, res) => {
	var uid = req.body.uid;
	var cName = req.body.cName;
	var breed = req.body.breed;
	var birthDate = req.body.birthDate;
	var gender = req.body.gender;
	var cPicture = req.body.cPicture;
	var bio = req.body.bio;
	var sql = "INSERT INTO cats (cName, breed, birthDate, gender, cPicture, bio, uid) VALUES (?, ?, ?, ?, ?, ?, ?);"
	var params = [cName, breed, birthDate, gender, cPicture, bio, uid];
	connection.query(sql, params, (err, rows) => {
		if (err) {
			res.send('{"uid": "fail"}')
			return console.log(err)
		}
		console.log("CATS ADDED!");
		connection.query("select uid, cid, cName, cPicture from cats where cid=?;", [cid], (err, results) => { //cat DB 접근
			if (err) {
				res.send('{"uid": "fail"}')
				return console.log(err)
			}
			if (results.length == 0) {
				res.send('{"uid": "fail"}')
				return console.log(err)
			}
			res.send(results[0])
			console.log(results[0])

		});
	});
});

//updateCatInfo
app.post("/updateCat", (req, res) => {
	var uid = req.body.uid;
	var cid = req.body.cid;
	var cName = req.body.cName;
	var breed = req.body.breed;
	var birthDate = req.body.birthDate;
	var gender = req.body.gender;
	var cPicture = req.body.cPicture;
	var bio = req.body.bio;

	var sql = "UPDATE cats SET cName=?, breed=?, birthDate=?, gender=?, cPicture=?, bio=? WHERE cid=?;"
	var params = [cName, breed, birthDate, gender, cPicture, bio, cid];
	connection.query(sql, params, (err, rows) => {
		if (err) {
			res.send('{"uid": "fail"}')
			return console.log(err)
		}
		console.log("CATS ADDED!");
		connection.query("select uid, cid, cName, cPicture from cats where cid=?;", [cid], (err, results) => { //cat DB 접근
			if (err) {
				res.send('{"uid": "fail"}')
				return console.log(err)
			}
			if (results.length == 0) {
				res.send('{"uid": "fail"}')
				return console.log(err)
			}
			res.send(results[0])
			console.log(results[0])

		});
	});
});

//deleteCatInfo
app.post("/deleteCat", (req, res) => {
	var uid = req.body.uid;
	var cid = req.body.cid;
	connection.query("DELETE FROM cats WHERE cid=?;", [cid], (err, rows) => {
		if(err) {
			res.send('{"uid": "fail"}')
			return console.log(err)
		}
		console.log("DELETED CAT")
		res.send(`{"uid": "${uid}", "cid": ${cid}}`)
	});
});



async function getCamAPI(res, cid, chattid) {
   let sendData = { "cid" : " ", "chattid" : " "}
   sendData.cid = cid
   try {
      // axios.post 링크에서 camAPI 가져오기
      let response = await axios.post('http://localhost:3000/getCat', sendData) //promise 객체를 반환
      let data = await response.data

      res.json(data)

   } catch (error) {
      console.error(error)
      return error
   }
}

//sendMessage
app.post("/message", (req, res) => {

  var uid = req.body.uid;
  var cid = req.body.cid;
  var message = req.body.message;
/*
  var uid = "dkjflajkdsf";
  var cid = 1;
  var message = "고양이 모해";
*/
  if (message.length > 255 || message == null || message == undefined){
    res.send('{"uid" : "fail"}') // uid 번호 같은걸 넘겨주는 편이 좋을 것 같음
  }

  var sql = "INSERT INTO message(uid, cid, message) VALUES (?, ?, ?);"
  var params = [uid, cid, message];
  connection.query(sql, params, (err, rows) => {
    if (err) {
         res.send('{"uid": "fail"}')
         return console.log(err)
      }
   });

  var tid = -1;
  var sql = "SELECT tid FROM message ORDER BY tid DESC LIMIT 1;"
  var params = [uid, cid, message];
  connection.query(sql, (err, rows) => {
      if (err) {
         res.send('{"uid": "fail"}')
         return console.log(err)
      }
      tid = rows[0];
   });

    getCamAPI(res, cid, tid);
});


app.listen(port, () => {
    console.log(`server started ! http://localhost:${port}`);
});
