import React, { useState, useEffect } from 'react'
import PostItem from '../components/PostItem'
import Loader from '../components/Loader';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function AuthorPosts() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsloading] = useState(false)

  const {id} = useParams()

  useEffect(() => {
    const fetchPosts = async () => {
      setIsloading(true);
      try {
        const responce = await axios.get(`${process.env.REACT_APP_BASE_URL}/posts/users/${id}`)
        setPosts(responce?.data)
      } catch (err) {
        console.log(err)
      }

      setIsloading(false)
    }
    fetchPosts()
  }, [id])

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

export default AuthorPosts