sql = require('mysql2');

require('dotenv').config();

connector = sql.createConnection(
    {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password : process.env.DB_PASSWORD,
        database : process.env.DB_NAME || 'student_info'
    }
);

connector.connect((err)=>
{
    if(err)
    {
        console.error("DB error",err.message);
        return;
    }
    else
    {
        console.log("DB Connection Successful");
    }
});

module.exports = connector;