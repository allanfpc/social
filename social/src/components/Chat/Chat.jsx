import { useContext, useEffect, useState } from "react";

import User from "../User";
import Button from "../Button";
import { useAuthContext } from "../../contexts/AuthContext";

import {useQuery} from '../api/api';

const Chat = () => {

  const { user, token } = useAuthContext();
  console.log('token: ', token)
  const [isExpanded, setIsExpanded] = useState(false);

  const [friends] = useQuery({
    path: 'friends',
    options: {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: "include"
    }
  });

  return (
    <div className={`${!isExpanded ? 'minimized' : ''} chat`} onClick={() => setIsExpanded(!isExpanded)}>
      <div className="chat__toolbar">
        <Button className="btn-sm">
          {isExpanded ? (
            <svg aria-hidden="true" focusable="false" fill="currentColor" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M480-358.463 253.847-584.615 296-626.768l184 184 184-184 42.153 42.153L480-358.463Z"/></svg>
          ) : (
            <svg aria-hidden="true" focusable="false" fill="currentColor" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="m296-358.463-42.153-42.152L480-626.768l226.153 226.153L664-358.463l-184-184-184 184Z"/></svg>
          )}
        </Button>
      </div>
      {isExpanded && (
        <div className="chat__container">
          <div className="chat__list">
            <div className="title">
              <span>Recent</span>
            </div>
            <div className="chat__list__users">
              <ol>
                <li>
                  <div className="user">
                    <User.Avatar img={{img: '', alt: '' }} size={32} />
                    <div className="user__desc__name">
                      <span>Test</span>
                    </div>
                  </div>
                </li>
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
                  <li key={i}>
                    <div className="user">
                      <User.Avatar img={{img: friend.name, alt: friend.name }} size={32} />
                      <div className="user__desc__name">
                        <span>{friend.name}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Chat