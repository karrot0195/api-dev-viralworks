import * as request from 'request';
import * as _ from 'lodash';
import { IPostEngagement, IUserEngagement } from 'Facade/SocialiteProvider/Constant/Facebook';
import { showDebug } from 'App/Helpers/Generator';

const ACCESS_TOKEN = [
    'EAAAAAYsX7TsBAAZAwJjt6sdFDfbsJ7YlGGBdSXgWeobcWKZC9sqYpZBJGNPrs7rdRkBhuJgdqK6ZAiEpvyWQ3I3XPJ3QC4q3FEyVWDMTtkJoEB3NCmZBudBV4M1cKaFbL0DxT4bEXnQAw7JEEn3y8cnK68ZCK91N8ugDBMAyl67URLzaP7JOby',
    'EAAAAAYsX7TsBAPKMMg1Rvk71YF7z29wF8ZCTATlIduKnT2mBP9NEOVOYUkbgqKkfTDEmEPDBYUSj8UImzhDSSsvZCJn0kx3krxEgOokMQpZBfTEvNKWglcRtP0Cb6ZBqj4d0AizrnqXFxgW2wTZCS4IHh92U4yAKqsta5jeGpmk9ocl9qH3ce',
    // 'EAAAAAYsX7TsBAKfU9D4PykTGrwT17o8BqWRE7OD3aenKCNbxeYep8g5lxfuEC6bJQVXgMSyub6yXXaX7WKIwlczsjtUrJToxs4d5yHspPwk8QnqzxYvhZCM6IJpgpBBWKb3nLrGY8KBRnY4e3GEN3y71bxe3twRsAaZAlj3PCUzaFStTIw',
    'EAAAAAYsX7TsBACvhJwWquCIKx3xRw7qZBF1VbyHPUcvZAuIdaVUtIe9IuHQS4ZAcj9R4BXcK1XZCIaemoeHbLfVh08BsXP3XVru8wmZCSrPRg2Mya9EgfypMdl96wbC2TC4ZBlmvLTIUpSYX7Mlfh0tNQW0bFRC8XFN9MSbpADNWzZCtKG5Pws9'
];

const API_INFO = {
    graphUrl: 'https://graph.facebook.com'
};

export function getAccessToken() {
    const token = ACCESS_TOKEN[Math.floor(Math.random() * ACCESS_TOKEN.length)];
    showDebug(token);
    return token;
}

export function getUserInfoById(fbId: string): Promise<object> {
    return new Promise(resFunc => {
        const path = `${API_INFO.graphUrl}/${fbId}?access_token=${getAccessToken()}`;
        request.get(path, (err, res, body) => {
            const data = JSON.parse(body);
            resFunc(data);
        });
    });
}

export function getUserFollower(fbId: string): Promise<object> {
    return new Promise(resFunc => {
        const path = `${API_INFO.graphUrl}/${fbId}/subscribers?access_token=${getAccessToken()}`;
        request.get(path, (err, res, body) => {
            const data = JSON.parse(body);
            resFunc(data);
        });
    });
}

export function getUserPages(fbId: string): Promise<Array<object>> {
    return new Promise<Array<object>>(resFunc => {
        const path = `${API_INFO.graphUrl}/${
            fbId
        }/accounts?field=id,name,category,category_list,perms&access_token=${getAccessToken()}`;
        request.get(path, (err, res, body) => {
            const data = JSON.parse(body);
            resFunc(data['data']);
        });
    });
}

export function getUserEngagement(fbId: string): Promise<IUserEngagement> {
    return new Promise<IUserEngagement>(async res => {
        const path = `${API_INFO.graphUrl}/v1.0/${
            fbId
        }/posts?fields=story,type,created_time,from,id,message,picture,link,object_id,shares,comments,likes.limit(0).summary(1).as(likes),reactions.limit(0).summary(1).as(reactions)&limit=15&access_token=${getAccessToken()}`;

        const result: IUserEngagement = {
            comments: 0,
            posts: 0,
            reactions: 0,
            shares: 0,
            likes: 0
        };

        const maxPost = 30;

        const maxTime = +new Date(new Date().getFullYear(), new Date().getMonth() - 3, new Date().getDate());

        const checkCondition = (p: object) => {
            if (result.posts >= maxPost) {
                return false;
            }

            const timePost = +new Date(p['created_time']);
            if (timePost < maxTime) {
                return false;
            }

            return true;
        };

        const takeEnagegement = async apiFacebook => {
            const curlApi = async () => {
                return new Promise(resFunc => {
                    request.get(path, (err, res, body) => {
                        const data = JSON.parse(body);
                        resFunc(data);
                    });
                });
            };
            const resp = await curlApi();
            const posts = resp['data'] || [];

            for (const p of posts) {
                if (!checkCondition(p)) {
                    return result;
                }
                // console.log(p);
                result.comments += _.get(p, 'comments.count', 0);
                result.posts++;
                result.shares += _.get(p, 'shares.count', 0);
                result.reactions += _.get(p, 'reactions.summary.total_count', 0);
                result.likes += _.get(p, 'likes.summary.total_count', 0);
            }
            if (resp['paging'] && resp['paging']['next']) {
                await takeEnagegement(resp['paging']['next']);
            }
        };

        await takeEnagegement(path);
        res(result);
    });
}

export function takeEnityIdByLink(link: string) {
    if (link) {
        const RegularExpression = [
            'profile.php\\?id=([0-9]*)',
            'facebook.com/([a-zA-Z.0-9]*)|facebook.com/([a-zA-Z.0-9]*)/'
        ];
        for (const re of RegularExpression) {
            const match = link.match(new RegExp(re));
            if (match) {
                return match[1];
            }
        }
    }
    return null;
}

export function takePostIdByLinkPost(link: string): string {
    const RegularExpression = [
        '/posts/([0-9]*)',
        'facebook.com/([0-9]*)_([0-9]*)',
        'fbid=([0-9]*)',
        'story_fbid=([0-9]*)'
    ];
    for (const re of RegularExpression) {
        const match = link.match(new RegExp(re));
        if (match) {
            return match[1];
        }
    }
    return '';
}


export function getInfoPost(postId: string): Promise<IPostEngagement> {
    return new Promise<IPostEngagement>(resPromise => {
        const path = `${API_INFO.graphUrl}/${
            postId
        }?fields=reactions.summary(true),comments.summary(true),shares,likes&access_token=${getAccessToken()}`;
        request.get(path, (err, res, body) => {
            const data = JSON.parse(body);
            const resData = {
                reaction: _.get(data, 'reactions.summary.total_count', 0),
                like: _.get(data, 'likes.count', 0),
                share: _.get(data, 'shares.count', 0),
                comment: _.get(data, 'comments.count', 0)
            };
            resPromise(<IPostEngagement>resData);
        });
    });
}


export function get15Post(fbId: string, select: Array<string>): Promise<object> {
    return new Promise(resPromise => {
        const fieldDefault: Array<string> = [
            "story", "type", "created_time", "from", "id", "message", "picture", "link", "object_id", "shares", "comments", "likes.limit(0).summary(1).as(likes)", "reactions.limit(0).summary(1).as(reactions)"
        ];

        if (!select.length) {
            select = fieldDefault;
        }

        const path = `${API_INFO.graphUrl}/v1.0/${
            fbId
            }/posts?fields=${select}&limit=15&access_token=${getAccessToken()}`;
        console.log(path);
        request.get(path, (err, res, body) => {
            const data = JSON.parse(body);
            resPromise(data);
        });
    })
}