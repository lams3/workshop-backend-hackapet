const fetch = require('node-fetch');
const express = require('express');
const app = express();

class Room {
    constructor(id) {
        this.id = id;
        this.users = [];
    }
    
    add(user) {
        for (let u of this.users)
            if (u.token === user.token) {
                u.data = user.data;
                return;
            }
        this.users.push(user);
    }
}

class User {
    constructor(token, data) {
        this.token = token;
        this.data = data;
    }
}

const rooms = [];

const front_address = 'http://localhost:8080';
const back_address = 'http://localhost:3000';
const client_id = '96753862a7bb43c1965b35ce9662b102';
const client_secret = 'f0af8ba9aa5243f2a0902c6490bd82d5';
const redirect_uri = `${back_address}/token`;
const scopes = [
    'user-read-playback-state',
    'user-read-currently-playing',
    'user-modify-playback-state',
    'streaming',
    'app-remote-control',
    'playlist-read-collaborative',
    'playlist-modify-private',
    'playlist-modify-public',
    'playlist-read-private',
    'user-read-birthdate',
    'user-read-email',
    'user-read-private',
    'user-follow-modify',
    'user-follow-read',
    'user-library-read',
    'user-library-modify',
    'user-read-recently-played',
    'user-top-read'
].join(' ');

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/login', (req, res) => {
    res.redirect(
        `https://accounts.spotify.com/authorize` +
        `?response_type=code` +
        `&client_id=${client_id}` +
        `&scope=${encodeURIComponent(scopes)}` +
        `&redirect_uri=${encodeURIComponent(redirect_uri)}` +
        `&show_dialog=true`
    );
});

app.get('/token', async (req, res) => {
    const code = req.query.code;

    const body = {
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': redirect_uri,
        'client_id': client_id,
        'client_secret': client_secret
    }

    const options = {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: Object.keys(body)
                .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(body[key])}`)
                .join('&')
    }
    
    const tokens = await fetch(
        `https://accounts.spotify.com/api/token`,
        options
    ).then(data => data.json());

    res.redirect(`${front_address}?code=${tokens.access_token}`);
});

//new room;
app.post('/room/:room_id', async (req, res) => {
    const room_id = req.params.room_id;
    for (let room of rooms)
        if (room.id === room_id) {
            res.json({
                error: `room with id ${room_id} alredy exists`
            });
            return;
        }
        
    const room = new Room(room_id);
    const token = req.query.token;
    const options = {
        method: 'GET',
        mode: 'cors',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }
    const user_data = await fetch(
        `https://api.spotify.com/v1/me/top/tracks?limit=50`,
        options
    ).then(data => data.json());

    room.add(new User(token, user_data));
    rooms.push(room)
    
    res.json(room);
});


//enter room;
app.put('/room/:room_id', async (req, res) => {
    const room_id = req.params.room_id;
    for (let room of rooms)
        if (room.id === room_id) {
            const token = req.query.token;
            const options = {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
            const user_data = await fetch(
                `https://api.spotify.com/v1/me/top/tracks?limit=50`,
                options
            ).then(data => data.json());

            room.add(new User(token, user_data));
            rooms.push(room)

            res.json(room);
            return;
        }
    res.json({
        error: `no room with id ${room_id}`
    });
});

app.listen(3000, () => console.log('Server Running'));