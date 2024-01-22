
import { useContext, useEffect, useRef, useState } from "react";
import { useLoaderData } from "react-router-dom";
import './timeline.css';

import Layout from "../../layouts/Layout";
import User from "../../components/User";
import Post from "../../components/Post";
import Button from "../../components/Button";

import { useAuthContext } from "../../contexts/AuthContext"
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
  
  const [cover, setCover] = useState(timelineUser.cover);
  const [profileImg, setProfileImg] = useState(timelineUser.profile_img)

  const picInputRef = useRef(null);
  const coverInputRef = useRef(null);
  
  const sameUser = (user && (user.id === timelineUser.id));


	const imageModal = (props) => {
		showModal("IMAGE_MODAL", {
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

	const [id, ext] = cover.split(".");

	return (
		<section className="profile">
			<div className="profile-container">
				<div>
					<div
						className="profile__cover"
						onClick={() =>
							imageModal({
								image: `/uploads/cover/${id + "-680" + "." + ext}`,
								type: "cover"
							})
						}
					>
						<div
							className="cover"
							style={{
								backgroundImage: `url('/uploads/cover/${
									id + "-cropped." + ext
								}')`
							}}
						/>

const Toolbar = ({user, timelineUser}) => {

  const {showError} = useErrorContext();
  const [invite,setInvite] = useState(null);

  const sameUser = (user.id === timelineUser.id);  

  useEffect(() => {
    const fetchInvite = async () => {

      const response = await fetchAction({
        path: `friends/${timelineUser.id}/invites`,
      });

      console.log(response)
      if(response.error && response.code) {
        return showError(response.code);
      }
      
      const data = response.data;

      if(data) {
        setInvite(data);
      }      
    };

    fetchInvite();
  }, []);

  const inviteFriend = async () => {
    const response = await fetchAction({
      path: `friends/${timelineUser.id}/invites`,
      options: {
        method: 'POST',
        body: JSON.stringify(timelineUser)
      }
    });

    if(response.error && response.code) {
      return showError(response.code);
    }
    
    const data = response.data;

    if(data.success) {
      setInvite({status: 'pending'});
    }
       
  }

  const updateInvite = async (status) => {    
      const response = await fetchAction({
        path: `friends/${timelineUser.id}/invites/${invite.id}`,
        options: {
          method: 'PUT',
          body: JSON.stringify({status: status, user: timelineUser})
        }
      });

      if(response.error && response.code) {
        return showError(response.code);
      }
      
      const data = response.data;
  
      if(data && data.success) {
        setInvite(status);
      }
  }

  const cancelInvite = async () => { 
      
    const response = await fetchAction({
      path: `friends/${timelineUser.id}/invites/${invite.id}`,
      options: {
        method: 'DELETE',
        body: JSON.stringify(timelineUser)
      }
    });

    if(response.error && response.code) {
      return showError(response.code);
    }
    
    const data = response.data;

    if(data && data.success) {
      setInvite(null);
    }
    
  }

  return (
    <div className="toolbar">
      {!sameUser && (
        invite ? (
          invite.status === 'pending' && (
            invite.action_user_id === timelineUser.id ? (
              <div>
                <Button title="accept" onClick={() => updateInvite('accepted')} />
                <Button title="reject" onClick={() => updateInvite('rejected')} />
              </div> 
            ) : (
              <div>
                <Button title="Cancel Invite" onClick={cancelInvite} />
              </div>
            )
          )
        ) : (
          <div>
            <Button title="Send Invite" onClick={inviteFriend} />
          </div>
        )
      )}
    </div>
  )
}


export default Timeline