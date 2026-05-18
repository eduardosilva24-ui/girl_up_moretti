import { COMMENT_PAGE_SIZE } from "../utils/constants";
import { apiGet, apiPost } from "./api";
import { removeCache } from "./cacheService";

function invalidatePosts() {
  Object.keys(window.localStorage || {})
    .filter((key) => key.includes("girl-up-moretti:posts:"))
    .forEach((key) => window.localStorage.removeItem(key));
}

export function getPosts(options = {}) {
  if (options.includeDrafts || options.idToken) {
    return apiPost(
      "getPosts",
      {
        idToken: options.idToken,
        includeDrafts: Boolean(options.includeDrafts),
      },
      { signal: options.signal },
    );
  }

  return apiGet("getPosts", {}, { signal: options.signal, fallback: [] });
}

export function getPost(postId, options = {}) {
  if (options.idToken) {
    return apiPost(
      "getPost",
      {
        idToken: options.idToken,
        id: postId,
      },
      { signal: options.signal },
    );
  }

  return apiGet("getPost", { id: postId }, { signal: options.signal, fallback: null });
}

export function createPost(post, idToken) {
  return apiPost("createPost", { idToken, post }).then((response) => {
    invalidatePosts();
    return response;
  });
}

export function updatePost(post, idToken) {
  return apiPost("updatePost", { idToken, post }).then((response) => {
    invalidatePosts();
    return response;
  });
}

export function deletePost(postId, idToken) {
  return apiPost("deletePost", { idToken, id: postId }).then((response) => {
    invalidatePosts();
    return response;
  });
}

export function toggleLike(postId, idToken) {
  return apiPost("toggleLike", { idToken, postId }).then((response) => {
    invalidatePosts();
    return response;
  });
}

export function getComments(postId, options = {}) {
  return apiGet(
    "getComments",
    {
      postId,
      offset: options.offset || 0,
      limit: options.limit || COMMENT_PAGE_SIZE,
    },
    {
      signal: options.signal,
      fallback: { items: [], nextOffset: null, total: 0 },
    },
  );
}

export function addComment(postId, comment, idToken) {
  return apiPost("addComment", {
    idToken,
    postId,
    comment,
  }).then((response) => {
    invalidatePosts();
    return response;
  });
}
