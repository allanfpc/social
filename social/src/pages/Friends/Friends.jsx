import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import "./friends.css";

import { Message } from "../../components/Picker";
import Button from "../../components/Button";
import User from "../../components/User";
import SearchBar from "../../components/SearchBar/SearchBar";
import ThemeButton from "../../components/ThemeButton";

import { useAuthContext } from "../../contexts/AuthContext";
import { useQuery } from "../../components/api/api";

const Welcome = ({ name }) => {
	return (
		<div className="welcome">
			<div>
				<img src="/src/assets/smile.png" alt="smile" />
			</div>
			<div className="welcome-body">
				<div>
					<h1 className="display">Welcome {name}</h1>
				</div>
				<div>
					<span className="title">Choose an user to talk</span>
				</div>
			</div>
		</div>
	);
};

export const Friends = () => {
	const { user, signOut } = useAuthContext();
	const [friendInteract, setFriendInteract] = useState(null);
	const [state, setState] = useState(null);
	const [search, setSearch] = useState("");
	const navigate = useNavigate();

	const { data: friends } = useQuery({
		path: "friends"
	});

	const filteredFriends =
		search.length > 0
			? friends.filter((f) => f.name.includes(search))
			: friends;
	const back = () => {
		navigate(-1);
	};

	return (
		<div>
			<div className="friends">
				<section className="users">
					<div className="sidebar">
						<div className="sidebar-title">
							<h1>Friends</h1>
						</div>
						<div className="sidebar-body">
							<nav>
								<div>
									<div>
										<SearchBar
											value={search || ""}
											onChange={(e) => setSearch(e.target.value)}
										/>
									</div>
									<div className="users-list">
										{filteredFriends.map((friend, i) => (
											<div
												id={friend.name}
												className="row"
												onClick={(e) => {
													e.stopPropagation();
													setFriendInteract(friend);
												}}
												key={i}
											>
												<Link to={`#${friend.name}`}>
													<div>
														<User.Avatar
															img={{ src: friend.picture, alt: "profile" }}
															size={50}
														/>
														<User.Desc name={friend.name} />
													</div>
												</Link>
											</div>
										))}
									</div>

									<div className="actions">
										<div className="action logout">
											<a href="/login" onClick={signOut}>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													height="24"
													viewBox="0 -960 960 960"
													width="24"
												>
													<path d="M212.309-140.001q-30.308 0-51.308-21t-21-51.308v-535.382q0-30.308 21-51.308t51.308-21h268.076V-760H212.309q-4.616 0-8.463 3.846-3.846 3.847-3.846 8.463v535.382q0 4.616 3.846 8.463 3.847 3.846 8.463 3.846h268.076v59.999H212.309Zm436.922-169.232-41.537-43.383 97.384-97.385H363.846v-59.998h341.232l-97.384-97.385 41.537-43.383L819.999-480 649.231-309.233Z" />
												</svg>
												<span>Logout</span>
											</a>
										</div>
										<div className="action">
											<ThemeButton title />
										</div>
									</div>
								</div>
							</nav>
						</div>
					</div>
				</section>
				<section className="message">
					{friendInteract ? (
						<>
							<div className="container">
								<div className="container-toolbar">
									<div className="toolbar-actions">
										<div>
											<Button className="close" onClick={() => back(null)}>
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
										<div>
											<Button
												className="close"
												onClick={() => setFriendInteract(null)}
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													height="24"
													viewBox="0 -960 960 960"
													width="24"
												>
													<path d="M256-213.847 213.847-256l224-224-224-224L256-746.153l224 224 224-224L746.153-704l-224 224 224 224L704-213.847l-224-224-224 224Z" />
												</svg>
											</Button>
										</div>
									</div>
									<div className="user-wrapper">
										<div className="user">
											<User.Avatar
												img={{ src: friendInteract.picture }}
												alt={friendInteract.name}
												size={42}
											/>
											<div className="desc">
												<span>{friendInteract.name}</span>
											</div>
											<div>
												<span
													className="chat-status"
													style={{
														color:
															friendInteract.status === "online"
																? "green"
																: friendInteract.status === "inactive"
																	? "yellow"
																	: "red"
													}}
												/>
											</div>
										</div>
									</div>
								</div>
								<Message
									user={user}
									friendInteract={friendInteract}
									state={state}
									setState={setState}
									rows={4}
								/>
							</div>
						</>
					) : (
						<Welcome name={user?.name} />
					)}
				</section>
			</div>
		</div>
	);
};
