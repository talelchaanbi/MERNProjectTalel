import client from './client';

export const fetchFeed = async (params = {}) => {
  const res = await client.get('/social/posts', { params });
  return res.data;
};

export const createPost = async (content) => {
  const res = await client.post('/social/posts', { content });
  return res.data;
};

export const toggleLike = async (postId) => {
  const res = await client.post(`/social/posts/${postId}/like`);
  return res.data;
};

export const fetchComments = async (postId) => {
  const res = await client.get(`/social/posts/${postId}/comments`);
  return res.data;
};

export const addComment = async (postId, content) => {
  const res = await client.post(`/social/posts/${postId}/comments`, { content });
  return res.data;
};

export const searchUsers = async (q) => {
  const res = await client.get('/social/users', { params: { q } });
  return res.data;
};

export const toggleFollow = async (userId) => {
  const res = await client.post(`/social/follow/${userId}`);
  return res.data;
};

export const fetchFollowing = async () => {
  const res = await client.get('/social/following');
  return res.data;
};

export const fetchFollowers = async () => {
  const res = await client.get('/social/followers');
  return res.data;
};

export default {
  fetchFeed,
  createPost,
  toggleLike,
  fetchComments,
  addComment,
  searchUsers,
  toggleFollow,
  fetchFollowing,
  fetchFollowers,
};