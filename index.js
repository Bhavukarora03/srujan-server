const express = require("express");
const mongoose = require("mongoose").default;
const cors = require("cors");
const authRouter = require("./routes/auth");
const documentRouter = require("./routes/document");
const http = require("http");

require("dotenv").config();

const PORT = process.env.PORT || 3001;
const app = express();

var server = http.createServer(app);
var socketIO = require("socket.io")(server);

app.use(cors());
app.use(express.json());
app.use(authRouter);
app.use(documentRouter);
const DB = process.env.MONGODB_CONNECTION;
mongoose.connect(DB).then(() => console.log("MongoDB connected...")).catch((err) => console.log(err));

socketIO.on('connection', (socket) => {
    socket.on('join', (documentId) => {
        socket.join(documentId);
    });

    socket.on("typing", (data) => {
        socket.broadcast.to(data.room).emit("changes", data);
    });

    socket.on("save", (data) => {
        saveData(data)
    });
});
const saveData = async (data) => {
    let document = await Document.findById(data.room);
    document.content = data.delta;
     await document.save();
};

server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on ${PORT}`);
});

