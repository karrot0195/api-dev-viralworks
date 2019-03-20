import { Injectable } from 'System/Injectable';
import { Config } from 'System/Config';

export class InfluencerService {
    constructor(readonly config: Config) {}

    public createInfluencer(data: { name: string, age: number, password: string }) {
        
    }
}