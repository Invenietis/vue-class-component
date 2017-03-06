import "reflect-metadata";
export declare const KeyProp: string;
export declare const KeyActions: string;
export declare const KeyGetters: string;
export declare const KeyData: string;
export declare const KeyComputed: string;
export declare const KeyWatch: string;
export interface PropsMeta {
    [propName: string]: any;
}
export interface DataMeta {
    [propName: string]: any;
}
export interface ComputedMeta {
    [propName: string]: any;
}
export interface WatchMeta {
    [propName: string]: (newValue: any) => void;
}
export interface ActionsMeta {
    actions: Array<string>;
    propertyMapping: {
        [actionName: string]: string;
    };
}
export interface GettersMeta {
    getters: Array<string>;
    propertyMapping: {
        [actionName: string]: string;
    };
}
export declare function Component(options: any): any;
export declare function Data(value?: any): PropertyDecorator;
export declare function Prop(options?: any): PropertyDecorator;
export declare function Getter(getterName?: string): PropertyDecorator;
export declare function Action(actionName?: string): PropertyDecorator;
export declare function Computed(computedMethod: () => any): PropertyDecorator;
export declare function Watch(targetProperty: string): MethodDecorator;
