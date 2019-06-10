import { CacheBuilder } from 'Facade/CacheProvider/CacheBuilder';
import { Cache } from 'Facade/CacheProvider/Classes/Cache';
import {
    getUserInfoById,
    getUserFollower,
    getUserPages,
    getUserEngagement,
    takeEnityIdByLink
} from '../Helper/FacebookHelper';
import * as _ from 'lodash';
import { IPlugin } from '../Interface/IPlugin';
import { FacebookInfo, ResponseType, AuthType, IFacebookInfoUser } from '../Constant/Facebook';
import * as request from 'request';
import { DebugType, showDebug } from 'App/Helpers/Generator';
import { LogError } from 'App/Helpers/LogError';

export class FacebookPlugin implements IPlugin {
    public name: string = 'facebook';
    public cache: Cache;

    constructor() {
        this.cache = this.initCache();
    }

    public getLinkCodeUser() {
        const query: object = {
            client_id: FacebookInfo.client_id,
            redirect_uri: FacebookInfo.path_callback,
            scope: FacebookInfo.scopes.allow.join(','),
            response_type: ResponseType.Code,
            auth_type: AuthType.Request,
            return_scopes: 1
        };
        const strQuery: string = Object.keys(query)
            .map(k => {
                return `${k}=${query[k]}`;
            })
            .join('&');
        return {
            error: false,
            link: `${FacebookInfo.path}/${FacebookInfo.v}/dialog/oauth?${strQuery}`
        };
    }

    public getAccessTokenByCode(code: string): Promise<string> {
        return new Promise(resFunc => {
            const url = `${FacebookInfo.path_graph}/${FacebookInfo.v}/oauth/access_token`;
            request
                .post(url, (err, res, body) => {
                    const data = JSON.parse(body);
                    if (data && data.error) {
                        LogError.addLog(['RESPONSE ACCESS TOKEN', code, body]);
                        showDebug(`[getAccessTokenByCode] Facebook error: ${data.error.message}`, DebugType.Error);
                    }

                    resFunc(data['access_token']);
                })
                .form({
                    code: code,
                    client_id: FacebookInfo.client_id,
                    client_secret: FacebookInfo.client_secret,
                    redirect_uri: FacebookInfo.path_callback
                });
        });
    }

    public getAuthUser(accessToken: string) {
        return new Promise(resFunc => {
            const url = `${FacebookInfo.path_graph}/${
                FacebookInfo.v
            }/me?access_token=${accessToken}&fields=${FacebookInfo.fields.join(',')}`;
            request.get(url, (err, res, body) => {
                const data = JSON.parse(body);
                resFunc(data);
            });
        });
    }

    public async getUserInfo(fbId: string) {
        const rawInfo = await getUserInfoById(fbId);
        var userName = rawInfo['username'];
        const link = rawInfo['link'];
        if (!userName && takeEnityIdByLink(link)) {
            userName = takeEnityIdByLink(link);
        }
        const rawInfoWithUsername = await getUserInfoById(userName);
        const rawFollower = await getUserFollower(fbId);
        const rawPages = await getUserPages(fbId);
        const engagement = await getUserEngagement(fbId);
        return <IFacebookInfoUser>{
            entity_id: _.get(rawInfoWithUsername, 'id', ''),
            gender: _.get(rawInfo, 'gender', ''),
            location: _.get(rawInfo, 'location.name', ''),
            follower: _.get(rawFollower, 'summary.total_count', ''),
            pages: rawPages,
            engagement: engagement
        };
    }

    private initCache() {
        return <Cache>CacheBuilder.getInstance().build('facebook');
    }
}
