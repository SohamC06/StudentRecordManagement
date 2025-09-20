const express = require('express');
const path = require('path');
const connector = require('./db');
const fs = require('fs');
require('dotenv').config();
const app = express();

app.use(express.urlencoded({extended : true}));

app.use(express.static('static'));

app.get('/',(req,resp)=>
{
    resp.sendFile(path.join(__dirname,'/static/index.html'),(err)=>
    {
        if(err) throw err;
    });
});

app.post('/',(req,resp)=>
{
    if(!req.body.RollNo || !req.body.FirstName?.trim() || !req.body.LastName?.trim() || !req.body.Email?.trim() || !req.body.Password?.trim())
    {
        return resp.send("Please Fill all Required(*) fields")
    }
    if(req.body.Password.length >10)
    {
        return resp.send("Password longer than 10 characters");
    }
    connector.query(`SELECT Email FROM data WHERE Email = ?`,[req.body.Email],(err,data)=>
    {
        if(err) throw err;
        if(data.length>0)
        {
            return resp.send("Email already exists");
        }

        connector.query(`SELECT * FROM data WHERE RollNo = ?`,[req.body.RollNo],(err,data)=>
        {
            if(err) throw err;
            if(data.length>0)
            {
                return resp.send("Roll No. already exists");
            }
            connector.query(`INSERT INTO data (RollNo,FirstName,LastName,DOB,Address,Email,Password) values(?,?,?,?,?,?,?)`,
                [req.body.RollNo,req.body.FirstName,req.body.LastName,req.body.DOB,req.body.Address,req.body.Email,req.body.Password],(err)=>
                {
                    if(err)
                    {
                        console.error("Insertion Failed",err.message);
                    }
                    else
                    {
                        console.log("Inserted Succesfully");
                    }
                    resp.redirect('/login');
                });
        });
    });
});

app.get('/login',(req,resp)=>
{
    resp.sendFile(path.join(__dirname,'/static/login.html'),(err)=>
    {
        if(err) throw err;
    });
});

app.post('/login',(req,resp)=>
{
    global.user= req.body.username;
    connector.query(`SELECT Password FROM data WHERE Email = ?`,[req.body.username],(err,data)=>
    {
        if(err)
        {
            console.error("Selection Query Failed",err.message);
        }
        if(data.length === 0)
        {
            resp.send("Email Not Found")
        }
        else
        {
                let pd=data[0].Password;
            if(req.body.pwd == pd)
            {
                resp.redirect('/info');
            }
            else
            {
                resp.send("Incorrect Password");
            }
        }
        
    });
});

app.get('/info',(req,resp)=>
{
    fs.readFile(path.join(__dirname,"/static/info.html"),'utf8',(err,data)=>
    {
        if(err) throw err;

        let html = data;
        connector.query(`SELECT RollNo, FirstName, LastName, DATE_FORMAT(DOB, '%d-%m-%Y') AS DOB, Address, Email FROM data WHERE Email = ?`,[user],(err,result)=>
        {
            if(err) {throw err;}

            let {RollNo,FirstName,LastName,DOB,Address,Email}=result[0];

            let text = 
            `
                <!DOCTYPE html>
                <html>
                    <style>
                        body
                        {
                            background-image: url("student_project_bg.jpg");
                            background-size:cover;
                        }
                        .shape-container
                        {
                            display:flex;
                            justify-content:center;
                            align-items:center;
                            height:672px;
                        }
                        .shape
                        {
                            width:700px;
                            height:500px;
                            background-color:rgba(180, 232, 180,0.9);
                            border-radius:10%;
                            display:flex;
                            justify-content:center;
                            align-items:center;
                            flex-direction:column;
                        }
                        table,tr,th,td
                        {
                            border: 1px solid black;
                            padding:5px;
                            opacity:100%;
                        }
                        table
                        {
                            border:3px solid rgb(29, 42, 35);
                            padding:10px;
                            border-radius:14px;
                            border-spacing:0px;
                            border-collapse:separate;   
                            overflow:hidden;
                            height:100px;
                            width:95%;
                            box-shadow: 1px 2px 7px #374a3750;
                            font-family: 'Segoe UI', Arial, sans-serif;
                        }
                        td:hover
                        {
                            background-color:rgb(107, 168, 134);
                        }
                        th
                        {
                            background-color:rgb(75, 122, 96);
                        }
                        .panel-container
                        {
                            display:flex;
                            justify-content:flex-start;
                            align-items:flex-start;
                        }
                        .panel
                        {
                            width:1282px;
                            height:50px;
                            background-color:rgb(137, 199, 137);
                            margin:-10px;
                            display:flex;
                            justify-content:center;
                            align-items:center;
                        }
                        .heading
                        {
                            font-family:'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
                            font-size:40px;
                            font-weight:700;
                        }
                    </style>
                    <body>
                        <div class="panel-container">
                            <div class="panel">
                                <p class="heading">Student Management System</p>
                            </div>
                        </div>
                        <div class="shape-container">
                            <div class="shape">
                                <h1>Student Info</h1>
                                <br><table class="table" border="1">
                                    <tr>
                                    <th>Roll Number</th>
                                    <th>Name</th>
                                    <th>Date of Birth</th>
                                    <th>Address</th>
                                    <th>Email</th>
                                    </tr>
                                    <tr>
                                    <td>${RollNo}</td>
                                    <td>${FirstName} ${LastName}</td>
                                    <td>${DOB}</td>
                                    <td>${Address}</td>
                                    <td>${Email}</td>
                                    </tr>
                                </table><br><br><br><a href="/login">Back to Login</a>
                            </div>
                        </div>

                    </body>
                </html>
            `
            html += `${text}`;
            resp.send(html);
        });
        
    });
    
});


app.listen(process.env.PORT || 5000,()=>
{
    console.log(`Server running at : http://localhost:${process.env.PORT}`);
});