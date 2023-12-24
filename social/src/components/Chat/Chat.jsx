import { useCallback, useEffect, useRef, useState } from "react";

import User from "../User";
import Button from "../Button";
import Textarea from "../Textarea";
import { useAuthContext } from "../../contexts/AuthContext";

import { useQuery, fetchAction } from '../api/api';
import { useErrorStatus } from "../../contexts/ErrorContext";

const Chat = ({isExpanded, setIsChatExpanded}) => {

  const { user } = useAuthContext();  
  const [friendInteract, setFriendInteract] = useState(null);
  
  const {data: friends} = useQuery({
    path: 'friends',
  });

  useEffect(() => {

    let timeoutId;    
    if(!isExpanded) {
      timeoutId = setTimeout(() => {  
        setFriendInteract(null);
      }, 500)
    }

    return(() => {
      clearTimeout(timeoutId);
    })

  }, [isExpanded])

  const toggleExpand = () => {
    setIsChatExpanded(!isExpanded)
  }

  const handleBackBtn = (e) => {
    e.stopPropagation();
    setFriendInteract(null);
  }

  return (
    <> 
      {isExpanded && (
        <div className="chat__toolbar"  onClick={toggleExpand}>
          {friendInteract && (
            <>
              <div onClick={(e) => handleBackBtn(e)}>
                <Button className="btn-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M560-253.847 333.847-480 560-706.153 602.153-664l-184 184 184 184L560-253.847Z"/></svg>
                </Button>
              </div>
              <div className="name">
                <span>{friendInteract.name}</span>
              </div>
            </>
          )}
          <div className="toggle-expand">
            <Button className="btn-sm">
              <svg aria-hidden="true" focusable="false" fill="currentColor" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M480-358.463 253.847-584.615 296-626.768l184 184 184-184 42.153 42.153L480-358.463Z"/></svg>          
            </Button>
          </div>
        </div>
      )}
      {friendInteract ? <Message user={user} friendInteract={friendInteract} isExpanded={isExpanded}/> : (<div className={`container ${isExpanded ? 'expanded' : ''}`}>
        <div className="chat__list">
          <div className="title">
            <span>Recent</span>
          </div>
          <div className="chat__list__users">
            <ol>
              {friends.map((friend, i) => (
                <li key={i} onClick={() => setFriendInteract(friend)}>
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
                <li key={i} onClick={() => setFriendInteract(friend)}>
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


const Message = ({user, friendInteract, isExpanded}) => {
  const {setErrorStatusCode} = useErrorStatus();
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);
  const lastMessageRef = useRef(null);
  const msgBoxRef = useRef(null);
  const sendMsgRef = useRef(null);

  const useRefCallback = useCallback((el) => {
    if(el) {
      sendMsgRef.current = el;
    }
  })

  const {data: messages, setData: setMessages} = useQuery({
    path: `users/${user.id}/messages/${friendInteract.friend_id}`
  })

  useEffect(() => {
    if(lastMessageRef.current) {
      const lastMessage = lastMessageRef.current.lastElementChild;
      if(lastMessage) {
        lastMessage.scrollIntoView(true);
      }
    }

    if(msgBoxRef.current) {
      msgBoxRef.current.focus();
    }

  }, [messages]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      const key = e.key;
      if (key === "Enter" && sendMsgRef.current) {
        console.log('click');        
        sendMsgRef.current.click();
      }
    };
  
    document.addEventListener('keypress', handleKeyPress);
  
    return () => {
      document.removeEventListener('keypress', handleKeyPress);
    };
  }, [sendMsgRef])

  const changeMessage = (message) => {
    if(error) {
      setError(null);
    }

    setMessage(message);
  } 

  const sendMessage = async (e) => {    
    e.stopPropagation();

    const regex = /[\p{L}]?.+/mgiu;    
    const match = regex.test(message);
      
    if(message.length === 0 || !match) {      
      return setError({error: "Enter a valid message"})
    }

    const response =  await fetchAction({
      path: `users/${user.id}/messages`,
      options: {
        method: "POST",
        body: JSON.stringify({message: message, recipientId: friendInteract.friend_id})
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
      const date = new Date();
      const newMessage = {id: data.insertId, send_user_id: user.id, receive_user_id: friendInteract.friend_id, message: message, date: `${date.getHours()}:${date.getMinutes()}`};
      setMessages([newMessage, ...messages])
      setMessage("");
    }
  }

  return (
    <div className={`container message ${isExpanded ? 'expanded' : ''}`}>      
      <div className="messages">
        {messages.map((msg, i) => (
          <div className="row" key={i} ref={i === 0 ? lastMessageRef : null}>
            <div>
              <div key={i} className={`msg ${msg.send_user_id !== user.id ? 'receive' : ''}`}>
                <span>{msg.message}</span>
              </div>
              <div className="date">
                <span>{msg.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {error && (
        <div className="alert">
          <span>{error.error}</span>
        </div>
      )}     
      <div className="message-box">
        <Textarea
          ref={msgBoxRef}          
          type="text"
          onChange={(e) => changeMessage(e.target.value)}
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
          <Button buttonRef={useRefCallback} className={'btn-sm'} onClick={(e) => sendMessage(e)}>
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M140.001-190.002v-579.996L828.458-480 140.001-190.002ZM200-280l474-200-474-200v147.693L416.921-480 200-427.693V-280Zm0 0v-400 400Z"/></svg>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Chat