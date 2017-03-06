"use strict";
var Vue = require('vue');
var Vuex = require('vuex');
var mapActions = Vuex.mapActions, mapGetters = Vuex.mapGetters;
var _ = require('lodash');
require("reflect-metadata");
exports.KeyProp = "vue_prop";
exports.KeyActions = "vuex_actions";
exports.KeyGetters = "vuex_getters";
exports.KeyData = "vuex_data";
exports.KeyComputed = "vuex_computed";
exports.KeyWatch = "vuex_watch";
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
function componentFactory(Component, options) {
    if (!options) {
        options = {};
    }
    options.name = options.name || Component.name;
    var proto = Component.prototype;
    Object.getOwnPropertyNames(proto).forEach(function (key) {
        if (key === 'constructor') {
            return;
        }
        if (internalHooks.indexOf(key) > -1) {
            options[key] = proto[key];
            return;
        }
        var descriptor = Object.getOwnPropertyDescriptor(proto, key);
        if (typeof descriptor.value === 'function') {
            (options.methods || (options.methods = {}))[key] = descriptor.value;
        }
        else if (descriptor.get || descriptor.set) {
            (options.computed || (options.computed = {}))[key] = {
                get: descriptor.get,
                set: descriptor.set
            };
        }
    });
    if (!options.data) {
        var data_1 = Reflect.getMetadata(exports.KeyData, Component) || {};
        options.data = function () { return _.cloneDeep(data_1); };
    }
    options.props = Reflect.getMetadata(exports.KeyProp, Component) || {};
    if (mapActions) {
        var actionsMeta_1 = Reflect.getMetadata(exports.KeyActions, Component);
        if (actionsMeta_1) {
            var actions_1 = mapActions(actionsMeta_1.actions);
            var mappedActions = Object.keys(actions_1).reduce(function (value, key) {
                value[actionsMeta_1.propertyMapping[key]] = actions_1[key];
                return value;
            }, {});
            options.methods = _.assign({}, options.methods, mappedActions);
        }
    }
    if (mapGetters) {
        var gettersMeta_1 = Reflect.getMetadata(exports.KeyGetters, Component);
        if (gettersMeta_1) {
            var getters_1 = mapGetters(gettersMeta_1.getters);
            var mappedGetters = Object.keys(getters_1).reduce(function (value, key) {
                value[gettersMeta_1.propertyMapping[key]] = getters_1[key];
                return value;
            }, {});
            options.computed = _.assign({}, options.computed, mappedGetters);
        }
    }
    var computed = Reflect.getMetadata(exports.KeyComputed, Component) || {};
    options.computed = _.assign({}, options.computed, computed);
    var watchers = Reflect.getMetadata(exports.KeyWatch, Component) || [];
    options.watch = _.assign({}, options.watch, watchers);
    var superProto = Object.getPrototypeOf(Component.prototype);
    var Super = superProto instanceof Vue
        ? superProto.constructor
        : Vue;
    return Super.extend(options);
}
function Component(options) {
    if (typeof options === 'function') {
        return componentFactory(options);
    }
    return function (Component) {
        return componentFactory(Component, options);
    };
}
exports.Component = Component;
function Data(value) {
    return function (target, propertyName) {
        var meta = _.assign({}, Reflect.getMetadata(exports.KeyData, target.constructor));
        meta[propertyName] = value;
        Reflect.defineMetadata(exports.KeyData, meta, target.constructor);
    };
}
exports.Data = Data;
function Prop(options) {
    return function (target, propertyName) {
        var meta = _.assign({}, Reflect.getMetadata(exports.KeyProp, target.constructor));
        meta[propertyName] = options || {};
        Reflect.defineMetadata(exports.KeyProp, meta, target.constructor);
    };
}
exports.Prop = Prop;
function Getter(getterName) {
    return function (target, propertyName) {
        var meta = _.assign({
            getters: [],
            propertyMapping: {}
        }, Reflect.getMetadata(exports.KeyGetters, target.constructor));
        getterName = getterName || propertyName;
        meta.getters.push(getterName);
        meta.propertyMapping[getterName] = propertyName;
        Reflect.defineMetadata(exports.KeyGetters, meta, target.constructor);
    };
}
exports.Getter = Getter;
function Action(actionName) {
    return function (target, propertyName) {
        var meta = _.assign({
            actions: [],
            propertyMapping: {}
        }, Reflect.getMetadata(exports.KeyActions, target.constructor));
        actionName = actionName || propertyName;
        meta.actions.push(actionName);
        meta.propertyMapping[actionName] = propertyName;
        Reflect.defineMetadata(exports.KeyActions, meta, target.constructor);
    };
}
exports.Action = Action;
function Computed(computedMethod) {
    return function (target, propertyName) {
        var meta = _.assign({}, Reflect.getMetadata(exports.KeyComputed, target.constructor));
        meta[propertyName] = computedMethod;
        Reflect.defineMetadata(exports.KeyComputed, meta, target.constructor);
    };
}
exports.Computed = Computed;
function Watch(targetProperty) {
    return function (target, propertyName, descriptor) {
        var meta = _.assign({}, Reflect.getMetadata(exports.KeyWatch, target.constructor));
        meta[targetProperty || propertyName] = descriptor.value;
        Reflect.defineMetadata(exports.KeyWatch, meta, target.constructor);
    };
}
exports.Watch = Watch;
