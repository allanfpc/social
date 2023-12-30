import { useState, useRef, useEffect } from "react";
import { useLoaderData } from "react-router-dom";


import Post from "../../components/Post";
import Comment from "../../components/Post/Comment";

import { useQuery } from "../../components/api/api";
import { useAuthContext } from "../../contexts/AuthContext";

export const Component = () => {
    const post = useLoaderData();   
    const postRef = useRef(null);

    useEffect(() => {
        window.scrollTo({ top: 0 });
    
        return () => {
            
        }
    }, [])    

    const { data: comments, loading } = useQuery({
        path: `posts/${post.post_id}/comments`,
    });

    return (        
        <div className="status">
            <section className="posts">
                <div className="flex-center">
                    <div className="column">
                        <div className="posts-wrapper">
                            <Post
                                ref={postRef}          
                                post={post}                              
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
    )
}