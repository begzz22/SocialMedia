export type Posts = Post[];

export interface Post {
  _id: string;
  privacy: string;
  user: User;
  sharedPost?: SharedPost;
  likes: string[];
  createdAt: string;
  commentsCount: number;
  topComment?: TopComment2;
  sharesCount: number;
  likesCount: number;
  isShare: boolean;
  id: string;
  bookmarked: boolean;
  body?: string;
  image?: string;
}

export interface User {
  _id: string;
  name: string;
  username: string;
  photo: string;
}

export interface SharedPost {
  _id: string;
  body?: string;
  privacy: string;
  user: User2;
  sharedPost: any;
  likes: string[];
  createdAt: string;
  commentsCount: number;
  topComment?: TopComment;
  sharesCount: number;
  likesCount: number;
  isShare: boolean;
  id: string;
  image?: string;
}

export interface User2 {
  _id: string;
  name: string;
  username: string;
  photo: string;
}

export interface TopComment {
  _id: string;
  content: string;
  commentCreator: CommentCreator;
  post: string;
  parentComment: any;
  likes: any[];
  createdAt: string;
}

export interface CommentCreator {
  _id: string;
  name: string;
  username: string;
  photo: string;
}

export interface TopComment2 {
  _id: string;
  content: string;
  image?: string;
  commentCreator: CommentCreator2;
  post: string;
  parentComment: any;
  likes: string[];
  createdAt: string;
}

export interface CommentCreator2 {
  _id: string;
  name: string;
  username: string;
  photo: string;
}
