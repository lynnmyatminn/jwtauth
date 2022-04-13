const express = require('express');
const app = express();
app.use(express.json());

const jwt = require('jsonwebtoken');

const users = [
    {
        id: '1',
        username: 'kyawgyi',
        password: 'admin123',
        isAdmin: true
    },
    {
        id: '2',
        username: 'aungla',
        password: 'user123',
        isAdmin: false
    }
];

const _accessSecretKey = 'a55555';
const _refreshSecretKey = 'r55555';
let refreshTokenList = [];

const generateAccessToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            isAdmin: user.isAdmin
        },
        _accessSecretKey,
        { expiresIn: "30s" }
    );
};
const generateRefreshToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            isAdmin: user.isAdmin
        },
        _refreshSecretKey
    );
};

app.post('/api/refresh', (req, res) => {
    //Take refresh token from the user
    const refreshToken = req.body.token;
    //Submit error if invalid or there is no token
    if (!refreshToken) return res.status(401).json('You are not authenticated!');
    if (!refreshTokenList.includes(refreshToken)) {
        return res.status(403).json('Refresh token is not valid!');
    }
    jwt.verify(refreshToken, _refreshSecretKey, (error, user) => {
        error && console.log(error);
        refreshTokenList = refreshTokenList.filter((token) => token !== refreshToken);

        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        refreshTokenList.push(newRefreshToken);
        res.status(200).json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        })
    });
    //If everything is ok, create new access token, refresh token and send back to user
});


//VERIFY TOKEN//middleware
const verify = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader;
        jwt.verify(token, _accessSecretKey, (error, payload) => {
            if (error) {
                return res.status(403).json('token is not valid! maybe wrong secretkey or token expired');
            }

            req.user = payload;
            next();
        });
    } else {
        res.status(401).json('you are not authenticated');
    }
};

//GET USERS
app.get('/api/users', verify, (req, res) => {
    res.status(200).json(users);
});

//LOGIN
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find((u) => {
        return u.username === username && u.password === password;
    });
    if (user) {
        // res.json(user);
        /*Generate access token */
        const accessToken = generateAccessToken(user);
        /*Generate refresh token */
        const refreshToken = generateRefreshToken(user);
        refreshTokenList.push(refreshToken);
        res.status(200).json({
            username: user.username,
            isAdmin: user.isAdmin,
            accessToken,
            refreshToken
        });
    } else {
        res.status(400).json('username or password incorrect!');
    }
});

//LOGOUT
app.post('/api/logout', verify, (req, res) => {
    const refreshToken = req.body.token;
    refreshTokenList = refreshTokenList.filter((token) => token !== refreshToken);
    res.status(200).json('you logged out successfully.')
});

app.delete('/api/users/:id', verify, (req, res) => {
    if (req.user.id === req.params.id || req.user.isAdmin) {
        res.status(200).json('user has been deleted successfully.');
    } else {
        res.status(403).json('you are not allowed to delete this user!');
    }
});

app.listen(8000, () => {
    console.log('server is running')
});