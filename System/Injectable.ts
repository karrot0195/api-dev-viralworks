/// <reference types="reflect-metadata" />
import * as _ from 'lodash';
import { Injector } from '@angular/core';
// const reflect = require('reflect-metadata');

export function Injectable(target: any) { }


interface Type<T> extends Function {
	new(...args: any[]): T;
}

interface Provide<T> {
	provide: Type<T>,
	useClass: Type<T>,
	deps: Type<T>[]
}

interface ComponentMetadata {
	implClasses: Type<any>[];
	providers?: Provide<any>[];
}

const COMPONENT = Symbol('component');

export function component(metadata: ComponentMetadata) {
	return function (target: any) {
		Reflect.defineMetadata(COMPONENT, metadata, target);
	};
}

export function bootstrap<T>(target: Type<T>, providers): T {
	const targetProvider: Provide<T> = { provide: target, useClass: target, deps: [] };
	const foundProviders = _.unionWith(findParamTypes(targetProvider), _.isEqual);
	const knownProviders = foundProviders.concat(targetProvider);
	const implProviders = _.flatMap(knownProviders, getImplClasses);
	const concreteProviders = _.differenceWith(knownProviders, implProviders, _.isEqual);

	(<any>global).__injector = Injector.create([
		concreteProviders, implProviders, providers
	]);

	return (<any>global).__injector.get(target);
}

function findParamTypes(target: Provide<any>): any[] {
	const value = Reflect.getMetadata('design:paramtypes', target.useClass);
	if (!value) return [];

	const ownTypes = value.map(function(provide: any) {
		target.deps.push(provide);
		return { provide, useClass: provide, deps: [] };
	});

	const subTypes = _.flatMap(ownTypes, findParamTypes);

	return ownTypes.concat(subTypes);

}

function getImplClasses<T>(target: Provide<T>) {
	const value = Reflect.getMetadata(COMPONENT, target.provide);
	if (!value) return [];

	const { implClasses, providers } = value as ComponentMetadata;

	const ownProviders: any = implClasses.map(createProvider);
	_.flatMap(ownProviders, findParamTypes);

	return ownProviders.concat(providers);

}

function createProvider<T>(child: Type<T>) {
	const parent = Object.getPrototypeOf(child);
	return { provide: parent, useClass: child, deps: [] };
}