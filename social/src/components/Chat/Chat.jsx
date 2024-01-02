import { useCallback, useEffect, useRef, useState } from "react";
import { useWebSocket } from "../../hooks/useWebSocket";

import User from "../User";
import Button from "../Button";
import Textarea from "../Textarea";
import { useAuthContext } from "../../contexts/AuthContext";

import { useQuery } from '../api/api';

const Chat = ({isExpanded, setIsChatExpanded}) => {

  const { user } = useAuthContext();  
  const [friendInteract, setFriendInteract] = useState(null);
  const [state, setState] = useState(null);
  
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
                <span className="interact">{(state && state[friendInteract.nickname]?.typing === true) && (` (typing...)`)}</span>
              </div>
            </>
          )}
          <div className="toggle-expand">
            <Button className="btn-sm" label="Chat expand">
              <svg aria-hidden="true" focusable="false" fill="currentColor" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M480-358.463 253.847-584.615 296-626.768l184 184 184-184 42.153 42.153L480-358.463Z"/></svg>          
            </Button>
          </div>
        </div>
      )}
      {friendInteract ? <Message user={user} friendInteract={friendInteract} state={state} setState={setState} isExpanded={isExpanded}/> : (<div className={`container ${isExpanded ? 'expanded' : ''}`}>
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


const Message = ({user, friendInteract, state, setState, isExpanded}) => {
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);
  const lastMessageRef = useRef(null);
  const msgBoxRef = useRef(null);
  const sendMsgRef = useRef(null);
  const conversationId = useRef(null);
  
  const useRefCallback = useCallback((el) => {
    if(el) {
      sendMsgRef.current = el;
    }
  })

  const {data: messages, setData: setMessages} = useQuery({
    path: `users/${user.id}/messages/${friendInteract.friend_id}`
  })
  
  const { sendJsonMessage, value } = useWebSocket(`ws://localhost:8080/chat?senderUsername=${user.nickname}&recipientUsername=${friendInteract.nickname}`);

  useEffect(() => {
    if(value) {
      const event = value.event;

      if(event === "receive-conversation") {
        conversationId.current = value.conversationId;
        if(value.state) {
          setState(value.state);
        }
      }
      
      if(event === "receive-message") {
        const message = {send_user_id: value.senderId, receive_user_id: value.recipientId, message: value.message}
        setMessages([message, ...messages])
        setMessage("");
      }

      if(event === "change-state") {
        if(value.state) {
          setState(value.state);
        }
      }
    }
  }, [value])

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

  }, [message, error]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      const key = e.key;
      if (key === "Enter" && sendMsgRef.current) {      
        sendMsgRef.current.click();
      }
    };
  
    document.addEventListener('keypress', handleKeyPress);
  
    return () => {
      document.removeEventListener('keypress', handleKeyPress);
    };
  }, [])

  const changeMessage = (message) => {
    if(error) {
      setError(null);
    }

    if(message.length > 0) {
      if(!state || state && !state?.[user.nickname]?.typing) {        
        sendJsonMessage({          
          state: {typing: true},
          conversationId: conversationId.current,
          user: user.nickname,
          event: "change-state"
        });
      }
    } else {
      sendJsonMessage({          
        state: {typing: false},
        conversationId: conversationId.current,
        user: user.nickname,
        event: "change-state"
      });      
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

    if(conversationId.current) {
      sendJsonMessage({
        senderId: user.id,
        recipientId: friendInteract.id,
        message: message,      
        conversationId: conversationId.current,
        event: "send-message",
      });
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