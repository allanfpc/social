import { useState, forwardRef, lazy, Suspense, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import Actions from "./Actions"
import Album from '../Album';
import User from "../User";

import { fetchAction } from "../api/api";
import { useGlobalModalContext } from "../../contexts/ModalContext";
import { useErrorContext } from "../../contexts/ErrorContext";

const Report = lazy(() => import("./Report"));

const Post = (
	{ postsRef, post, posts, setPosts, actions, noAlbum, user },
	ref
) => {
	const navigate = useNavigate();

	const [isVisible, setIsVisible] = useState(null);
	const [showDropdown, setShowDropdown] = useState(false);
	const {
		name,
		nickname,
		user_id,
		profile_img,
		date,
		text,
		images,
		id,
		post_id,
		liked,
		total_likes,
		total_comments,
		total_shares
	} = post;

	// useEffect(() => {

  // useEffect(() => {

  //   const options = {
  //     root: null,
  //     rootMargin: "72px 0px 72px 0px",
  //     threshold: 0
  //   };

  //   const observer = new IntersectionObserver((entries) => {
  //     console.log(entries);
  //     const [entry] = entries;
  //     console.log(entry)
  //     //if(entry.isIntersecting)
  //     //setIsVisible(counter.current);
  //     if(entry.isIntersecting) {
  //       const id = entry.target.id;
  //       setIsVisible(id);
  //       observer.unobserve(entry.target);
  //     }
  //   }, options);

   
  //   if(lazy && postsRef) {    
  //     console.log(postsRef)    
  //     if (postsRef.length > 0) {
  //       for(const postRef of postsRef) {
  //         observer.observe(postRef);
  //       }
  //     };
  //   }

  //   return () => {
  //     console.log(postsRef, lazy)
  //     if(postsRef && lazy) {
  //       if (postsRef.length > 0) {
  //         for(const postRef of postsRef) {          
  //           observer.unobserve(postRef);
  //         }
  //       }
  //     }
  //   };
    
  // }, [])


  const handlePostClick = (e) => {
    const target = e.target;
    
    if(target.localName === "button" || target.localName === 'a') {
      e.stopPropagation();
    } else {
      navigate(`/post/${post.post_id}/status`);
    }
  }
  
  return (
    <div className="container">
      <article onClick={(e) => handlePostClick(e)}>
        <div className="post">
          <div className="post__header">
            <User.Avatar img={{src: profile_img, alt: name}} nickname={nickname} />
          </div>
          <div className="post__body"> 
            <User.Desc nickname={nickname} name={name} date={date} />
            <div className="column">
              {text.length > 1 && (
                <div className="flex">
                  <div className="post__text">
                    <span>{text}</span>
                  </div>
                </div>
              )}
              {(images && !noAlbum) && (
                <Album
                  maxWidth={maxWidth}
                  post={post}
                  images={images}
                  isVisible={isVisible}
                />
              )}                
            </div>                        
            {actions && (
              <Actions
                postId={post_id}
                liked={liked}
                initialTotalLikes={total_likes}
                initialTotalComments={total_comments}
                initialTotalShares={total_shares}                
              />
            )}      
          </div>
        </div>
      </article>
    </div>
  )  
}

	return (
		<div className="container">
			<article onClick={(e) => handlePostClick(e)}>
				<div ref={ref} className="post">
					<div className="post-header">
						<User.Avatar
							img={{ src: profile_img, alt: name }}
							nickname={nickname}
						/>
					</div>
					<div className="post-body">
						<div className="menu-wrapper">
							<a href={`/users/${nickname}`}>
								<User.Desc nickname={nickname} name={name} date={date} />
							</a>
							<Button
								className="btn-sm"
								onClick={() => setShowDropdown(!showDropdown)}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									height="24"
									viewBox="0 -960 960 960"
									width="24"
								>
									<path d="M249.231-420.001q-24.749 0-42.374-17.625-17.624-17.625-17.624-42.374 0-24.749 17.624-42.374 17.625-17.625 42.374-17.625 24.75 0 42.374 17.625Q309.23-504.749 309.23-480q0 24.749-17.625 42.374-17.624 17.625-42.374 17.625Zm230.769 0q-24.749 0-42.374-17.625-17.625-17.625-17.625-42.374 0-24.749 17.625-42.374 17.625-17.625 42.374-17.625 24.749 0 42.374 17.625 17.625 17.625 17.625 42.374 0 24.749-17.625 42.374-17.625 17.625-42.374 17.625Zm230.769 0q-24.75 0-42.374-17.625Q650.77-455.251 650.77-480q0-24.749 17.625-42.374 17.624-17.625 42.374-17.625 24.749 0 42.374 17.625 17.624 17.625 17.624 42.374 0 24.749-17.624 42.374-17.625 17.625-42.374 17.625Z" />
								</svg>
							</Button>
							{showDropdown && (
								<Dropdown
									postId={post_id}
									postAuthorId={user_id}
									posts={posts}
									setPosts={setPosts}
									sameUser={user?.id === user_id}
									setShowDropdown={setShowDropdown}
								/>
							)}
						</div>
						<div className="column post-body-content">
							{text && (
								<div className="message-wrapper">
									<div className="message">
										<p>{text}</p>
									</div>
								</div>
							)}
							{images && !noAlbum && (
								<Album
									maxWidth
									post={post}
									images={images}
									isVisible={isVisible}
								/>
							)}
						</div>
						{actions && (
							<Actions
								postId={post_id}
								liked={liked}
								initialTotalLikes={total_likes}
								initialTotalComments={total_comments}
								initialTotalShares={total_shares}
							/>
						)}
					</div>
				</div>
			</article>
		</div>
	);
};

const Dropdown = ({
	sameUser,
	postId,
	postAuthorId,
	posts,
	setPosts,
	setShowDropdown
}) => {
	const { showModal, hideModal } = useGlobalModalContext();
	const { showError } = useErrorContext();
	const dropdownRef = useRef(null);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setShowDropdown(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const deletePost = async () => {
		const { data, error } = await fetchAction({
			path: `posts/${postId}`,
			options: {
				method: "DELETE"
			}
		});

		if (error) {
			return error.code === 401 ? showModal(401) : showError(error);
		}

		if (data && data.success) {
			const filteredPosts = posts.filter((post) => post.post_id !== postId);
			setPosts(filteredPosts);
		}
	};

	const OpenReportModal = () => {
		const report = async () => {
			const getReport = JSON.parse(sessionStorage.getItem("report"));
			const causes = getReport.causes;
			const message = getReport.message || "";
			const regex = /[\p{L}]?.*/gimu;
			const match = regex.test(message);

			if (causes.length === 0) {
				showModal("TOAST_ERROR", {
					error: "Select at least one reason"
				});
				return false;
			}

			if (!match) {
				showModal("TOAST_ERROR", {
					error: "Provide valid characters"
				});
				return false;
			}

			const { error } = await fetchAction({
				path: `posts/${postId}/report`,
				options: {
					method: "POST",
					body: JSON.stringify({
						postAuthorId,
						postId,
						message,
						causes
					})
				}
			});

			if (error) {
				if (error.code === 401) {
					return showModal(401);
				} else {
					return showError(error);
				}
			}

			sessionStorage.removeItem("report");
			hideModal();
		};

		showModal("CREATE_MODAL", {
			elem: (
				<Suspense fallback={null}>
					<Report />
				</Suspense>
			),
			actions: <Button key="report" title="Report" onClick={report} />,
			clear: ["report"]
		});
	};

	return (
		<div
			ref={dropdownRef}
			className="menu"
			onClick={(e) => e.stopPropagation()}
		>
			<ul>
				<li>Edit</li>
				<li onClick={(e) => OpenReportModal(e)}>Report</li>
				{sameUser && (
					<li className="delete" onClick={deletePost}>
						Delete
					</li>
				)}
			</ul>
		</div>
	);
};

export default forwardRef(Post);
