import bcrypt from "bcryptjs";
const password = "Admin123!"; // your desired password
const saltRounds = 10;
const hash = await bcrypt.hash(password, saltRounds);
console.log(hash);


// this file returns a hash. its used when i want to insert a user directly through the sql 