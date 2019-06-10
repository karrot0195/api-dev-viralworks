import { Injectable } from 'System/Injectable';
import { CacheBuilder } from 'Facade/CacheProvider/CacheBuilder';
import { Cache } from 'Facade/CacheProvider/Classes/Cache';
import { SocialiteBuilder } from 'Facade/SocialiteProvider/SocialiteBuilder';
import { Forbidden, InternalError } from 'System/Error';
import { FacebookPlugin } from 'Facade/SocialiteProvider/Plugin/FacebookPlugin';
import { IFacebookPageItem, IKolFacebookInfoItem } from 'App/Constants/Models/KolUser/IKolItem';
import { IUserEngagement } from 'Facade/SocialiteProvider/Constant/Facebook';
import { generateSummaryInfo, generateUserCode, showDebug } from 'App/Helpers/Generator';
import * as Security from 'System/Helpers/Security';
import { IKolUser, KolUserModel } from 'App/Models/KolUserModel';
import { Config } from 'System/Config';
import { LogError } from 'App/Helpers/LogError';

export interface IDataUserInfoCache extends IKolFacebookInfoItem {
    type: string;
    email: string;
    name: string;
}

enum TypeCache {
    FacebookAuth = 'fbauth',
    FacebookInfo = 'fbinfo'
}

@Injectable
export class SocialLiteService {
    private facebookService: FacebookPlugin;
    private cache: Cache;

    constructor(private config: Config, private socialiteBuilder: SocialiteBuilder, private cacheBuilder: CacheBuilder, private kolUserModel: KolUserModel) {
        this.init();
    }

    public getLinkAuthFacebook(session: string, callbackUrl: string) {
        this.cache.pushCache({
            key: (+new Date()).toString(),
            data: {
                session: session,
                callback_url: callbackUrl,
                type: TypeCache.FacebookAuth
            }
        });
        return this.facebookService.getLinkCodeUser();
    }

    public async getUserInfoByCode(code: string, session?: string) {
        let callBackUrl = '';
        if (session) {
            callBackUrl = this.getCallbackUrlBySessionCache(session);
        }

        const data = await this.getDataFacebookUser(code);

        const kol = await this.kolUserModel.findOne({'facebook.entity_id': data.entity_id});
        let kol_exists = false;
        if (kol) {
            kol_exists = true;
        }
        return {
            data: data,
            redirect_url: callBackUrl,
            token: data.entity_id,
            kol_exists: kol_exists
        };
    }

    // MAIN FEATURE
    public async registerKolBySocial(token: string, email: string, mobile: string, password: string) {
        const cache = this.facebookService.cache.findCacheByKey(token);
        if (cache) {
            const facebookCache = <IDataUserInfoCache>cache.data;
            const hPassword = Security.hash(this.config.security.pepper + password);
            console.log(facebookCache.analytic);

            const facebookData: IKolFacebookInfoItem = {
                entity_id: facebookCache.entity_id,
                analytic: facebookCache.analytic,
                name: facebookCache.name,
                profile_link: `https://facebook.com/${facebookCache.entity_id}`,
                app_scoped_id: facebookCache.app_scoped_id,
                app_scoped_token: facebookCache.app_scoped_token,
                pages: <Array<IFacebookPageItem>>facebookCache.pages
            };

            const data = {
                email: email,
                password: hPassword,
                code: generateUserCode('IU'),
                facebook: facebookData,
                kol_info: {
                    mobile: mobile
                }
            };
            generateSummaryInfo(data);
            const kol = await this.createKolUser(<IKolUser>data);
            if (kol) {
                this.facebookService.cache.removeCache(token);
                return {
                    token: kol._id
                };
            }
            throw new InternalError('ERROR_CREATE_KOL');
        }
        throw new Forbidden('TOKEN_NOT_EXISTS');
    }

    private buildCache(): Cache {
        return <Cache>this.cacheBuilder.build('cache');
    }

    private calAvgPost(
        engagement: IUserEngagement
    ): { avgComment: number; avgShare: number; avgReaction: number; avgEngagement: number } {
        var avgComment: number = 0, avgShare: number = 0, avgReaction: number = 0, avgEngagement: number = 0;

        if (engagement.posts) {
            avgComment = Math.round(engagement.comments / engagement.posts);
            avgShare = Math.round(engagement.comments / engagement.posts);
            avgReaction = Math.round(engagement.reactions / engagement.posts);
            avgEngagement = avgComment + avgShare + avgReaction;
        }
        return {
            avgComment: avgComment,
            avgShare: avgShare,
            avgReaction: avgReaction,
            avgEngagement: avgEngagement
        };
    }

    private getCacheDataBySession(session: string) {
        const arr = this.cache.findCachesByBody({ session: session, type: TypeCache.FacebookAuth });
        if (arr.length > 0) {
            this.cache.removeCache(arr[0].key);
            return arr[0];
        }
        return null;
    }

    private getCallbackUrlBySessionCache(session: string) {
        const cache = this.getCacheDataBySession(session);
        if (!cache) throw new Forbidden('USER_AGENT_NOT_FOUND');
        return cache['data']['callback_url'];
    }

    private async getDataFacebookUser(code): Promise<IDataUserInfoCache> {
        const authUser = await this.getAuthInfoByCode(code);
        const infoUser = await this.facebookService.getUserInfo(authUser['id']);
        const { avgComment, avgEngagement, avgReaction, avgShare } = this.calAvgPost(infoUser.engagement);
        const data = <IDataUserInfoCache>{
            app_scoped_id: authUser['id'],
            entity_id: infoUser.entity_id,
            name: authUser['name'],
            email: authUser['email'],
            app_scoped_token: authUser['access_token'],
            type: TypeCache.FacebookInfo,
            pages: infoUser.pages,
            analytic: {
                total_follower: infoUser.follower,
                avg_comment_last_3_month: avgComment,
                avg_engagement_last_3_month: avgEngagement,
                avg_reaction_last_3_month: avgReaction,
                avg_sharing_last_3_month: avgShare
            },
            profile_link: `https://facebook.com/${infoUser.entity_id}`
        };

        this.facebookService.cache.pushCache({
            key: infoUser.entity_id,
            data: data
        });
        return data;
    }

    private buildFacebookService(): FacebookPlugin {
        return <FacebookPlugin>this.socialiteBuilder.build('facebook');
    }

    private async getAccessTokenByCode(code: string) {
        console.log(`code ${code}`);
        const accessToken = await this.facebookService.getAccessTokenByCode(code);
        if (!accessToken) throw new Forbidden('CODE_NOT_ALLOW');
        return accessToken;
    }

    private async getAuthInfoByCode(code: string) {
        const accessToken: string = await this.getAccessTokenByCode(code);
        showDebug(`accessToken: ${accessToken}`);
        const authUser = await this.facebookService.getAuthUser(accessToken);
        if (!authUser['id']) throw new Forbidden('ACCESS_TOKEN_NOT_ALLOW');
        authUser['access_token'] = accessToken;
        return authUser;
    }

    private async createKolUser(data: IKolUser) {
        return this.kolUserModel.create(data);
    }

    private init() {
        this.facebookService = this.buildFacebookService();
        this.cache = this.buildCache();
    }
}
