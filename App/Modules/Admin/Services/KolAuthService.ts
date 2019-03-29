import * as Security from 'App/Helpers/Security';
import * as _ from 'lodash';
import { Injectable } from 'System/Injectable';
import { Mongo } from 'System/Mongo';
import { Config } from 'System/Config';
import { IKolUser, KolUserModel, IKolBasicInfo, IKolFacebookInfo, IKolEvalute, HistoryActionType } from 'App/Models/KolUserModel';
import * as mongoose from 'mongoose';
import { InternalError, SystemError } from 'System/Error';

@Injectable
export class KolAuthService {
    constructor(
        private readonly _config: Config,
        private readonly _mongo: Mongo,
        private readonly _model: KolUserModel
    ) {}

    create(data: IKolUser) {
        return this._model.create(data);
    }

    findAll(params: Object) {
        return this._model.find();
    }

    findById(id: string) {
        return this._model.findById(id);
    }

    async updateBasicInfo(kolUser: any, data: IKolBasicInfo) {
        Object.keys(data).forEach(k => {
            _.set(kolUser.kol_info, k, data[k]);
        });
        const result = await kolUser.save();
        return result.kol_info;
    }

    async updateFacebookInfo(kolUser: any, data: IKolFacebookInfo) {
        Object.keys(data).forEach(k => {
            _.set(kolUser.facebook, k, data[k]);
        });
        const result = await kolUser.save();
        return result.facebook;
    }

    getEvaluateOption(fields: Array<string>) {
        const data = {
            fb: {
                frequency: {
                    q: 'Tuần suất post bài trên Facebook?',
                    a: ['Nhiều (5-7 bài/tuần)', 'Bình thường (3-4 bài/tuần)', 'Ít (<3 bài/tuần)'],
                },
                content: {
                    q: 'Nội dung chính',
                    a: [
                        'Chia sẻ, hướng dẫn kinh nghiệm của bản thân',
                        'Cảm xúc, sự kiện của bản thân',
                        'Bán hàng',
                        'Chia sẻ về công việc',
                        'Share link bài báo, video',
                        'Chia sẻ về gia đình',
                        'Quảng cáo cho các nhãn hàng ',
                    ],
                    t: 2,
                    '0': 2,
                },
                style: {
                    q: 'Phong cách chung',
                    a: [
                        'Vui tươi, trẻ trung, năng động',
                        'Sâu sắc, deep, tâm trạng',
                        'Nổi loạn',
                        'Trường thành, nghiêm túc',
                    ],
                },
            },
            text: {
                length: {
                    q: 'Độ dài của bài viết',
                    a: ['Dài (xuất hiện see more)', 'Bình Thường (4-5 dòng)', 'Ngắn (1-3 dòng)'],
                },
                interactivity: {
                    q: 'Độ tương tác, trả lời comment',
                    a: [
                        'Thường xuyên (dễ dàng tìm thấy tương tác với người comment)',
                        'Thỉnh thoảng',
                        'Rất ít trả lời comment',
                    ],
                },
                swearing_happy: { q: 'Có chửi thề vui không?', a: ['Có', 'Không'] },
            },
            image: {
                content: {
                    q: 'Nội dung',
                    a: [
                        'Chụp selfie',
                        'Chụp thời trang',
                        'HÌnh ảnh liên quan đến công việc',
                        'Chụp ảnh phong cảnh nghệ thuật ',
                        'Chụp đồ ăn nghệ thuật',
                        'Hình ảnh gia đình',
                        'Hình ảnh đời sống (ăn uống, chụp cùng bạn bè, check-in...)',
                    ],
                    t: 2,
                    '0': 2,
                },
                personal_style: {
                    q: 'Phong cách cá nhân',
                    a: [
                        'Lịch lãm trưởng thành',
                        'Trẻ trung năng động',
                        'Sexy',
                        'Cá tính, phá cách, nổi loạn',
                        'Bình thường',
                        'Có gout thời trang riêng',
                    ],
                    t: 2,
                    '0': 2,
                },
                scenery: {
                    q: 'Phong cảnh xuất hiện trong hình ảnh',
                    a: ['Thành thị ', 'Nông thôn'],
                },
                refine_content: { q: 'Độ trau chuốt về nội dung', a: ['Có', 'Không'] },
            },
            general_style: {
                appearence: {
                    q: 'Ngoại hình',
                    a: ['Dễ thương, nhí nhảnh', 'Đẹp ', 'Bình thường', 'Không đánh giá được'],
                },
                brand: {
                    q: 'Có thể đại diện cho loại thương hiệu nào',
                    a: [
                        'High fashion, high service',
                        'Hàng tiêu dùng phù hợp với lối sống nông thôn',
                        'Hàng tiêu dùng phù hợp với lối sống thành thị',
                        'Không phù hợp đại diện cho nhãn hàng',
                    ],
                },
            },
        };
        if (fields == undefined || fields.length == 0) {
            return data;
        }
        let obj = {};
        fields.forEach(key => {
            if (key) {
                obj[key] = _.get(data, key, null);
            }
        });
        return obj;
    }

    async updateEvaluateInfo(kolUser: any, data: IKolEvalute) {
        Object.keys(data).forEach(k => {
            _.set(kolUser, `kol_info.evaluate.${k}`, data[k]);
        });
        const result = await kolUser.save();
        return _.get(result.kol_info, 'evaluate');
    }

    async updateKolInfoStatus(kolUser: any, causer_id: string, status: number) {
        this.addHistoryAction(kolUser, causer_id, _.get(kolUser, 'kol_info.status'));
        this.setKolInfoStatus(kolUser, status);
        const result = await kolUser.save();
        if (!result) {
            throw new SystemError('Not save data');
        }
        return kolUser;
    }

    addHistoryAction(kolUser: any, causer_id: string, status: number) {
        const obj = {
            causer_id: causer_id,
            type: HistoryActionType.Status,
            kol_status: status
        }
        _.get(kolUser, 'kol_info.history_action', []).push(obj);
    }

    setKolInfoStatus(kolUser: any, status: number) {
        _.set(kolUser, 'kol_info.status', status);
    }
}
