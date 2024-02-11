import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import ReactTimeAgo from 'react-time-ago'
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en.json'
import inLocale from 'javascript-time-ago/locale/en-IN.json' // Import Indian locale

TimeAgo.addDefaultLocale(en)
TimeAgo.addLocale(inLocale) // Add Indian locale

const PostAuthor = ({ authorID, createdAt }) => {
  const [author, setAuthor] = useState({})

  useEffect(() => {
    const getAuthor = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/users/${authorID}`)
        setAuthor(response?.data);
      } catch (error) {
        console.log(error)
      }
    }
    getAuthor();
  }, [])

  return (
    <Link to={`/posts/users/${authorID}`} className='post__author'>
      <div className="post__author-avatar">
        <img src={`${process.env.REACT_APP_ASSETS_URL}/uploads/${author?.avatar}`} alt="" />
      </div>
      <div className="post__author-details">
        <h5>By: {author?.name}</h5>
        {/* Use ReactTimeAgo with locale set to 'en-IN' */}
        <small><ReactTimeAgo date={new Date(createdAt)} locale={'en-IN'}/></small>
      </div>
    </Link>
  )
}

export default PostAuthor
