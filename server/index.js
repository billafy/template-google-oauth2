require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { UserRefreshClient, OAuth2Client } = require("google-auth-library");
const cookieParser = require("cookie-parser");

const app = express();

const port = process.env.PORT || 5000;

const oAuth2Client = new OAuth2Client(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    "postmessage"
);

app.use(
    cors({
        origin: ["http://localhost:3000"],
        credentials: true,
        sameSite: "None",
        secure: true,
    })
);
app.use(express.json());
app.use(cookieParser());

app.post("/auth/login", async (req, res) => {
    const { tokens } = await oAuth2Client.getToken(req.body.code);
    res.cookie("refreshToken", tokens.refresh_token, {
        maxAge: 3600000,
        httpOnly: true,
        sameSite: "None",
        secure: true,
    });
    res.json({ success: true, tokens });
});

app.get("/auth/logout", async (req, res) => {
    if (req.cookies.refreshToken) res.clearCookie("refreshToken");
    res.json({ success: true });
});

app.get("/auth/refresh", async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.json({ success: false }).status(401);
    const user = new UserRefreshClient(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
        refreshToken
    );
    const { credentials } = await user.refreshAccessToken();
    res.json({ success: true, tokens: credentials });
});

app.listen(port, console.log(`Listening port ${port}`));
