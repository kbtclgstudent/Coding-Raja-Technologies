import React, { useEffect, useState } from 'react'

import axios from 'axios'
import PostItem from './PostItem'
import Loader from './Loader';


function Posts() {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsloading] = useState(false)

    useEffect(() => {
        const fetchPosts = async () => {
            setIsloading(true);
            try {
                const responce = await axios.get(`${process.env.REACT_APP_BASE_URL}/posts`)
                setPosts(responce?.data)
            } catch (err) {
                console.log(err)
            }

            setIsloading(false)
        }
        fetchPosts()
    }, [])

    if (isLoading) {
        return <Loader />
    }

    return (
        <section className="posts">
            {posts.length > 0 ? <div className="container posts__container">
                {
                    posts.map(({ _id: id, thumbnail, category, title, description, creator, createdAt }) => <PostItem key={id} postID={id} thumbnail={thumbnail} category={category} title={title} description={description} authorID={creator} createdAt={createdAt} />)
                }
            </div> : <h2 className='center'>No post found</h2>}
        </section>
    )
}

export default Posts