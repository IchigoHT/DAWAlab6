const socket = io()

/**
 * ============================= CONSTANTS =============================
 */

const inpUsername = document.querySelector('#inp-username'),
    inpRoom = document.querySelector('#inp-room'),
    btnSignup = document.querySelector('#btn-signup'),
    inpMessage = document.querySelector('#inp-message'),
    containerSignup = document.querySelector('#signup'),
    containerChat = document.querySelector('#chat'),
    roomNameHeader = document.querySelector('#room-name'),
    chatUsers = document.querySelector('#chat-users'),
    chatMessage = document.querySelector('#chat-message')

/**
 * ============================= FUNCTIONS =============================
 */

function joinRoom() {
    const username = inpUsername.value,
        roomName = inpRoom.value

    sessionStorage.setItem('username', username);
    socket.emit('join room', { id: socket.id, username, roomName });

}

function showRoom({ roomName, users }) {
    containerSignup.classList.add('hidden');
    containerChat.classList.remove('hidden');
    roomNameHeader.innerText = roomName;
    fillUsersInRoom(users);

}

function fillUsersInRoom(users) {
    chatUsers.innerHTML = '';
    for (const user of users) {
        const classUserName = (user === sessionStorage.getItem('username')) ? 'me' : 'external',
            P = createTagP(user, 'user-info', classUserName);
        chatUsers.appendChild(P);
    }
}

function createTagP(text, ...classes) {
    const TagP = document.createElement('P');
    TagP.innerText = text;
    classes.forEach(className => TagP.classList.add(className));
    return TagP;
}

function sendMessage(e) {
    if (e.keyCode === 13) {
        socket.emit('message', e.target.value);
        e.target.value = '';
    }
}

function showMessage({message, username}) {
    const classUserName = (username === sessionStorage.getItem('username')) ? 'local-message' : 'message',
        pUserMessage = createTagP(username, 'username-message', classUserName),
        pMessage = createTagP(message, classUserName)

    chatMessage.appendChild(pUserMessage)
    chatMessage.appendChild(pMessage)

}

/**
 * ============================= LISTENERS =============================
 */

btnSignup.addEventListener('click', joinRoom);
inpMessage.addEventListener('keyup', sendMessage);

socket.on('user joined', showRoom);
socket.on('user disconnect', showRoom);
socket.on('message', showMessage);
