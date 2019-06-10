interface IQuestionItem {
    readonly question: string;
    readonly answer1: string;
    readonly answer2: string;
    readonly answer3: string;
    readonly choose: number;
}

interface ITimeItem {
    readonly limit: number;
    readonly time: Date;
}

interface IGroupItem {
    readonly tag: number;
    readonly price: number;
    readonly kols: Array<string>;
    readonly static_id: number;
}

export { IQuestionItem, ITimeItem, IGroupItem };
