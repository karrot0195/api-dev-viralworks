import { DataType } from 'System/Enum';
import { JobType, JobSocial } from 'App/Models/JobModel';
import * as RE from 'System/RegularExpression';

const GroupItem = {
    price: {
        type: DataType.Number,
        required: true
    },
    kols: {
        type: DataType.Array,
        items: {
            type: DataType.String,
            required: true
        }
    }
};

const TimeItem = {
    limit: {
        type: DataType.Number,
        required: true,
        minimum: 0
    },
    time: {
        type: DataType.Number,
        description: 'Unix time: 1554785846',
        required: true
    }
};

const QuestionItem = {
    question: {
        type: DataType.String,
        required: true
    },
    answer1: {
        type: DataType.String,
        required: true
    },
    answer2: {
        type: DataType.String,
        required: true
    },
    answer3: {
        type: DataType.String,
        required: true
    },
    choose: {
        type: DataType.Number,
        enum: [1, 2, 3],
        required: true
    }
};

const CJobValidator = {
    title: {
        type: DataType.String,
        required: true
    },
    cover_image: {
        type: DataType.String
    },
    description: {
        type: DataType.String,
        required: true
    },
    assign_brand: {
        type: DataType.String,
        patern: RE.checkMongoId.source
    },
    type: {
        type: DataType.Number,
        enum: [JobType.Photo, JobType.Livestream, JobType.Video, JobType.Sharelink],
        description: '1: photo, 2: livestream, 3: videos, 4: sharelink',
        required: true
    },
    sharelink: {
        type: DataType.String
    },
    hashtags: {
        type: DataType.Array,
        items: {
            type: DataType.String
        },
        required: true
    },
    social: {
        type: DataType.Number,
        enum: [JobSocial.Facebook, JobSocial.Instagram],
        description: '1: facebook, 2: instagram',
        default: 1
    },
    special_requirement: {
        type: DataType.String
    },
    thing_avoid: {
        type: DataType.String
    },
    content_requirement: {
        type: DataType.String
    },
    questions: {
        type: DataType.Array,
        items: {
            type: DataType.Object,
            properties: QuestionItem
        },
        required: true
    },
    time: {
        type: DataType.Array,
        items: {
            type: DataType.Object,
            properties: TimeItem
        },
        required: true
    },
    groups: {
        type: DataType.Array,
        items: {
            type: DataType.Object,
            properties: GroupItem
        }
    },
    sample_post: {
        type: DataType.String
    },
    kpi: {
        type: DataType.Object,
        properties: {
            post: {
                type: DataType.Number
            },
            buzz: {
              type: DataType.Number
            },
            engagement: {
                type: DataType.Number
            }
        }
    },
    groups_reference: {
        type: DataType.String
    }
};

const UJobValidator = {
    title: {
        type: DataType.String
    },
    description: {
        type: DataType.String
    },
    assign_brand: {
        type: DataType.String,
        pattern: RE.checkMongoId.source
    },
    type: {
        type: DataType.Number,
        enum: [JobType.Photo, JobType.Livestream, JobType.Video, JobType.Sharelink],
        description: '1: photo, 2: livestream, 3: videos, 4: sharelink'
    },
    sharelink: {
        type: DataType.String
    },
    hashtags: {
        type: DataType.Array,
        items: {
            type: DataType.String
        }
    },
    social: {
        type: DataType.Number,
        enum: [JobSocial.Facebook, JobSocial.Instagram],
        description: '1: facebook, 2: instagram',
        default: 1
    },
    special_requirement: {
        type: DataType.String
    },
    thing_avoid: {
        type: DataType.String
    },
    content_requirement: {
        type: DataType.String
    },
    questions: {
        type: DataType.Array,
        items: {
            type: DataType.Object,
            properties: QuestionItem
        }
    },
    time: {
        type: DataType.Array,
        items: {
            type: DataType.Object,
            properties: TimeItem
        }
    },
    groups: {
        type: DataType.Array,
        items: {
            type: DataType.Object,
            properties: GroupItem
        }
    },
    sample_post: {
        type: DataType.String
    },
    cover_image: {
        type: DataType.String
    },
    kpi: {
        type: DataType.Object,
        properties: {
            post: {
                type: DataType.Number
            },
            buzz: {
                type: DataType.Number
            },
            engagement: {
                type: DataType.Number
            }
        }
    },
    groups_reference: {
        type: DataType.String
    }
};

export { CJobValidator, UJobValidator };
