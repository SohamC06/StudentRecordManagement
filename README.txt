To run this on your laptop follow the given steps:

1.Download MySQL locally on your laptop

2.Create a database with the database name as 'student_info'

3.Import the student_info_dump file using "mysql -u Enter_your_db_user -p Enter_your_db_name < student_info_dump.sql"

4.Set up a .env file in the root of the project directory by using "cp .env.example .env"

5.Incase you used a different database name , make sure to update it in the .env file

6.Run the app using "node index.js"

Note: Any changes to the database schema must also be changed in the .env file
      Make sure to run all commands while in the root project directory on your terminal