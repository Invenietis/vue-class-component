var Vue = require('vue');
const Vuex = require('vuex');
const { mapActions, mapGetters } = Vuex;
const  _ = require( 'lodash' );
import  "reflect-metadata";

export const KeyProp = "vue_prop";
export const KeyActions = "vuex_actions";
export const KeyGetters = "vuex_getters";
export const KeyData = "vuex_data";
export const KeyComputed = "vuex_computed";
export const KeyWatch = "vuex_watch";


var internalHooks = [
  'data',
  'beforeCreate',
  'created',
  'beforeMount',
  'mounted',
  'beforeDestroy',
  'destroyed',
  'beforeUpdate',
  'updated',
  'activated',
  'deactivated',
  'render'
];

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
    propertyMapping: { [actionName: string]: string }
}

export interface GettersMeta {
    getters: Array<string>;
    propertyMapping: { [actionName: string]: string }
}

function componentFactory (Component: any, options?: any) {
  if (!options) {
    options = {}
  }
  options.name = options.name || Component.name
  // prototype props.
  var proto = Component.prototype
  Object.getOwnPropertyNames(proto).forEach(function (key) {
    if (key === 'constructor') {
      return
    }
    // hooks
    if (internalHooks.indexOf(key) > -1) {
      options[key] = proto[key]
      return
    }
    var descriptor = Object.getOwnPropertyDescriptor(proto, key)
    if (typeof descriptor.value === 'function') {
      // methods
      (options.methods || (options.methods = {}))[key] = descriptor.value;

    } else if (descriptor.get || descriptor.set) {
      // computed properties
      (options.computed || (options.computed = {}))[key] = {
        get: descriptor.get,
        set: descriptor.set
      }
    }
  })

  if (!options.data) {
    const data = Reflect.getMetadata(KeyData, Component ) || {};
    options.data = () => _.cloneDeep(data);
  }

  // add props definition
  options.props = Reflect.getMetadata(KeyProp, Component ) || {};

  if (mapActions) {
      // add vuex actions
      const actionsMeta: ActionsMeta = Reflect.getMetadata(KeyActions, Component );
      if (actionsMeta) {
          const actions = mapActions(actionsMeta.actions);
          const mappedActions = Object.keys(actions).reduce( (value, key) => {
            value[actionsMeta.propertyMapping[key]] = actions[key];
            return value;
          } , {} );

          options.methods = _.assign({}, options.methods, mappedActions);
      }
  }

  if (mapGetters) {
      // add vuex getters
      const gettersMeta: GettersMeta = Reflect.getMetadata(KeyGetters, Component );
      if (gettersMeta) {
          const getters = mapGetters(gettersMeta.getters);
          const mappedGetters = Object.keys(getters).reduce( (value, key) => {
            value[gettersMeta.propertyMapping[key]] = getters[key];
            return value;
          } , {} );

          options.computed = _.assign({}, options.computed, mappedGetters);
      }
  }

  // add computed propertyy methods
  const computed = Reflect.getMetadata(KeyComputed, Component) || {};
  options.computed = _.assign({}, options.computed, computed);

  const watchers = Reflect.getMetadata(KeyWatch, Component ) || [];
  options.watch = _.assign({}, options.watch, watchers);
  
  // find super
  var superProto = Object.getPrototypeOf(Component.prototype)
  var Super = superProto instanceof Vue
    ? superProto.constructor
    : Vue
  return Super.extend(options)
}


export function Component (options) {
  if (typeof options === 'function') {
      return componentFactory(options)
  }
  return function (Component) {
      return componentFactory(Component, options)
  }
}

export function Data (value?: any): PropertyDecorator {
  return function(target: Object, propertyName: any) {
        // get a copy of the metadata to avoid conflicts due to inheritance
        let meta: DataMeta =  _.assign({}, Reflect.getMetadata(KeyData, target.constructor ));
        
        meta[propertyName] = value;
        Reflect.defineMetadata(KeyData, meta, target.constructor);
    };
}

export function Prop (options?: any): PropertyDecorator {
  return function(target: Object, propertyName: any) {
        // get a copy of the metadata to avoid conflicts due to inheritance
        let meta: PropsMeta =  _.assign({}, Reflect.getMetadata(KeyProp, target.constructor ));
        
        meta[propertyName] = options || {};
        Reflect.defineMetadata(KeyProp, meta, target.constructor);
    };
}

export function Getter (getterName?: string): PropertyDecorator {
  return function(target: Object, propertyName: string) {
       // get a copy of the metadata to avoid conflicts due to inheritance
        let meta: GettersMeta = _.assign({
          getters: [],
          propertyMapping: {}
        }, Reflect.getMetadata(KeyGetters, target.constructor ));

        getterName = getterName || propertyName;

        meta.getters.push(getterName);
        meta.propertyMapping[getterName] = propertyName;

        Reflect.defineMetadata(KeyGetters, meta, target.constructor);
    };
}

export function Action (actionName?: string): PropertyDecorator {
    return function(target: Object, propertyName: string) {
        // get a copy of the metadata to avoid conflicts due to inheritance
        let meta: ActionsMeta = _.assign({
          actions: [],
          propertyMapping: {}
        }, Reflect.getMetadata(KeyActions, target.constructor ));
        
        actionName = actionName || propertyName;

        meta.actions.push(actionName);
        meta.propertyMapping[actionName] = propertyName;

        Reflect.defineMetadata(KeyActions, meta, target.constructor);
    };
}

export function Computed(computedMethod: () => any): PropertyDecorator {
  return function(target: Object, propertyName: string) {
       // get a copy of the metadata to avoid conflicts due to inheritance
        let meta: DataMeta =  _.assign({}, Reflect.getMetadata(KeyComputed, target.constructor ));
        
        meta[propertyName] = computedMethod;
        Reflect.defineMetadata(KeyComputed, meta, target.constructor);
    };
}

export function Watch(targetProperty: string): MethodDecorator {
      return function(target: string | Object , propertyName: string, descriptor: PropertyDescriptor) {
        // get a copy of the metadata to avoid conflicts due to inheritance
        let meta: WatchMeta =  _.assign({}, Reflect.getMetadata(KeyWatch, target.constructor ));
        
        meta[targetProperty || propertyName] = descriptor.value;
        Reflect.defineMetadata(KeyWatch, meta, target.constructor);
      }
}