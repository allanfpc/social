import { useEffect, useRef, useState } from "react";
import { useWebSocket } from "../../hooks/useWebSocket";

import User from "../User";
import Button from "../Button";
import Textarea from "../Textarea";
import Picker from "../Chat/Picker";
import { useAuthContext } from "../../contexts/AuthContext";

import { useQuery } from "../api/api";

export const Messages = ({ messages }) => {
	const lastMessageRef = useRef(null);

	useEffect(() => {
		if (lastMessageRef.current) {
			const lastMessage = lastMessageRef.current.lastElementChild;
			if (lastMessage) {
				lastMessage.scrollIntoView(true);
			}
		}
	}, [messages]);

	return (
		<div className="messages">
			{messages.map((msg, i) => (
				<div className="row" key={i} ref={i === 0 ? lastMessageRef : null}>
					<div>
						<div key={i} className={`msg ${msg.receive ? "receive" : ""}`}>
							<span>{msg.message}</span>
						</div>
						<div className="date">
							<span>{msg.date}</span>
						</div>
					</div>
				</div>
			))}
		</div>
	);
};

const MessageBox = ({
	conversationId,
	user,
	state,
	sendJsonMessage,
	messages,
	setMessages,
	value,
	rows
}) => {
	const [message, setMessage] = useState({
		message: "",
		lastIndex: 0,
		lastEmojiIndex: 0
	});
	const [error, setError] = useState(null);
	const msgBoxRef = useRef(null);
	const sendMsgBtnRef = useRef(null);

	useEffect(() => {
		const handleKeyPress = (e) => {
			const key = e.key;
			if (key === "Enter" && sendMsgBtnRef.current) {
				sendMsgBtnRef.current.click();
			}
		};

		document.addEventListener("keypress", handleKeyPress);

		return () => {
			document.removeEventListener("keypress", handleKeyPress);
		};
	}, []);

	useEffect(() => {
		const event = value?.event;
		if (event === "receive-message") {
			setMessages([value, ...messages]);
			setMessage({
				message: ""
			});
		}
	}, [value]);

	useEffect(() => {
		if (msgBoxRef.current) {
			msgBoxRef.current.focus();
		}
	}, [error]);

	const sendMessage = async (e) => {
		e.stopPropagation();

		const text = message.message;

		const regex = /[\p{L}]?.+/gimu;
		const match = regex.test(text);

		if (text.length === 0 || !match) {
			return setError({ error: "Enter a valid message" });
		}

		if (conversationId.current) {
			sendJsonMessage({
				message: text,
				conversationId: conversationId.current,
				event: "send-message"
			});
		}
	};

	function getCaretIndex(e) {
		e.stopPropagation();

		const emojiRegex = /<a?:.+?:\d{18}>|\p{Extended_Pictographic}/gu;

		const temp = [];
		let indexCounter = 0;

		for (let i = 0; i < msgBoxRef.current.selectionEnd; i++) {
			const char = Array.from(message.message)
				.slice(i, i + 1)
				.join("");
			indexCounter += char.match(emojiRegex) ? 2 : 1;

			temp.push(char);

			if (indexCounter === msgBoxRef.current.selectionEnd) {
				const matchEmojis = temp.join("").match(emojiRegex);
				if (matchEmojis) {
					indexCounter = indexCounter - matchEmojis.length;
				}

				break;
			}
		}

		setMessage({ ...message, lastIndex: indexCounter });

		return indexCounter;
	}

	const changeMessage = (message) => {
		if (message.length > 0) {
			if (!state || (state && !state[user.nickname]?.typing)) {
				sendJsonMessage({
					state: { typing: true },
					conversationId: conversationId.current,
					user: user.nickname,
					event: "change-state"
				});
			}
		} else {
			sendJsonMessage({
				state: { typing: false },
				conversationId: conversationId.current,
				user: user.nickname,
				event: "change-state"
			});
		}

		if (error) {
			setError(null);
		}

		setMessage({
			message,
			lastIndex: message.lastIndex + 1
		});
	};

	function onFocus() {
		msgBoxRef.current.selectionStart = message.lastEmojiIndex;
		msgBoxRef.current.selectionEnd = message.lastEmojiIndex;
	}

	return (
		<>
			{error && (
				<div className="alert">
					<span>{error.error}</span>
				</div>
			)}
			<div className="message-box">
				<Textarea
					ref={msgBoxRef}
					type="text"
					id="message"
					name="message"
					placeholder="Send message..."
					autofocus
					rows={rows || 3}
					cols={32}
					value={message.message}
					maxlength={300}
					onChange={(e) => changeMessage(e.target.value)}
					onFocus={onFocus}
					onKeyUp={(e) => getCaretIndex(e)}
				/>
				<div className="toolbar">
					<Picker
						message={message}
						setMessage={setMessage}
						msgBoxRef={msgBoxRef}
					/>
					<div className="send">
						<Button
							buttonRef={sendMsgBtnRef}
							onClick={(e) => sendMessage(e)}
							label="Send Message"
						>
							<svg
								aria-hidden="true"
								focusable="false"
								xmlns="http://www.w3.org/2000/svg"
								height="24"
								viewBox="0 -960 960 960"
								width="24"
							>
								<path d="M140.001-190.002v-579.996L828.458-480 140.001-190.002ZM200-280l474-200-474-200v147.693L416.921-480 200-427.693V-280Zm0 0v-400 400Z" />
							</svg>
						</Button>
					</div>
				</div>
			</div>
		</>
	);
};

export const Message = ({ friendInteract, state, setState, rows }) => {
	const { user } = useAuthContext();
	const conversationId = useRef(null);

	const { sendJsonMessage, value } = useWebSocket(
		`wss://localhost:445/chat?senderUsername=${user.nickname}&recipientUsername=${friendInteract?.nickname}`
	);

	const { data: messages, setData: setMessages } = useQuery({
		path: `users/${user.id}/messages/${friendInteract.friend_id}`
	});

	useEffect(() => {
		const event = value?.event;
		if (event === "receive-conversation") {
			conversationId.current = value.conversationId;
			if (value.state) {
				setState(value.state);
			}
		}

		if (event === "change-state") {
			if (value.state) {
				setState(value.state);
			}
		}
	}, [value]);

	return (
		<>
			<Messages messages={messages} />
			<MessageBox
				conversationId={conversationId}
				user={user}
				state={state}
				setState={setState}
				sendJsonMessage={sendJsonMessage}
				setMessages={setMessages}
				messages={messages}
				value={value}
				rows={rows}
			/>
		</>
	);
};

const Toolbar = ({
	friendInteract,
	setFriendInteract,
	isExpanded,
	setIsExpanded,
	state,
	chatRef
}) => {
	const toggleExpand = () => {
		if (chatRef.current) {
			chatRef.current.style.setProperty("height", "40px", "important");
			setTimeout(() => {
				setIsExpanded(!isExpanded);
				chatRef.current.style.removeProperty("height");
			}, 600);
		} else {
			setIsExpanded(!isExpanded);
		}
	};

	const handleBackBtn = (e) => {
		e.stopPropagation();
		setFriendInteract(null);
	};

	return (
		<div className="chat__toolbar" onClick={toggleExpand}>
			{friendInteract && (
				<>
					<div onClick={(e) => handleBackBtn(e)}>
						<Button className="btn-sm">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								height="24"
								viewBox="0 -960 960 960"
								width="24"
							>
								<path d="M560-253.847 333.847-480 560-706.153 602.153-664l-184 184 184 184L560-253.847Z" />
							</svg>
						</Button>
					</div>
					<div className="name">
						<span>{friendInteract.name}</span>
						{state && state[friendInteract.nickname]?.typing === true && (
							<span className="interact">{`(typing...)`}</span>
						)}
					</div>
				</>
			)}
			<div className="toggle-expand">
				<Button className="btn-sm" label="Chat expand">
					<svg
						aria-hidden="true"
						focusable="false"
						fill="currentColor"
						xmlns="http://www.w3.org/2000/svg"
						height="24"
						viewBox="0 -960 960 960"
						width="24"
					>
						<path d="M480-358.463 253.847-584.615 296-626.768l184 184 184-184 42.153 42.153L480-358.463Z" />
					</svg>
				</Button>
			</div>
		</div>
	);
};

const ChatList = ({ friends, onClick }) => {
	return (
		<div className="chat__list__users">
			<ol>
				{friends.map((friend, i) => (
					<li key={i} onClick={() => onClick(friend)}>
						<div className="user">
							<User.Avatar
								img={{ src: friend.profile_img, alt: friend.name }}
								size={32}
							/>
							<div className="desc">
								<span>{friend.name}</span>
								<span
									className="chat-status"
									style={{
										color:
											friend.status === "online"
												? "green"
												: friend.status === "inactive"
													? "yellow"
													: "red"
									}}
								/>
							</div>
						</div>
					</li>
				))}
			</ol>
		</div>
	);
};

const Chat = ({ chatRef, isExpanded, setIsExpanded }) => {
	const [friendInteract, setFriendInteract] = useState(null);
	const [state, setState] = useState(null);

	const { data: friends } = useQuery({
		path: "friends",
		cache: "true"
	});

	const { data: recentFriends } = useQuery({
		path: "friends?recent=true",
		cache: "true"
	});

	return (
		<>
			<div className="chat-container">
				{isExpanded && (
					<Toolbar
						friendInteract={friendInteract}
						setFriendInteract={setFriendInteract}
						isExpanded={isExpanded}
						setIsExpanded={setIsExpanded}
						state={state}
						chatRef={chatRef}
					/>
				)}
				{friendInteract ? (
					<Message
						state={state}
						setState={setState}
						friendInteract={friendInteract}
					/>
				) : friends.length === 0 && recentFriends.length === 0 ? (
					<div>
						<p>No friends to show, Add friends to chat now.</p>
					</div>
				) : (
					<div className="chat__list">
						<div className="title">
							<span>Recent</span>
						</div>
						<ChatList
							title={"Recent"}
							friends={recentFriends.slice(0, 20)}
							onClick={setFriendInteract}
						/>
						<div className="title">
							<span>More</span>
						</div>
						<ChatList
							title={"More"}
							friends={friends}
							onClick={setFriendInteract}
						/>
					</div>
				)}
			</div>
		</>
	);
};

export default Chat;
