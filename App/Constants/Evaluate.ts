export const evaluateOption = {
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
        },
        style: {
            q: 'Phong cách chung',
            a: ['Vui tươi, trẻ trung, năng động', 'Sâu sắc, deep, tâm trạng', 'Nổi loạn', 'Trường thành, nghiêm túc'],
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
