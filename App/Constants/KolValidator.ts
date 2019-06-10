import { DataType } from 'System/Enum';
import * as RE from 'System/RegularExpression';

const PaginationValidator = {
    follower_range: {
        type: DataType.String,
        description: 'Example: 10_20 (range [10, 20] )',
        pattern: RE.checkRangeSource.source
    },
    avg_range: {
        type: DataType.String,
        description: 'Example: 10_20 (range [10, 20] )',
        pattern: RE.checkRangeSource.source
    },
    num_child: {
        type: DataType.String,
        enum: ['0', '1', '2', '3', '-1']
    },
    dob_range: {
        type: DataType.String,
        description: 'Example: 10_20 (range [10, 20] )',
        pattern: RE.checkRangeSource.source
    },
    sex: {
        type: DataType.String,
        description: 'Choose with male: 0, female: 1, other: -1',
        enum: ['0', '1', '-1']
    },
    matrimony: {
        type: DataType.String,
        description: 'Choose with single: 0, married: 1, other: -1',
        enum: ['0', '1', '-1']
    },
    kol_info_status: {
        type: DataType.String,
        description: 'Choose with 0: raw or 1: verified or 2: rejected',
        enum: ['0', '1', '2']
    },
    job: {
        type: DataType.String,
        pattern: RE.checkMongoIds.source,
        description: 'Example: obid1,obid2,obid3'
    },
    share_story: {
        type: DataType.String,
        pattern: RE.checkMongoIds.source,
        description: 'Example: obid1,obid2,obid3'
    },
    price_type: {
        type: DataType.String,
        enum: ['1', '2', '3', '4']
    },
    price_range: {
        type: DataType.String,
        description: 'Example: 10_20 (range [10, 20] )',
        pattern: RE.checkRangeSource.source
    },
    rate_range: {
        type: DataType.String,
        description: 'Example: 2_3 (range [2, 3] )',
        pattern: RE.checkRangeSource.source
    },
    post_frequency: {
        type: DataType.String,
        description: 'Example: 1,2'
    },
    post_content: {
        type: DataType.String,
        description: 'Example: 1,2'
    },
    post_style: {
        type: DataType.String,
        description: 'Example: 1,2'
    },
    post_length: {
        type: DataType.String,
        description: 'Example: 1,2'
    },
    post_interactivity: {
        type: DataType.String,
        description: 'Example: 1,2'
    },
    post_swearing: {
        type: DataType.String,
        description: 'Example: 1,2'
    },
    image_content: {
        type: DataType.String,
        description: 'Example: 1,2'
    },
    image_scenery: {
        type: DataType.String,
        description: 'Example: 1,2'
    },
    personal_style: {
        type: DataType.String,
        description: 'Example: 1,2'
    },
    refine_content: {
        type: DataType.String,
        description: 'Ex: 1,2'
    },
    influencer_look: {
        type: DataType.String,
        description: 'Example: 1,2'
    },
    brand: {
        type: DataType.String,
        description: 'Example: 1,2'
    },
    field_sort: {
        type: DataType.String,
        description: 'Example: name|asc,code|desc'
    },
    field: {
        type: DataType.String,
        description: 'Example: name,code,summary'
    },

    // default
    page: {
        type: DataType.String,
        description: 'Page number of result',
        pattern: RE.checkNumberString.source,
        default: 0
    },
    limit: {
        type: DataType.String,
        description: 'Limit per page',
        pattern: RE.checkNumberString.source,
        default: 0
    },
    term: {
        type: DataType.String,
        description: 'Term that will be searched on all fields',
        pattern: RE.checkString.source
    },
    value: {
        type: DataType.String,
        description: 'List of exact match value. (example: roles|user,route.path|/test )',
        pattern: RE.checkValueArrayString.source
    },
    exclude_ids: {
        type: DataType.String,
        description: 'Kol users were excluded. (example: 5cab14c05b7e046d19c88686,5cab14c15b7e046d19c88688)'
    },
    location: {
        type: DataType.String,
        description: 'example ho chi minh'
    }
};

const UInfoBaseValidator = {
    mobile: {
        type: DataType.String
    },
    sex: {
        type: DataType.Number,
        enum: [-1, 0, 1]
    },
    dob: {
        type: DataType.Number
    },
    matrimony: {
        type: DataType.Number,
        enum: [-1, 0, 1]
    },
    num_child: {
        type: DataType.Number,
        enum: [0, 1, 2, 3, -1]
    },
    job: {
        type: DataType.Array,
        uniqueItems: true,
        items: {
            type: DataType.String,
            pattern: RE.checkMongoIds.source
        }
    },
    job_other: {
        type: DataType.Array,
        uniqueItems: true,
        items: {
            type: DataType.String
        }
    },
    share_story: {
        type: DataType.Array,
        uniqueItems: true,
        items: {
            type: DataType.String,
            pattern: RE.checkMongoIds.source
        }
    },
    share_story_other: {
        type: DataType.Array,
        uniqueItems: true,
        items: {
            type: DataType.String
        }
    },
    price: {
        type: DataType.Object,
        properties: {
            photo: {
                type: DataType.Number
            },
            livestream: {
                type: DataType.Number
            },
            have_video: {
                type: DataType.Number
            },
            share_link: {
                type: DataType.Number
            }
        }
    }
};

const UFacebookValidator = {
    entity_id: {
        type: DataType.String
    },
    name: {
        type: DataType.String
    },
    profile_link: {
        type: DataType.String
    },
    app_scoped_id: {
        type: DataType.String
    },
    app_scoped_token: {
        type: DataType.String
    },
    page: {
        type: DataType.Array,
        items: {
            type: DataType.Object,
            properties: {
                access_token: {
                    type: DataType.String
                },
                category: {
                    type: DataType.String
                },
                name: {
                    type: DataType.String
                },
                id: {
                    type: DataType.String
                }
            }
        }
    },
    analytic: {
        type: DataType.Object,
        properties: {
            total_follower: {
                type: DataType.Number
            },
            total_post_last_3_month: {
                type: DataType.Number
            },
            avg_reaction_last_3_month: {
                type: DataType.Number
            },
            avg_comment_last_3_month: {
                type: DataType.Number
            },
            avg_sharing_last_3_month: {
                type: DataType.Number
            },
            avg_engagement_last_3_month: {
                type: DataType.Number
            }
        }
    }
};

const UKolEvaluteValidator = {
    fb: {
        type: DataType.Object,
        properties: {
            frequency: {
                type: DataType.Number
            },
            style: {
                type: DataType.Number
            },
            content: {
                type: DataType.Array,
                items: {
                    type: DataType.Number
                }
            }
        }
    },
    text: {
        type: DataType.Object,
        properties: {
            length: {
                type: DataType.Number
            },
            interactivity: {
                type: DataType.Number
            },
            swearing_happy: {
                type: DataType.Number
            }
        }
    },
    image: {
        type: DataType.Object,
        properties: {
            content: {
                type: DataType.Array,
                items: {
                    type: DataType.Number
                }
            },
            personal_style: {
                type: DataType.Array,
                items: {
                    type: DataType.Number
                }
            },
            scenery: {
                type: DataType.Number
            },
            refine_content: {
                type: DataType.Number
            }
        }
    },
    general_style: {
        type: DataType.Object,
        properties: {
            appearence: {
                type: DataType.Number
            },
            brand: {
                type: DataType.Number
            }
        }
    },
    province: {
        type: DataType.String
    },
    country: {
        type: DataType.String
    }
};

export { PaginationValidator, UInfoBaseValidator, UFacebookValidator, UKolEvaluteValidator };
