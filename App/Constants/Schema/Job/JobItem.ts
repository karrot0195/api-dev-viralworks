import { KolUser } from 'Database/Schema/KolUserSchema';

interface QuestionItem {
    _id?: string;
    question: string;
    answer1: string;
    answer2: string;
    answer3: string;
    choose: number;
}

interface TimeItem {
    _id?: string,
    limit: number;
    time: Date;
}

interface GroupItem {
    tag: number;
    price: number;
    kols: Array<any>;
    static_id: number;
}

export { QuestionItem, TimeItem, GroupItem };
