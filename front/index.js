const back_address = 'http://localhost:3000';
const front_address = 'http://localhost:8080';

const url_string = window.location.href;
const url = new URL(url_string);
const token = url.searchParams.get('code');

if (!token)
    window.location.replace(`${back_address}/login`);

const input = document.getElementById('input');
const enter_room = document.getElementById('enter_room');
const new_room = document.getElementById('new_room');
const error_label = document.getElementById('error_label');
const room_label = document.getElementById('room_label');
const songs = document.getElementById('songs');

let room = null;

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function getUniqueTracks(room) {
    const tracks = [];
    for (let user of room.users) {
        tracks.push(
            ...user.data.items.map(
                el => `${el.name} - ${el.artists[0].name}`
            ).filter(el => !tracks.includes(el))
        );
    }
    return shuffleArray(tracks);
}

function render(room) {
    if (!room) {
        room_label.innerText = '';
        songs.innerHTML = '';
        return;
    }

    room_label.innerText = room.id;
    songs.innerHTML = getUniqueTracks(room).map(el => `<li>${el}</li>`).join('');
}

enter_room.addEventListener('click', async e => {
    const options = {
        method: 'PUT',
        mode: 'cors',
    }
    if (input.value) {
        const response = await fetch(
            `${back_address}/room/${input.value}?token=${token}`,
            options
        ).then(data => data.json());
        if (response.error) {
            error_label.innerText = response.error;
            setTimeout(() => error_label.innerText = '', 1000);
        } else {
            render(response);
        }
    } else {
        error_label.innerText = 'invalid room id';
        setTimeout(() => error_label.innerText = '', 1000);
    }
});

new_room.addEventListener('click', async e => {
    const options = {
        method: 'POST',
        mode: 'cors',
    }
    if (input.value) {
        const response = await fetch(
            `${back_address}/room/${input.value}?token=${token}`,
            options
        ).then(data => data.json());
        if (response.error) {
            error_label.innerText = response.error;
            setTimeout(() => error_label.innerText = '', 1000);
        } else {
            render(response);
        }
    } else {
        error_label.innerText = 'invalid room id';
        setTimeout(() => error_label.innerText = '', 1000);
    }
});