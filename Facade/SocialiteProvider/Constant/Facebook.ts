export const FacebookInfo = {
    path: 'https://www.facebook.com',
    v: 'v3.0',
    client_id: process.env.FB_CLIENT_ID || '192972934678165',
    client_secret: process.env.FB_CLIENT_SECRET || '9690a5dd165b681d876111d19c663d49',
    path_callback: process.env.FB_CALLBACK || 'https://test.viralworks.com/social/callback/facebook',
    scopes: {
        allow: ['email', 'user_gender', 'user_link', 'manage_pages']
    },
    fields: ['id', 'name', 'email', 'link', 'gender'],
    path_graph: 'https://graph.facebook.com'
};

export enum AuthType {
    Request = 'rerequest'
}

export enum ResponseType {
    Code = 'code'
}

export interface IUserEngagement {
    posts: number;
    shares: number;
    comments: number;
    reactions: number;
    likes: number;
}

export interface IFacebookInfoUser {
    entity_id: string;
    gender: string;
    location: string;
    follower: number;
    pages: Array<object>;
    engagement: IUserEngagement;
}

export interface IPostEngagement {
    reaction: number;
    like: number;
    share: number;
    comment: number;
}