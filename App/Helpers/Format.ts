import { Request } from 'express';
import * as _ from 'lodash';

export function getAvatarUrlInfo(req: Request, avatarBaseRoute: string, avatarPath?: string) {
    let baseAvatarUrl = req.protocol + '://' + req.get('host') + req.baseUrl + avatarBaseRoute;

    return {
        baseUrl: baseAvatarUrl,
        path: avatarPath || '/avatar'
    };
}

/**
 * Get top frequency value from an array
 *
 * @param {array} arr - Array that need to get value
 * @param {number} count - Amount of top value
 *
 * @return {Object} contains top most frequency value and count of original array
 */
export function getTopFrequencyValue(arr: any[], count: number = 3, customTotal?: number) {
    let tmp = _.chain(arr)
        .countBy()
        .map((val, key) => {
            return { name: key, count: val };
        })
        .sortBy('count')
        .reverse()
        .keyBy('name')
        .mapValues('count')
        .value();

    let keys = Object.keys(tmp);
    let values: any = {};
    let total = customTotal || arr.length;
    let otherCount = total;

    for (let i = 0; i < keys.length && i < count; i++) {
        values[keys[i]] = tmp[keys[i]];
        otherCount -= tmp[keys[i]];
    }

    if (otherCount && otherCount > 0 && !customTotal) values['Others'] = otherCount;

    return { values, total };
}
