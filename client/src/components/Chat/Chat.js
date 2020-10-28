import React, { useState, useEffect } from 'react';
// useEffect is a hook that allows use to use life cycle methods and side effects 
// in functional components
// useEffect is equivalent to componentDidMount and componentDidUpdate
// we want to perform cleanup, using lifecycle method we do this via: 
// componentWillUnMount but with useEffect, we can return a cleanup function simply
import queryString from 'query-string';
import io from 'socket.io-client';
import './Chat.css'
import InfoBar from '../InfoBar/InfoBar';
import Input from '../Input/Input';
import Messages from '../Messages/Messages';
import TextContainer from '../TextContainer/TextContainer';
let socket;

// location received as a prop from react router
const Chat = ({ location }) => {

    // states
    const [name, setName] = useState('');
    const [room, setRoom] = useState('');

    const END_POINT = 'https://chatify-node.herokuapp.com/';

    // runs when the component renders
    useEffect(() => {
        // return data that users have entered 
        const { name, room } = queryString.parse(location.search);

        socket = io(END_POINT);

        setName(name);
        setRoom(room);


        //es6 way of creating object with same names
        socket.emit('join', { name, room }, (error) => {
            // alert(error);
        });
        // to finish the useEffect hook, we have to provide a return statement
        // this return is used for unmounting i.e. disconnecting the effect
        // when the user leaves the chat
        return () => {
            socket.emit('disconnect');

            socket.off(); // turn off the socket for the client who was chatting
        }
    }, [END_POINT, location.search]);
    // array argument specifies that whenever these values change, 
    // re-rendering through useEffect should be done else not

    // message states
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    // second useEffect for handling messages
    // with hooks we can use any no. of hooks
    useEffect(() => {
        socket.on('message', (message) => {
            // we cannot mutate state as immutatable, so copy and add
            setMessages([...messages, message]);
        });
    }, [messages]); // apply effect only when messages added

    const [users, setUsers] = useState([]);

    useEffect(() => {
        socket.on('roomData', ({ users }) => {
            setUsers(users);
        })
    }, [users]);

    // function for sending messages
    const sendMessage = (event) => {
        // restrict page refresh on button click/key press
        event.preventDefault();

        if (message) {
            socket.emit('sendMessage', message, () => setMessage(''));
        }
    }

    return (
        <div className="outerContainer">
            <div className="container">
                <InfoBar room={room} />
                <Messages messages={messages} name={name} />
                <Input message={message} setMessage={setMessage} sendMessage={sendMessage} />
            </div>
            <TextContainer users={users} />
        </div>
    )
}

export default Chat;