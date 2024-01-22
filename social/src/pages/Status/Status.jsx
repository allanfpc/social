import { useState, useRef, useEffect } from "react";
import { useLoaderData } from "react-router-dom";


import Post from "../../components/Post";
import Comment from "../../components/Post/Comment";

import { useQuery } from "../../components/api/api";
import { useAuthContext } from "../../contexts/AuthContext";

export const Component = () => {
    const post = useLoaderData();   
    const postRef = useRef(null);
	const {
		data: { rows: comments, total_comments },
		loading
	} = useQuery({
		path: `posts/${post[0].post_id}/comments?page=${commentsPage}`
	});

    useEffect(() => {
        window.scrollTo({ top: 0 });
    
        return () => {
            
        }
    }, [])    

    const { data: comments, loading } = useQuery({
        path: `posts/${post.post_id}/comments`,
    });

	return (
		<>
			<div className="column">
				<section className="status">
					<div className="posts-wrapper">
						<Post ref={postRef} post={post[0]} actions />
					</div>
				</section>
				<section className="comments">
					<div className="flex-center">
						<div className="comments-wrapper">
							{loading ? (
								<Loading />
							) : comments.length === 0 ? (
								<div className="container">
									<span>No comments to show</span>
								</div>
                    </div>
                </div>
            </section>
        </div>
    )
}