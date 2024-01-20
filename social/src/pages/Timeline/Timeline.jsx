
import { useContext, useEffect, useRef, useState } from "react";
import { useLoaderData } from "react-router-dom";
import './timeline.css';

import Layout from "../../layouts/Layout";
import User from "../../components/User";
import Post from "../../components/Post";
import Button from "../../components/Button";
import Dropdown from "../../components/Dropdown";

import { useAuthContext } from "../../contexts/AuthContext"
import { useErrorContext } from "../../contexts/ErrorContext";
import { fetchAction, useQuery } from "../../components/api/api";
import { useErrorStatus } from "../../contexts/ErrorContext";
import UpdateImage from "./UpdateImage";
import Cookies from "js-cookie";

//const token = Cookies.get('token');

const Timeline = () => {
  const {user, token} = useAuthContext();
  
  const timelineUser = useLoaderData();
  
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(true);  

  const [posts] = useQuery({            
    path: `users/${timelineUser.id}/posts`,
    setLoading
  });

  return (
    <>       
      <Layout modal={modal} setModal={setModal}>
        <section>
          <div className="container">
            <Profile user={user} timelineUser={timelineUser} setModal={setModal} />
          </div>
        </section>
        <section className="posts">
          <div className="toolbar"></div>
          <div className="flex-center">
            <div className="column">
              <div className="posts-wrapper">
                {loading ? (
                  <div className="flex-center container">
                    <div className="loading">
                      <span></span>
                    </div>
                  </div>
                ) : (!posts || posts.length === 0)
                ?
                  (<div className="container">
                    <span>No posts to show</span>
                  </div>)
                : 
                posts.map((post) => (
                  <Post          
                    name={post.name}
                    nickname={post.nickname}
                    profile_img={post.profile_img}
                    date={post.date}
                    images={post.images}
                    key={post.post_id}
                    id={post.post_id}                    
                    text={post.text}                    
                    liked={post.liked}
                    totalLikes={post.total_likes}
                    totalComments={post.total_comments}
                    totalShares={post.total_shares}
                    setModal={setModal}
                    actions
                  />
                ))}               
            </div>
            </div>
          </div>                
        </section>        
      </Layout>
    </>
  )
}

const Profile = ({user, timelineUser, setModal}) => {
  console.log(user)
  console.log('profile: ', timelineUser)
  
const Profile = ({ user, timelineUser, isAuthenticated }) => {
	const { showModal } = useGlobalModalContext();
	const [cover, setCover] = useState(timelineUser.cover);
	const [profileImg, setProfileImg] = useState(timelineUser.picture);
	const picInputRef = useRef(null);
	const coverInputRef = useRef(null);

	const sameUser = user && user.id === timelineUser.id;

	const createModal = (props) => {
		showModal("CREATE_MODAL", {
			...props
		});
	};

	function changeProfilePic(e) {
		const file = e.target.files[0];
		createModal({
			elem: (
				<UpdateImage
					user={user}
					type={"picture"}
					image={file}
					onImageChange={setProfileImg}
					fileUpload={picInputRef.current}
				/>
			),
			fileUpload: picInputRef.current
		});
	}

	async function changeProfileCover(e) {
		const file = e.target.files[0];

		createModal({
			elem: (
				<UpdateImage
					user={user}
					type={"cover"}
					image={file}
					onImageChange={setCover}
					fileUpload={coverInputRef.current}
				/>
			),
			fileUpload: coverInputRef.current
		});
	}

	return (
		<section className="profile">
			<div className="profile-container">
				<div>
					<div className="profile__cover">
						<div
							className="cover"
							style={{
								backgroundImage: `url('/uploads/cover/${
									cover || "default.png"
								}')`
							}}
						/>
						{sameUser && (
							<div className="floatCenter">
								<Button
									className="rounded"
									onClick={() => coverInputRef.current.click()}
									label="Update Cover"
								>
									<svg
										aria-hidden="true"
										focusable="false"
										xmlns="http://www.w3.org/2000/svg"
										fill="currentColor"
										height="24"
										viewBox="0 -960 960 960"
										width="24"
									>
										<path d="M460-84.616q-87.769 0-149.269-61.5-61.5-61.499-61.5-149.268v-432.309q0-63.144 44.967-108.11 44.966-44.966 108.11-44.966t108.11 44.966q44.966 44.966 44.966 108.11v390.001q0 40.061-27.664 67.723-27.665 27.661-67.731 27.661-40.066 0-67.72-27.661-27.653-27.662-27.653-67.723v-390.001h47.691v390.001q0 20.269 13.712 33.981 13.712 13.712 33.981 13.712 20.269 0 33.981-13.712 13.712-13.712 13.712-33.981v-390.001q0-44.262-30.571-74.823-30.571-30.562-74.847-30.562-44.275 0-74.814 30.562-30.538 30.561-30.538 74.823v432.309q0 67.538 47.769 115.308Q392.461-132.307 460-132.307q67.539 0 115.308-47.769 47.769-47.77 47.769-115.308v-432.309h47.692v432.309q0 87.769-61.5 149.268-61.5 61.5-149.269 61.5Z" />
									</svg>
								</Button>
								<input
									type="file"
									accept="image/png, image/jpeg"
									ref={coverInputRef}
									onChange={(e) => changeProfileCover(e)}
								/>
							</div>
						)}
					</div>
					<hr />
					<div className="profile__pic">
						<div>
							<User.Avatar
								nickname={timelineUser.nickname}
								img={{ src: profileImg, alt: timelineUser.name }}
							>
								{sameUser && (
									<div className="floatCenter">
										<Button
											className="rounded"
											onClick={() => picInputRef.current.click()}
											label="Update profile picture"
										>
											<svg
												aria-hidden="true"
												focusable="false"
												xmlns="http://www.w3.org/2000/svg"
												fill="currentColor"
												height="24"
												viewBox="0 -960 960 960"
												width="24"
											>
												<path d="M460-84.616q-87.769 0-149.269-61.5-61.5-61.499-61.5-149.268v-432.309q0-63.144 44.967-108.11 44.966-44.966 108.11-44.966t108.11 44.966q44.966 44.966 44.966 108.11v390.001q0 40.061-27.664 67.723-27.665 27.661-67.731 27.661-40.066 0-67.72-27.661-27.653-27.662-27.653-67.723v-390.001h47.691v390.001q0 20.269 13.712 33.981 13.712 13.712 33.981 13.712 20.269 0 33.981-13.712 13.712-13.712 13.712-33.981v-390.001q0-44.262-30.571-74.823-30.571-30.562-74.847-30.562-44.275 0-74.814 30.562-30.538 30.561-30.538 74.823v432.309q0 67.538 47.769 115.308Q392.461-132.307 460-132.307q67.539 0 115.308-47.769 47.769-47.77 47.769-115.308v-432.309h47.692v432.309q0 87.769-61.5 149.268-61.5 61.5-149.269 61.5Z" />
											</svg>
										</Button>
										<input
											type="file"
											accept="image/png, image/jpeg"
											ref={picInputRef}
											onChange={(e) => changeProfilePic(e)}
										/>
									</div>
								)}
							</User.Avatar>
						</div>
					</div>
				</div>

				<Toolbar user={user} timelineUser={timelineUser} />
			</div>
		</section>
	);
};

const Toolbar = ({ user, timelineUser }) => {
	const { showError } = useErrorContext();
	const { showModal } = useGlobalModalContext();
	const [blocked, setBlocked] = useState(timelineUser.blocked);
	const [invite, setInvite] = useState(null);
	const [following, setFollowing] = useState(timelineUser?.following);

	const sameUser = user.id === timelineUser.id;

	useEffect(() => {
		const fetchInvite = async () => {
			const { data, error } = await fetchAction({
				path: `friends/${timelineUser.id}/invites`
			});

			if (error) {
				return error.code === 401 ? showModal(401) : showError(error);
			}

			if (data) {
				setInvite(data);
			}
		};

		fetchInvite();
	}, []);

	const inviteFriend = async () => {
		const { data, error } = await fetchAction({
			path: `friends/${timelineUser.id}/invites`,
			options: {
				method: "POST",
				body: JSON.stringify(timelineUser)
			}
		});

		if (error) {
			return error.code === 401 ? showModal(401) : showError(error);
		}

		if (data && data.success) {
			setInvite({ status: "pending" });
		}
	};

	const acceptInvite = async () => {
		const { data, error } = await fetchAction({
			path: `friends/${timelineUser.id}/invites/${invite.id}`,
			options: {
				method: "PUT",
				body: JSON.stringify({ status: "accepted", user: timelineUser })
			}
		});

		if (error) {
			return error.code === 401 ? showModal(401) : showError(error);
		}

		if (data && data.success) {
			setInvite("accepted");
		}
	};

	const cancelInvite = async () => {
		const { data, error } = await fetchAction({
			path: `friends/${timelineUser.id}/invites/${invite.id}`,
			options: {
				method: "DELETE"
			}
		});

		if (error) {
			return error.code === 401 ? showModal(401) : showError(error);
		}

		if (data && data.success) {
			setInvite(null);
		}
	};

	const undoFriend = () => {
		showModal("CREATE_MODAL", {
			action: cancelInvite,
			message: "Are you sure you want to undo this friend request?"
		});
	};

	const blockUser = async () => {
		const block = async () => {
			const { data, error } = await fetchAction({
				path: `users/${timelineUser.id}/blocks`,
				options: {
					method: "POST"
				}
			});

			if (error) {
				return error.code === 401 ? showModal(401) : showError(error);
			}

			if (data && data.success) {
				setBlocked(true);
			}
		};

		showModal("CREATE_MODAL", {
			action: block,
			message: "Are you sure you want to block this user?"
		});
	};

	const unblockUser = async () => {
		const { data, error } = await fetchAction({
			path: `users/${timelineUser.id}/blocks`,
			options: {
				method: "DELETE"
			}
		});

		if (error) {
			return error.code === 401 ? showModal(401) : showError(error);
		}

		if (data && data.success) {
			setBlocked(false);
		}
	};

	const follow = async () => {
		const { data, error } = await fetchAction({
			path: `follows/${timelineUser.id}`,
			options: {
				method: "POST"
			}
		});

		if (error) {
			return error.code === 401 ? showModal(401) : showError(error);
		}

		if (data && data.success) {
			setFollowing(!following);
		}
	};

	const unfollow = async () => {
		const { data, error } = await fetchAction({
			path: `follows/${timelineUser.id}`,
			options: {
				method: "DELETE"
			}
		});

		if (error) {
			return error.code === 401 ? showModal(401) : showError(error);
		}

		if (data && data.success) {
			setFollowing(!following);
		}
	};

	return (
		<div className="toolbar">
			<div className="container">
				<div>
					<Dropdown>
						<li>Edit</li>
						<li>Report</li>
						<li>
							{blocked ? (
								<Button title="Unblock" onClick={unblockUser} />
							) : (
								<Button title="Block" onClick={blockUser} />
							)}
						</li>
						{invite?.status === "accepted" && (
							<li onClick={undoFriend}>Desfazer amizade</li>
						)}
					</Dropdown>
				</div>
				<div className="toolbar-actions">
					{!sameUser && (
						<div>
							<Button
								className="btn-outlined"
								title={following ? "Seguindo" : "Seguir"}
								onClick={following ? unfollow : follow}
							/>
						</div>
					)}
					{!sameUser &&
						(invite ? (
							invite.status === "pending" &&
							(invite.adding_user_id === timelineUser.id ? (
								<div>
									<Button title="accept" onClick={acceptInvite} />
									<Button title="reject" onClick={cancelInvite} />
								</div>
							) : (
								<div>
									<Button title="Cancel Invite" onClick={cancelInvite} />
								</div>
							))
						) : (
							<div>
								<Button title="Send Invite" onClick={inviteFriend} />
							</div>
						))}
				</div>
			</div>
		</div>
	);
};
