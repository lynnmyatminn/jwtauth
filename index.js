const express = require('express');
const app = express();
app.use(express.json());

const jwt = require('jsonwebtoken');

const _secretKey = '55555';

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

//LOGIN
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find((u) => {
        return u.username === username && u.password === password;
    });
    if (user) {
        // res.json(user);
        /*generate access token */
        const accessToken = jwt.sign(
            {
                id: user.id,
                isAdmin: user.isAdmin
            },
            _secretKey,
            { expiresIn: '15m' }
        );
        res.status(200).json({
            username: user.username,
            isAdmin: user.isAdmin,
            accessToken
        });
    } else {
        res.status(400).json('username or password incorrect!');
    }
});

//VERIFY TOKEN//middleware
const verify = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader;
        jwt.verify(token, _secretKey, (error, payload) => {
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

app.delete('/api/users/:id', verify, (req, res) => {
    if (req.user.id === req.params.id || req.user.isAdmin) {
        res.status(200).json('user has been deleted successfully.');
    } else {
        res.status(403).json('you are not allowed to delete this user!');
    }
});

app.listen(3000, () => {
    console.log('server is running')
});