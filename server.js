const fetch = require("node-fetch");
const express = require('express');
var request = require('request');
var axios = require('axios');
const config = require('./config/database.json');
const app = express();
const port = 8080;
const mysql = require('mysql');
app.use(express.json());
app.use(express.urlencoded({ extended: false}));


// 커넥션을 정의합니다.
// RDS Console 에서 본인이 설정한 값을 입력해주세요.

var connection = mysql.createConnection({
  host: config.host,
  user: config.user,
  password: config.password,
  database: config.database,
});

// RDS에 접속합니다.
connection.connect(function(err) {
  if (err) {
    throw err; // 접속에 실패하면 에러를 throw 합니다.
  } else {
    // 접속시 쿼리를 보냅니다.
    connection.query("SELECT * FROM cats", function(err, rows, fields) {
      console.log(rows); // 결과를 출력합니다!
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
	connection.query("select cid, cName, cPicture from cats where uid=?;", [uid], (err, rows) => { //cat DB 접근
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
	connection.query("INSERT INTO users (id, nickName, camID) VALUES (?, ?, ?, ?) ", [uid, nickName, camID], (err, rows) => {
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
	var uid = req.body.uid;
	var cid = req.body.cid;
	connection.query("select uid, cid, cName, breed, birthDate, gender, cPicture, bio from cats where uid=?;", [uid], (err, rows) => { //cat DB 접근
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
	});
	sendrows(res, uid);
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
	});
	sendrows(res, uid);
});

//deleteCatInfo
app.post("/deleteCat", (req, res) => {
	var uid = req.body.uid;
	var cid = req.body.cid;
  console.log(uid)
	connection.query("DELETE FROM cats WHERE cid=?;", [cid], (err, rows) => {
		if(err) {
			res.send('{"uid": "fail"}')
			return console.log(err)
		}
		console.log("DELETED CAT")
		res.send(uid + "'s cat was deleted.")
	});
});


async function getCamAPI(res, cid, chattid) {
	let sendData = { "cid" : " ", "chattid" : " "}
	sendData.cid = cid
	try {
		// axios.post 링크에서 camAPI 가져오기
		let response = await axios.post('localhost:3000/getCat', sendData) //promise 객체를 반환
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
  console.log(uid)
  if (message.length() > 255 || message == None){
    res.send('{"uid" : "fail"}') // uid 번호 같은걸 넘겨주는 편이 좋을 것 같음
  }

  var sql = "INSERT INTO message(uid, cid, message) VALUES (?, ?, ?);"
  var params = [uid, cid, message];
  connection.query(sql, params, (err, rows) => {
    if (err) {
			res.send('{"uid": "fail"}')
			return console.log(err)
		}
		res.send(rows[0]);
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

	sendrows(res, uid);
	getCamAPI(res, uid, tid);
});


app.listen(port, () => {
    console.log(`server started ! http://localhost:${port}`);
});
