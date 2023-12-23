import { useContext, useEffect, useState } from "react";

import User from "../User";
import Button from "../Button";
import Textarea from "../Textarea";
import { useAuthContext } from "../../contexts/AuthContext";

import {useQuery, fetchAction} from '../api/api';
import { useErrorStatus } from "../../contexts/ErrorContext";

const Chat = ({isExpanded}) => {

  const { user } = useAuthContext();  
  const [userInteract, setUserInteract] = useState(null);
  
  const {data: friends} = useQuery({
    path: 'friends',
  });

  return (
    <>
      {userInteract ? <Message user={user} userInteract={userInteract} isExpanded={isExpanded}/> : (<div className={`container ${isExpanded ? 'expanded' : ''}`}>
        <div className="chat__list">
          <div className="title">
            <span>Recent</span>
          </div>
          <div className="chat__list__users">
            <ol>
              {friends.map((friend, i) => (
                <li key={i} onClick={() => setUserInteract(friend)}>
                  <div className="user">
                    <User.Avatar img={{img: friend.name, alt: friend.name }} size={32} />
                    <div className="desc">
                      <span>{friend.name}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
        <div className="chat__list">
          <div className="title">
            <span>More</span>
          </div>
          <div className="chat__list__users">
            <ol>
              {friends.map((friend, i) => (
                <li key={i} onClick={() => setUserInteract(friend)}>
                  <div className="user">
                    <User.Avatar img={{img: friend.name, alt: friend.name }} size={32} />
                    <div className="desc">
                      <span>{friend.name}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>       
      </div>)}
    </>
  )
}


const Message = ({user, userInteract, isExpanded}) => {
  const {setErrorStatusCode} = useErrorStatus();
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);

  const {data: messages, setData: setMessages} = useQuery({
    path: `users/${user.id}/messages/${userInteract.id}`
  })

  const sendMessage = async (e) => {
    e.stopPropagation();

    const response =  await fetchAction({
      path: `users/${user.id}/messages`,
      options: {
        method: "POST",
        body: JSON.stringify({message: message, recipientId: userInteract.id})
      }
    })
    
    
    if(response.error && response.code) {
      if(response.code === 422 || response.code === 413) {
        return setError({error: response.error});
      }      
      return setErrorStatusCode(response.code);
    }

    const data = response.data;

    if(data.success) {
      const newMessage = {id: data.insertId, send_user_id: user.id, receive_user_id: userInteract.id, message: message};
      setMessages([...messages, newMessage])
      setMessage("");
    }
  }

  return (
    <div className={`container message ${isExpanded ? 'expanded' : ''}`}>
      <div className="title">
        <span>{user.name}</span>
      </div>
      <div className="messages">

      </div>
      {error && (
        <div className="alert">
          <span>{error.error}</span>
        </div>
      )}     
      <div className="message-box">
        <Textarea 
          type="text"
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          cols={32}
          value={message}
          maxlength={300}
          id="message"
          name="message"
          placeholder="Send message..."
          autofocus          
        />
        <div className="send">
          <Button className={'btn-sm'} onClick={(e) => sendMessage(e)}>
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M140.001-190.002v-579.996L828.458-480 140.001-190.002ZM200-280l474-200-474-200v147.693L416.921-480 200-427.693V-280Zm0 0v-400 400Z"/></svg>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Chat