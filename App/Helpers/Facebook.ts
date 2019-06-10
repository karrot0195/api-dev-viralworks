import * as _ from 'lodash';
import * as request from 'request';
const facebookToken = [
    'EAAAAAYsX7TsBAAZAwJjt6sdFDfbsJ7YlGGBdSXgWeobcWKZC9sqYpZBJGNPrs7rdRkBhuJgdqK6ZAiEpvyWQ3I3XPJ3QC4q3FEyVWDMTtkJoEB3NCmZBudBV4M1cKaFbL0DxT4bEXnQAw7JEEn3y8cnK68ZCK91N8ugDBMAyl67URLzaP7JOby',
    'EAAAAAYsX7TsBAPKMMg1Rvk71YF7z29wF8ZCTATlIduKnT2mBP9NEOVOYUkbgqKkfTDEmEPDBYUSj8UImzhDSSsvZCJn0kx3krxEgOokMQpZBfTEvNKWglcRtP0Cb6ZBqj4d0AizrnqXFxgW2wTZCS4IHh92U4yAKqsta5jeGpmk9ocl9qH3ce',
    'EAAAAAYsX7TsBAKfU9D4PykTGrwT17o8BqWRE7OD3aenKCNbxeYep8g5lxfuEC6bJQVXgMSyub6yXXaX7WKIwlczsjtUrJToxs4d5yHspPwk8QnqzxYvhZCM6IJpgpBBWKb3nLrGY8KBRnY4e3GEN3y71bxe3twRsAaZAlj3PCUzaFStTIw',
    'EAAAAAYsX7TsBACvhJwWquCIKx3xRw7qZBF1VbyHPUcvZAuIdaVUtIe9IuHQS4ZAcj9R4BXcK1XZCIaemoeHbLfVh08BsXP3XVru8wmZCSrPRg2Mya9EgfypMdl96wbC2TC4ZBlmvLTIUpSYX7Mlfh0tNQW0bFRC8XFN9MSbpADNWzZCtKG5Pws9'
];

function getEngagementUserPost(entityId: string): Promise<any> {
    return new Promise((resolve, reject) => {
        const tokenIdx = Math.floor(Math.random() * facebookToken.length);
        const apiPath = `https://graph.facebook.com/v1.0/${entityId}/posts?fields=story,type,created_time,from,id,message,picture,link,object_id,shares,comments,likes.limit(0).summary(1).as(likes),reactions.limit(0).summary(1).as(reactions)&limit=15&access_token=${
            facebookToken[tokenIdx]
        }`;

        request.get(
            apiPath,
            {
                headers: [
                    'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36',
                    'Content-Type: application/json'
                ]
            },
            (err, res, body) => {
                const feeds = JSON.parse(body)['data'];
                var totalReactions = 0,
                    totalShares = 0,
                    totalComments = 0,
                    count = 0;
                var threewMonthAgo: any = new Date(
                    new Date().getFullYear(),
                    new Date().getMonth() - 3,
                    new Date().getDate()
                );

                if (feeds)
                    feeds.forEach(feed => {
                        var date1: any = new Date(feed.created_time);
                        if (date1 - threewMonthAgo < 0) {
                            return null;
                        }
                        totalReactions += _.get(feed, 'reactions.summary.total_count', 0);
                        totalComments += _.get(feed, 'comments.count', 0);
                        totalShares += _.get(feed, 'shares.count', 0);
                        count++;
                    });

                resolve({
                    total_post: count,
                    num_share: totalShares,
                    num_comment: totalComments,
                    num_reaction: totalReactions
                });
            }
        );
    });
}

export { getEngagementUserPost };
