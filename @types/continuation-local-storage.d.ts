declare module 'continuation-local-storage' {

	interface Namespace {

		createContext(): Object;

		enter(context: Object): void;
		exit(context: Object): void;

		get(key: string | symbol): any;
		set(key: string | symbol, value: any): void;

	}

	function createNamespace(name: string | symbol): Namespace;
	function getNamespace(name: string | symbol): Namespace;

}
