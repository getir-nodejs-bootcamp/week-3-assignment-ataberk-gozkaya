//import modules
const express = require("express");
const jwt = require("jsonwebtoken");
const bearerToken = require("express-bearer-token");
require("dotenv").config();

//import my own module
const writeLogData = require("./LogData");

//setting up properties
const port = process.env.APP_PORT;
const SECRET = "Bloodborne";
const logFile = process.env.LOG_FILE;

const app = express();

app.use(express.json());
app.use(bearerToken());

let users = [];

var token = "";

//this is just a simulation for creating token
app.post("/login", async (req, res) => {
    console.log("token assigned");
    token = await jwt.sign({ id: 5 }, SECRET);

    res.send(token);
});
//create and add user to the array. first check for token
app.post("/user", async (req, res) => {
    let newUser;
    if (!verifyToken(token)) {
        res.statusCode = 401;
        res.send("token not valid");
        await writeLogData(
            logFile,
            `Status: ${res.statusCode} ${
                req.url
            } on ${new Date().toISOString()}\n`
        );
        return;
    }
    if (!checkValid(req.body, res)) {
        await writeLogData(
            logFile,
            `Status: ${res.statusCode} ${
                req.url
            } on ${new Date().toISOString()}\n`
        );
        return;
    }
    newUser = req.body;
    newUser.id = users.length;

    users.push(newUser);

    res.statusCode = 200;
    await writeLogData(
        logFile,
        `Status: ${res.statusCode} ${req.url} on ${new Date().toISOString()}\n`
    );
    res.json(newUser);
});
//get user with respect to id
app.get("/user/:id", async (req, res) => {
    const id = req.params.id * 1;
    const user = users.find((el) => el.id === id);

    if (!verifyToken(token)) {
        res.statusCode = 401;
        res.send("token not valid");
        await writeLogData(
            logFile,
            `Status: ${res.statusCode} ${
                req.url
            } on ${new Date().toISOString()}\n`
        );
        return;
    }
    if (!user) {
        res.statusCode = 400;
        res.send("there is no one with that id");
        await writeLogData(
            logFile,
            `Status: ${res.statusCode} ${
                req.url
            } on ${new Date().toISOString()}\n`
        );
        return;
    }
    res.statusCode = 200;

    await writeLogData(
        logFile,
        `Status: ${res.statusCode} ${req.url} on ${new Date().toISOString()}\n`
    );
    res.send(user);
});
//find index with respect to id and change that object
app.put("/user/:id", async (req, res) => {
    const id = req.params.id * 1;

    if (!verifyToken(token)) {
        res.statusCode = 401;
        res.send("token not valid");
        await writeLogData(
            logFile,
            `Status: ${res.statusCode} ${
                req.url
            } on ${new Date().toISOString()}\n`
        );
        return;
    }
    let index = users.findIndex((e) => e.id === id);
    if (index < 0) {
        res.statusCode = 400;
        await writeLogData(
            logFile,
            `Status: ${res.statusCode} ${
                req.url
            } on ${new Date().toISOString()}\n`
        );
        res.send("id is wrong");
        return;
    }
    if (!checkValid(req.body, res)) {
        await writeLogData(
            logFile,
            `Status: ${res.statusCode} ${
                req.url
            } on ${new Date().toISOString()}\n`
        );
        return;
    }
    users[index].id = id;
    users[index].email = req.body.email;
    users[index].password = req.body.password;
    await writeLogData(
        logFile,
        `Status: ${res.statusCode} ${req.url} on ${new Date().toISOString()}\n`
    );
    res.json(users[index]);
});
//find index by using id and patch some properties
app.patch("/user/:id", async (req, res) => {
    const id = req.params.id * 1;

    if (!verifyToken(token)) {
        res.statusCode = 401;
        res.send("token not valid");
        await writeLogData(
            logFile,
            `Status: ${res.statusCode} ${
                req.url
            } on ${new Date().toISOString()}\n`
        );
        return;
    }
    let index = users.findIndex((e) => e.id === id);

    if (index < 0) {
        res.statusCode = 400;
        await writeLogData(
            logFile,
            `Status: ${res.statusCode} ${
                req.url
            } on ${new Date().toISOString()}\n`
        );
        res.send("id is wrong");
        return;
    }

    let tempUser = users[index];
    users[index] = { ...tempUser, ...req.body };
    await writeLogData(
        logFile,
        `Status: ${res.statusCode} ${req.url} on ${new Date().toISOString()}\n`
    );
    res.json(users[index]);
});
//obviously will delete item according to id
app.delete("/user/:id", async (req, res) => {
    const id = req.params.id * 1;
    let index = users.findIndex((e) => e.id === id);

    if (!verifyToken(token)) {
        res.statusCode = 401;
        res.send("token not valid");
        await writeLogData(
            logFile,
            `Status: ${res.statusCode} ${
                req.url
            } on ${new Date().toISOString()}\n`
        );
        return;
    }
    if (index < 0) {
        res.statusCode = 400;
        await writeLogData(
            logFile,
            `Status: ${res.statusCode} ${
                req.url
            } on ${new Date().toISOString()}\n`
        );
        res.send("id is wrong");
        return;
    }

    users.splice(index, 1);
    res.statusCode = 200;
    await writeLogData(
        logFile,
        `Status: ${res.statusCode} ${req.url} on ${new Date().toISOString()}\n`
    );
    res.send("deleted");
});

app.listen(port, () => {
    console.log(`app running on port ${port}`);
});
//it is for checking token
function verifyToken(token) {
    try {
        var decodedToken = jwt.verify(token, SECRET);
        //console.log(decoded);
        return decodedToken;
    } catch (error) {
        //console.log(error)
        return false;
    }
}
//some entities must be there for creating and putting
function checkValid(userData, res) {
    if (userData.email === undefined || userData.password === undefined) {
        res.statusCode = 400;
        res.send("wrong data");
        return false;
    }
    return true;
}
