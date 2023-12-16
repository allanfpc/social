import { useContext, useEffect, useState } from "react"
import { useLoaderData } from "react-router-dom";

import Layout from "../../layouts/Layout"
import Post from "../../components/Post";
import Comment from "../../components/Post/Comment";

import { useQuery } from "../../components/api/api";
import { useAuthContext } from "../../contexts/AuthContext";

const Status = () => {

    const post = useLoaderData();
    const {token} = useAuthContext();
    const [loading, setLoading] = useState(null);
    const [modal, setModal] = useState(null);
        
    const [comments] = useQuery({
        path: `posts/${post.post_id}/comments`,
        options: {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                authorization: token ? `Bearer ${token}` : undefined
            },            
        },
        setLoading
    });

    return (
        <Layout modal={modal} setModal={setModal}>
            <div className="status">
                <section className="posts">
                    <div className="flex-center">
                        <div className="column">
                            <div className="posts-wrapper">
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
                            </div>
                        </div>
                    </div>
                </section>
                <section className="comments">
                    <div className="flex-center">
                        <div className="column">
                            <div className="comments-wrapper">
                            {loading ? (
                                <div className="flex-center container">
                                    <div className="loading">
                                    <span></span>
                                    </div>
                                </div>
                            ) : (!comments || comments.length === 0)
                            ?
                                (<div className="container">
                                    <span>No comments to show</span>
                                </div>)
                                :
                            comments.map((comment, i) => (
                                <Comment comment={comment} key={i} />
                            ))}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </Layout>
    )
}

export default Status