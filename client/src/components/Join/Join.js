import React, { useState } from 'react';
// React hooks 
// Hooks are new functionality for function based components
// Before function based components were simply dummy functions
// But using hooks, we can use state and life cycle methods 
// And use 90% of class component functionality in function based componets
// This makes code cleaner
// useState is a react hook

import './Join.css'
import { Link } from 'react-router-dom';


const Join = () => {

    // states
    const [name, setName] = useState('');
    const [room, setRoom] = useState('');


    return (
        <div className="joinOuterContainer">
            <div className="joinInnerContainer">
                <h1 className="heading">Join</h1>
                <div><input placeholder="Name" className="joinInput" type="text" onChange={(event) => setName(event.target.value)} /></div>
                <div><input placeholder="Room" className="joinInput mt-20" type="text" onChange={(event) => setRoom(event.target.value)} /></div>

                <Link onClick={event => (!name || !room) ? event.preventDefault() : null} to={`/chat?name=${name}&room=${room}`}>
                    <button className="button mt-20" type="submit">Sign In</button>
                </Link>
            </div>
        </div>
    )
}

export default Join;