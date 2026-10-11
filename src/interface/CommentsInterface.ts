export type Comments = Comment[];

export interface Comment {
  _id: string;
  content?: string;
  image?: string;
  commentCreator: CommentCreator;
  post: string;
  parentComment: any;
  likes: any[];
  createdAt: string;
  repliesCount: number;
}

export interface CommentCreator {
  _id: string;
  name: string;
  username: string;
  photo: string;
}
