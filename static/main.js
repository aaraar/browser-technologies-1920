(function () {
	'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var check = function (it) {
	  return it && it.Math == Math && it;
	}; // https://github.com/zloirock/core-js/issues/86#issuecomment-115759028


	var global_1 = // eslint-disable-next-line no-undef
	check(typeof globalThis == 'object' && globalThis) || check(typeof window == 'object' && window) || check(typeof self == 'object' && self) || check(typeof commonjsGlobal == 'object' && commonjsGlobal) || // eslint-disable-next-line no-new-func
	Function('return this')();

	var fails = function (exec) {
	  try {
	    return !!exec();
	  } catch (error) {
	    return true;
	  }
	};

	// Thank's IE8 for his funny defineProperty


	var descriptors = !fails(function () {
	  return Object.defineProperty({}, 1, {
	    get: function () {
	      return 7;
	    }
	  })[1] != 7;
	});

	var nativePropertyIsEnumerable = {}.propertyIsEnumerable;
	var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor; // Nashorn ~ JDK8 bug

	var NASHORN_BUG = getOwnPropertyDescriptor && !nativePropertyIsEnumerable.call({
	  1: 2
	}, 1); // `Object.prototype.propertyIsEnumerable` method implementation
	// https://tc39.github.io/ecma262/#sec-object.prototype.propertyisenumerable

	var f = NASHORN_BUG ? function propertyIsEnumerable(V) {
	  var descriptor = getOwnPropertyDescriptor(this, V);
	  return !!descriptor && descriptor.enumerable;
	} : nativePropertyIsEnumerable;

	var objectPropertyIsEnumerable = {
		f: f
	};

	var createPropertyDescriptor = function (bitmap, value) {
	  return {
	    enumerable: !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable: !(bitmap & 4),
	    value: value
	  };
	};

	var toString = {}.toString;

	var classofRaw = function (it) {
	  return toString.call(it).slice(8, -1);
	};

	var split = ''.split; // fallback for non-array-like ES3 and non-enumerable old V8 strings

	var indexedObject = fails(function () {
	  // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
	  // eslint-disable-next-line no-prototype-builtins
	  return !Object('z').propertyIsEnumerable(0);
	}) ? function (it) {
	  return classofRaw(it) == 'String' ? split.call(it, '') : Object(it);
	} : Object;

	// `RequireObjectCoercible` abstract operation
	// https://tc39.github.io/ecma262/#sec-requireobjectcoercible
	var requireObjectCoercible = function (it) {
	  if (it == undefined) throw TypeError("Can't call method on " + it);
	  return it;
	};

	// toObject with fallback for non-array-like ES3 strings




	var toIndexedObject = function (it) {
	  return indexedObject(requireObjectCoercible(it));
	};

	var isObject = function (it) {
	  return typeof it === 'object' ? it !== null : typeof it === 'function';
	};

	// `ToPrimitive` abstract operation
	// https://tc39.github.io/ecma262/#sec-toprimitive
	// instead of the ES6 spec version, we didn't implement @@toPrimitive case
	// and the second argument - flag - preferred type is a string


	var toPrimitive = function (input, PREFERRED_STRING) {
	  if (!isObject(input)) return input;
	  var fn, val;
	  if (PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
	  if (typeof (fn = input.valueOf) == 'function' && !isObject(val = fn.call(input))) return val;
	  if (!PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
	  throw TypeError("Can't convert object to primitive value");
	};

	var hasOwnProperty = {}.hasOwnProperty;

	var has = function (it, key) {
	  return hasOwnProperty.call(it, key);
	};

	var document$1 = global_1.document; // typeof document.createElement is 'object' in old IE

	var EXISTS = isObject(document$1) && isObject(document$1.createElement);

	var documentCreateElement = function (it) {
	  return EXISTS ? document$1.createElement(it) : {};
	};

	// Thank's IE8 for his funny defineProperty


	var ie8DomDefine = !descriptors && !fails(function () {
	  return Object.defineProperty(documentCreateElement('div'), 'a', {
	    get: function () {
	      return 7;
	    }
	  }).a != 7;
	});

	var nativeGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor; // `Object.getOwnPropertyDescriptor` method
	// https://tc39.github.io/ecma262/#sec-object.getownpropertydescriptor

	var f$1 = descriptors ? nativeGetOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
	  O = toIndexedObject(O);
	  P = toPrimitive(P, true);
	  if (ie8DomDefine) try {
	    return nativeGetOwnPropertyDescriptor(O, P);
	  } catch (error) {
	    /* empty */
	  }
	  if (has(O, P)) return createPropertyDescriptor(!objectPropertyIsEnumerable.f.call(O, P), O[P]);
	};

	var objectGetOwnPropertyDescriptor = {
		f: f$1
	};

	var anObject = function (it) {
	  if (!isObject(it)) {
	    throw TypeError(String(it) + ' is not an object');
	  }

	  return it;
	};

	var nativeDefineProperty = Object.defineProperty; // `Object.defineProperty` method
	// https://tc39.github.io/ecma262/#sec-object.defineproperty

	var f$2 = descriptors ? nativeDefineProperty : function defineProperty(O, P, Attributes) {
	  anObject(O);
	  P = toPrimitive(P, true);
	  anObject(Attributes);
	  if (ie8DomDefine) try {
	    return nativeDefineProperty(O, P, Attributes);
	  } catch (error) {
	    /* empty */
	  }
	  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported');
	  if ('value' in Attributes) O[P] = Attributes.value;
	  return O;
	};

	var objectDefineProperty = {
		f: f$2
	};

	var createNonEnumerableProperty = descriptors ? function (object, key, value) {
	  return objectDefineProperty.f(object, key, createPropertyDescriptor(1, value));
	} : function (object, key, value) {
	  object[key] = value;
	  return object;
	};

	var setGlobal = function (key, value) {
	  try {
	    createNonEnumerableProperty(global_1, key, value);
	  } catch (error) {
	    global_1[key] = value;
	  }

	  return value;
	};

	var SHARED = '__core-js_shared__';
	var store = global_1[SHARED] || setGlobal(SHARED, {});
	var sharedStore = store;

	var functionToString = Function.toString; // this helper broken in `3.4.1-3.4.4`, so we can't use `shared` helper

	if (typeof sharedStore.inspectSource != 'function') {
	  sharedStore.inspectSource = function (it) {
	    return functionToString.call(it);
	  };
	}

	var inspectSource = sharedStore.inspectSource;

	var WeakMap = global_1.WeakMap;
	var nativeWeakMap = typeof WeakMap === 'function' && /native code/.test(inspectSource(WeakMap));

	var shared = createCommonjsModule(function (module) {
	(module.exports = function (key, value) {
	  return sharedStore[key] || (sharedStore[key] = value !== undefined ? value : {});
	})('versions', []).push({
	  version: '3.6.4',
	  mode:  'global',
	  copyright: '© 2020 Denis Pushkarev (zloirock.ru)'
	});
	});

	var id = 0;
	var postfix = Math.random();

	var uid = function (key) {
	  return 'Symbol(' + String(key === undefined ? '' : key) + ')_' + (++id + postfix).toString(36);
	};

	var keys = shared('keys');

	var sharedKey = function (key) {
	  return keys[key] || (keys[key] = uid(key));
	};

	var hiddenKeys = {};

	var WeakMap$1 = global_1.WeakMap;
	var set, get, has$1;

	var enforce = function (it) {
	  return has$1(it) ? get(it) : set(it, {});
	};

	var getterFor = function (TYPE) {
	  return function (it) {
	    var state;

	    if (!isObject(it) || (state = get(it)).type !== TYPE) {
	      throw TypeError('Incompatible receiver, ' + TYPE + ' required');
	    }

	    return state;
	  };
	};

	if (nativeWeakMap) {
	  var store$1 = new WeakMap$1();
	  var wmget = store$1.get;
	  var wmhas = store$1.has;
	  var wmset = store$1.set;

	  set = function (it, metadata) {
	    wmset.call(store$1, it, metadata);
	    return metadata;
	  };

	  get = function (it) {
	    return wmget.call(store$1, it) || {};
	  };

	  has$1 = function (it) {
	    return wmhas.call(store$1, it);
	  };
	} else {
	  var STATE = sharedKey('state');
	  hiddenKeys[STATE] = true;

	  set = function (it, metadata) {
	    createNonEnumerableProperty(it, STATE, metadata);
	    return metadata;
	  };

	  get = function (it) {
	    return has(it, STATE) ? it[STATE] : {};
	  };

	  has$1 = function (it) {
	    return has(it, STATE);
	  };
	}

	var internalState = {
	  set: set,
	  get: get,
	  has: has$1,
	  enforce: enforce,
	  getterFor: getterFor
	};

	var redefine = createCommonjsModule(function (module) {
	var getInternalState = internalState.get;
	var enforceInternalState = internalState.enforce;
	var TEMPLATE = String(String).split('String');
	(module.exports = function (O, key, value, options) {
	  var unsafe = options ? !!options.unsafe : false;
	  var simple = options ? !!options.enumerable : false;
	  var noTargetGet = options ? !!options.noTargetGet : false;

	  if (typeof value == 'function') {
	    if (typeof key == 'string' && !has(value, 'name')) createNonEnumerableProperty(value, 'name', key);
	    enforceInternalState(value).source = TEMPLATE.join(typeof key == 'string' ? key : '');
	  }

	  if (O === global_1) {
	    if (simple) O[key] = value;else setGlobal(key, value);
	    return;
	  } else if (!unsafe) {
	    delete O[key];
	  } else if (!noTargetGet && O[key]) {
	    simple = true;
	  }

	  if (simple) O[key] = value;else createNonEnumerableProperty(O, key, value); // add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
	})(Function.prototype, 'toString', function toString() {
	  return typeof this == 'function' && getInternalState(this).source || inspectSource(this);
	});
	});

	var path = global_1;

	var aFunction = function (variable) {
	  return typeof variable == 'function' ? variable : undefined;
	};

	var getBuiltIn = function (namespace, method) {
	  return arguments.length < 2 ? aFunction(path[namespace]) || aFunction(global_1[namespace]) : path[namespace] && path[namespace][method] || global_1[namespace] && global_1[namespace][method];
	};

	var ceil = Math.ceil;
	var floor = Math.floor; // `ToInteger` abstract operation
	// https://tc39.github.io/ecma262/#sec-tointeger

	var toInteger = function (argument) {
	  return isNaN(argument = +argument) ? 0 : (argument > 0 ? floor : ceil)(argument);
	};

	var min = Math.min; // `ToLength` abstract operation
	// https://tc39.github.io/ecma262/#sec-tolength

	var toLength = function (argument) {
	  return argument > 0 ? min(toInteger(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
	};

	var max = Math.max;
	var min$1 = Math.min; // Helper for a popular repeating case of the spec:
	// Let integer be ? ToInteger(index).
	// If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).

	var toAbsoluteIndex = function (index, length) {
	  var integer = toInteger(index);
	  return integer < 0 ? max(integer + length, 0) : min$1(integer, length);
	};

	// `Array.prototype.{ indexOf, includes }` methods implementation


	var createMethod = function (IS_INCLUDES) {
	  return function ($this, el, fromIndex) {
	    var O = toIndexedObject($this);
	    var length = toLength(O.length);
	    var index = toAbsoluteIndex(fromIndex, length);
	    var value; // Array#includes uses SameValueZero equality algorithm
	    // eslint-disable-next-line no-self-compare

	    if (IS_INCLUDES && el != el) while (length > index) {
	      value = O[index++]; // eslint-disable-next-line no-self-compare

	      if (value != value) return true; // Array#indexOf ignores holes, Array#includes - not
	    } else for (; length > index; index++) {
	      if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
	    }
	    return !IS_INCLUDES && -1;
	  };
	};

	var arrayIncludes = {
	  // `Array.prototype.includes` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.includes
	  includes: createMethod(true),
	  // `Array.prototype.indexOf` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.indexof
	  indexOf: createMethod(false)
	};

	var indexOf = arrayIncludes.indexOf;



	var objectKeysInternal = function (object, names) {
	  var O = toIndexedObject(object);
	  var i = 0;
	  var result = [];
	  var key;

	  for (key in O) !has(hiddenKeys, key) && has(O, key) && result.push(key); // Don't enum bug & hidden keys


	  while (names.length > i) if (has(O, key = names[i++])) {
	    ~indexOf(result, key) || result.push(key);
	  }

	  return result;
	};

	// IE8- don't enum bug keys
	var enumBugKeys = ['constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'valueOf'];

	var hiddenKeys$1 = enumBugKeys.concat('length', 'prototype'); // `Object.getOwnPropertyNames` method
	// https://tc39.github.io/ecma262/#sec-object.getownpropertynames

	var f$3 = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
	  return objectKeysInternal(O, hiddenKeys$1);
	};

	var objectGetOwnPropertyNames = {
		f: f$3
	};

	var f$4 = Object.getOwnPropertySymbols;

	var objectGetOwnPropertySymbols = {
		f: f$4
	};

	// all object keys, includes non-enumerable and symbols


	var ownKeys = getBuiltIn('Reflect', 'ownKeys') || function ownKeys(it) {
	  var keys = objectGetOwnPropertyNames.f(anObject(it));
	  var getOwnPropertySymbols = objectGetOwnPropertySymbols.f;
	  return getOwnPropertySymbols ? keys.concat(getOwnPropertySymbols(it)) : keys;
	};

	var copyConstructorProperties = function (target, source) {
	  var keys = ownKeys(source);
	  var defineProperty = objectDefineProperty.f;
	  var getOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;

	  for (var i = 0; i < keys.length; i++) {
	    var key = keys[i];
	    if (!has(target, key)) defineProperty(target, key, getOwnPropertyDescriptor(source, key));
	  }
	};

	var replacement = /#|\.prototype\./;

	var isForced = function (feature, detection) {
	  var value = data$1[normalize(feature)];
	  return value == POLYFILL ? true : value == NATIVE ? false : typeof detection == 'function' ? fails(detection) : !!detection;
	};

	var normalize = isForced.normalize = function (string) {
	  return String(string).replace(replacement, '.').toLowerCase();
	};

	var data$1 = isForced.data = {};
	var NATIVE = isForced.NATIVE = 'N';
	var POLYFILL = isForced.POLYFILL = 'P';
	var isForced_1 = isForced;

	var getOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;










	/*
	  options.target      - name of the target object
	  options.global      - target is the global object
	  options.stat        - export as static methods of target
	  options.proto       - export as prototype methods of target
	  options.real        - real prototype method for the `pure` version
	  options.forced      - export even if the native feature is available
	  options.bind        - bind methods to the target, required for the `pure` version
	  options.wrap        - wrap constructors to preventing global pollution, required for the `pure` version
	  options.unsafe      - use the simple assignment of property instead of delete + defineProperty
	  options.sham        - add a flag to not completely full polyfills
	  options.enumerable  - export as enumerable property
	  options.noTargetGet - prevent calling a getter on target
	*/


	var _export = function (options, source) {
	  var TARGET = options.target;
	  var GLOBAL = options.global;
	  var STATIC = options.stat;
	  var FORCED, target, key, targetProperty, sourceProperty, descriptor;

	  if (GLOBAL) {
	    target = global_1;
	  } else if (STATIC) {
	    target = global_1[TARGET] || setGlobal(TARGET, {});
	  } else {
	    target = (global_1[TARGET] || {}).prototype;
	  }

	  if (target) for (key in source) {
	    sourceProperty = source[key];

	    if (options.noTargetGet) {
	      descriptor = getOwnPropertyDescriptor$1(target, key);
	      targetProperty = descriptor && descriptor.value;
	    } else targetProperty = target[key];

	    FORCED = isForced_1(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced); // contained in target

	    if (!FORCED && targetProperty !== undefined) {
	      if (typeof sourceProperty === typeof targetProperty) continue;
	      copyConstructorProperties(sourceProperty, targetProperty);
	    } // add a flag to not completely full polyfills


	    if (options.sham || targetProperty && targetProperty.sham) {
	      createNonEnumerableProperty(sourceProperty, 'sham', true);
	    } // extend global


	    redefine(target, key, sourceProperty, options);
	  }
	};

	// `IsArray` abstract operation
	// https://tc39.github.io/ecma262/#sec-isarray


	var isArray = Array.isArray || function isArray(arg) {
	  return classofRaw(arg) == 'Array';
	};

	// `ToObject` abstract operation
	// https://tc39.github.io/ecma262/#sec-toobject


	var toObject = function (argument) {
	  return Object(requireObjectCoercible(argument));
	};

	var createProperty = function (object, key, value) {
	  var propertyKey = toPrimitive(key);
	  if (propertyKey in object) objectDefineProperty.f(object, propertyKey, createPropertyDescriptor(0, value));else object[propertyKey] = value;
	};

	var nativeSymbol = !!Object.getOwnPropertySymbols && !fails(function () {
	  // Chrome 38 Symbol has incorrect toString conversion
	  // eslint-disable-next-line no-undef
	  return !String(Symbol());
	});

	var useSymbolAsUid = nativeSymbol // eslint-disable-next-line no-undef
	&& !Symbol.sham // eslint-disable-next-line no-undef
	&& typeof Symbol.iterator == 'symbol';

	var WellKnownSymbolsStore = shared('wks');
	var Symbol$1 = global_1.Symbol;
	var createWellKnownSymbol = useSymbolAsUid ? Symbol$1 : Symbol$1 && Symbol$1.withoutSetter || uid;

	var wellKnownSymbol = function (name) {
	  if (!has(WellKnownSymbolsStore, name)) {
	    if (nativeSymbol && has(Symbol$1, name)) WellKnownSymbolsStore[name] = Symbol$1[name];else WellKnownSymbolsStore[name] = createWellKnownSymbol('Symbol.' + name);
	  }

	  return WellKnownSymbolsStore[name];
	};

	var SPECIES = wellKnownSymbol('species'); // `ArraySpeciesCreate` abstract operation
	// https://tc39.github.io/ecma262/#sec-arrayspeciescreate

	var arraySpeciesCreate = function (originalArray, length) {
	  var C;

	  if (isArray(originalArray)) {
	    C = originalArray.constructor; // cross-realm fallback

	    if (typeof C == 'function' && (C === Array || isArray(C.prototype))) C = undefined;else if (isObject(C)) {
	      C = C[SPECIES];
	      if (C === null) C = undefined;
	    }
	  }

	  return new (C === undefined ? Array : C)(length === 0 ? 0 : length);
	};

	var engineUserAgent = getBuiltIn('navigator', 'userAgent') || '';

	var process = global_1.process;
	var versions = process && process.versions;
	var v8 = versions && versions.v8;
	var match, version;

	if (v8) {
	  match = v8.split('.');
	  version = match[0] + match[1];
	} else if (engineUserAgent) {
	  match = engineUserAgent.match(/Edge\/(\d+)/);

	  if (!match || match[1] >= 74) {
	    match = engineUserAgent.match(/Chrome\/(\d+)/);
	    if (match) version = match[1];
	  }
	}

	var engineV8Version = version && +version;

	var SPECIES$1 = wellKnownSymbol('species');

	var arrayMethodHasSpeciesSupport = function (METHOD_NAME) {
	  // We can't use this feature detection in V8 since it causes
	  // deoptimization and serious performance degradation
	  // https://github.com/zloirock/core-js/issues/677
	  return engineV8Version >= 51 || !fails(function () {
	    var array = [];
	    var constructor = array.constructor = {};

	    constructor[SPECIES$1] = function () {
	      return {
	        foo: 1
	      };
	    };

	    return array[METHOD_NAME](Boolean).foo !== 1;
	  });
	};

	var IS_CONCAT_SPREADABLE = wellKnownSymbol('isConcatSpreadable');
	var MAX_SAFE_INTEGER = 0x1FFFFFFFFFFFFF;
	var MAXIMUM_ALLOWED_INDEX_EXCEEDED = 'Maximum allowed index exceeded'; // We can't use this feature detection in V8 since it causes
	// deoptimization and serious performance degradation
	// https://github.com/zloirock/core-js/issues/679

	var IS_CONCAT_SPREADABLE_SUPPORT = engineV8Version >= 51 || !fails(function () {
	  var array = [];
	  array[IS_CONCAT_SPREADABLE] = false;
	  return array.concat()[0] !== array;
	});
	var SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('concat');

	var isConcatSpreadable = function (O) {
	  if (!isObject(O)) return false;
	  var spreadable = O[IS_CONCAT_SPREADABLE];
	  return spreadable !== undefined ? !!spreadable : isArray(O);
	};

	var FORCED = !IS_CONCAT_SPREADABLE_SUPPORT || !SPECIES_SUPPORT; // `Array.prototype.concat` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.concat
	// with adding support of @@isConcatSpreadable and @@species

	_export({
	  target: 'Array',
	  proto: true,
	  forced: FORCED
	}, {
	  concat: function concat(arg) {
	    // eslint-disable-line no-unused-vars
	    var O = toObject(this);
	    var A = arraySpeciesCreate(O, 0);
	    var n = 0;
	    var i, k, length, len, E;

	    for (i = -1, length = arguments.length; i < length; i++) {
	      E = i === -1 ? O : arguments[i];

	      if (isConcatSpreadable(E)) {
	        len = toLength(E.length);
	        if (n + len > MAX_SAFE_INTEGER) throw TypeError(MAXIMUM_ALLOWED_INDEX_EXCEEDED);

	        for (k = 0; k < len; k++, n++) if (k in E) createProperty(A, n, E[k]);
	      } else {
	        if (n >= MAX_SAFE_INTEGER) throw TypeError(MAXIMUM_ALLOWED_INDEX_EXCEEDED);
	        createProperty(A, n++, E);
	      }
	    }

	    A.length = n;
	    return A;
	  }
	});

	var aFunction$1 = function (it) {
	  if (typeof it != 'function') {
	    throw TypeError(String(it) + ' is not a function');
	  }

	  return it;
	};

	// optional / simple context binding


	var functionBindContext = function (fn, that, length) {
	  aFunction$1(fn);
	  if (that === undefined) return fn;

	  switch (length) {
	    case 0:
	      return function () {
	        return fn.call(that);
	      };

	    case 1:
	      return function (a) {
	        return fn.call(that, a);
	      };

	    case 2:
	      return function (a, b) {
	        return fn.call(that, a, b);
	      };

	    case 3:
	      return function (a, b, c) {
	        return fn.call(that, a, b, c);
	      };
	  }

	  return function ()
	  /* ...args */
	  {
	    return fn.apply(that, arguments);
	  };
	};

	var push = [].push; // `Array.prototype.{ forEach, map, filter, some, every, find, findIndex }` methods implementation

	var createMethod$1 = function (TYPE) {
	  var IS_MAP = TYPE == 1;
	  var IS_FILTER = TYPE == 2;
	  var IS_SOME = TYPE == 3;
	  var IS_EVERY = TYPE == 4;
	  var IS_FIND_INDEX = TYPE == 6;
	  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
	  return function ($this, callbackfn, that, specificCreate) {
	    var O = toObject($this);
	    var self = indexedObject(O);
	    var boundFunction = functionBindContext(callbackfn, that, 3);
	    var length = toLength(self.length);
	    var index = 0;
	    var create = specificCreate || arraySpeciesCreate;
	    var target = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined;
	    var value, result;

	    for (; length > index; index++) if (NO_HOLES || index in self) {
	      value = self[index];
	      result = boundFunction(value, index, O);

	      if (TYPE) {
	        if (IS_MAP) target[index] = result; // map
	        else if (result) switch (TYPE) {
	            case 3:
	              return true;
	            // some

	            case 5:
	              return value;
	            // find

	            case 6:
	              return index;
	            // findIndex

	            case 2:
	              push.call(target, value);
	            // filter
	          } else if (IS_EVERY) return false; // every
	      }
	    }

	    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : target;
	  };
	};

	var arrayIteration = {
	  // `Array.prototype.forEach` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.foreach
	  forEach: createMethod$1(0),
	  // `Array.prototype.map` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.map
	  map: createMethod$1(1),
	  // `Array.prototype.filter` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.filter
	  filter: createMethod$1(2),
	  // `Array.prototype.some` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.some
	  some: createMethod$1(3),
	  // `Array.prototype.every` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.every
	  every: createMethod$1(4),
	  // `Array.prototype.find` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.find
	  find: createMethod$1(5),
	  // `Array.prototype.findIndex` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.findIndex
	  findIndex: createMethod$1(6)
	};

	var arrayMethodIsStrict = function (METHOD_NAME, argument) {
	  var method = [][METHOD_NAME];
	  return !!method && fails(function () {
	    // eslint-disable-next-line no-useless-call,no-throw-literal
	    method.call(null, argument || function () {
	      throw 1;
	    }, 1);
	  });
	};

	var defineProperty = Object.defineProperty;
	var cache = {};

	var thrower = function (it) {
	  throw it;
	};

	var arrayMethodUsesToLength = function (METHOD_NAME, options) {
	  if (has(cache, METHOD_NAME)) return cache[METHOD_NAME];
	  if (!options) options = {};
	  var method = [][METHOD_NAME];
	  var ACCESSORS = has(options, 'ACCESSORS') ? options.ACCESSORS : false;
	  var argument0 = has(options, 0) ? options[0] : thrower;
	  var argument1 = has(options, 1) ? options[1] : undefined;
	  return cache[METHOD_NAME] = !!method && !fails(function () {
	    if (ACCESSORS && !descriptors) return true;
	    var O = {
	      length: -1
	    };
	    if (ACCESSORS) defineProperty(O, 1, {
	      enumerable: true,
	      get: thrower
	    });else O[1] = 1;
	    method.call(O, argument0, argument1);
	  });
	};

	var $forEach = arrayIteration.forEach;





	var STRICT_METHOD = arrayMethodIsStrict('forEach');
	var USES_TO_LENGTH = arrayMethodUsesToLength('forEach'); // `Array.prototype.forEach` method implementation
	// https://tc39.github.io/ecma262/#sec-array.prototype.foreach

	var arrayForEach = !STRICT_METHOD || !USES_TO_LENGTH ? function forEach(callbackfn
	/* , thisArg */
	) {
	  return $forEach(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	} : [].forEach;

	// `Array.prototype.forEach` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.foreach


	_export({
	  target: 'Array',
	  proto: true,
	  forced: [].forEach != arrayForEach
	}, {
	  forEach: arrayForEach
	});

	var aPossiblePrototype = function (it) {
	  if (!isObject(it) && it !== null) {
	    throw TypeError("Can't set " + String(it) + ' as a prototype');
	  }

	  return it;
	};

	// `Object.setPrototypeOf` method
	// https://tc39.github.io/ecma262/#sec-object.setprototypeof
	// Works with __proto__ only. Old v8 can't work with null proto objects.

	/* eslint-disable no-proto */


	var objectSetPrototypeOf = Object.setPrototypeOf || ('__proto__' in {} ? function () {
	  var CORRECT_SETTER = false;
	  var test = {};
	  var setter;

	  try {
	    setter = Object.getOwnPropertyDescriptor(Object.prototype, '__proto__').set;
	    setter.call(test, []);
	    CORRECT_SETTER = test instanceof Array;
	  } catch (error) {
	    /* empty */
	  }

	  return function setPrototypeOf(O, proto) {
	    anObject(O);
	    aPossiblePrototype(proto);
	    if (CORRECT_SETTER) setter.call(O, proto);else O.__proto__ = proto;
	    return O;
	  };
	}() : undefined);

	// makes subclassing work correct for wrapped built-ins


	var inheritIfRequired = function ($this, dummy, Wrapper) {
	  var NewTarget, NewTargetPrototype;
	  if ( // it can work only with native `setPrototypeOf`
	  objectSetPrototypeOf && // we haven't completely correct pre-ES6 way for getting `new.target`, so use this
	  typeof (NewTarget = dummy.constructor) == 'function' && NewTarget !== Wrapper && isObject(NewTargetPrototype = NewTarget.prototype) && NewTargetPrototype !== Wrapper.prototype) objectSetPrototypeOf($this, NewTargetPrototype);
	  return $this;
	};

	// `Object.keys` method
	// https://tc39.github.io/ecma262/#sec-object.keys


	var objectKeys = Object.keys || function keys(O) {
	  return objectKeysInternal(O, enumBugKeys);
	};

	// `Object.defineProperties` method
	// https://tc39.github.io/ecma262/#sec-object.defineproperties


	var objectDefineProperties = descriptors ? Object.defineProperties : function defineProperties(O, Properties) {
	  anObject(O);
	  var keys = objectKeys(Properties);
	  var length = keys.length;
	  var index = 0;
	  var key;

	  while (length > index) objectDefineProperty.f(O, key = keys[index++], Properties[key]);

	  return O;
	};

	var html = getBuiltIn('document', 'documentElement');

	var GT = '>';
	var LT = '<';
	var PROTOTYPE = 'prototype';
	var SCRIPT = 'script';
	var IE_PROTO = sharedKey('IE_PROTO');

	var EmptyConstructor = function () {
	  /* empty */
	};

	var scriptTag = function (content) {
	  return LT + SCRIPT + GT + content + LT + '/' + SCRIPT + GT;
	}; // Create object with fake `null` prototype: use ActiveX Object with cleared prototype


	var NullProtoObjectViaActiveX = function (activeXDocument) {
	  activeXDocument.write(scriptTag(''));
	  activeXDocument.close();
	  var temp = activeXDocument.parentWindow.Object;
	  activeXDocument = null; // avoid memory leak

	  return temp;
	}; // Create object with fake `null` prototype: use iframe Object with cleared prototype


	var NullProtoObjectViaIFrame = function () {
	  // Thrash, waste and sodomy: IE GC bug
	  var iframe = documentCreateElement('iframe');
	  var JS = 'java' + SCRIPT + ':';
	  var iframeDocument;
	  iframe.style.display = 'none';
	  html.appendChild(iframe); // https://github.com/zloirock/core-js/issues/475

	  iframe.src = String(JS);
	  iframeDocument = iframe.contentWindow.document;
	  iframeDocument.open();
	  iframeDocument.write(scriptTag('document.F=Object'));
	  iframeDocument.close();
	  return iframeDocument.F;
	}; // Check for document.domain and active x support
	// No need to use active x approach when document.domain is not set
	// see https://github.com/es-shims/es5-shim/issues/150
	// variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
	// avoid IE GC bug


	var activeXDocument;

	var NullProtoObject = function () {
	  try {
	    /* global ActiveXObject */
	    activeXDocument = document.domain && new ActiveXObject('htmlfile');
	  } catch (error) {
	    /* ignore */
	  }

	  NullProtoObject = activeXDocument ? NullProtoObjectViaActiveX(activeXDocument) : NullProtoObjectViaIFrame();
	  var length = enumBugKeys.length;

	  while (length--) delete NullProtoObject[PROTOTYPE][enumBugKeys[length]];

	  return NullProtoObject();
	};

	hiddenKeys[IE_PROTO] = true; // `Object.create` method
	// https://tc39.github.io/ecma262/#sec-object.create

	var objectCreate = Object.create || function create(O, Properties) {
	  var result;

	  if (O !== null) {
	    EmptyConstructor[PROTOTYPE] = anObject(O);
	    result = new EmptyConstructor();
	    EmptyConstructor[PROTOTYPE] = null; // add "__proto__" for Object.getPrototypeOf polyfill

	    result[IE_PROTO] = O;
	  } else result = NullProtoObject();

	  return Properties === undefined ? result : objectDefineProperties(result, Properties);
	};

	// a string of all valid unicode whitespaces
	// eslint-disable-next-line max-len
	var whitespaces = '\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';

	var whitespace = '[' + whitespaces + ']';
	var ltrim = RegExp('^' + whitespace + whitespace + '*');
	var rtrim = RegExp(whitespace + whitespace + '*$'); // `String.prototype.{ trim, trimStart, trimEnd, trimLeft, trimRight }` methods implementation

	var createMethod$2 = function (TYPE) {
	  return function ($this) {
	    var string = String(requireObjectCoercible($this));
	    if (TYPE & 1) string = string.replace(ltrim, '');
	    if (TYPE & 2) string = string.replace(rtrim, '');
	    return string;
	  };
	};

	var stringTrim = {
	  // `String.prototype.{ trimLeft, trimStart }` methods
	  // https://tc39.github.io/ecma262/#sec-string.prototype.trimstart
	  start: createMethod$2(1),
	  // `String.prototype.{ trimRight, trimEnd }` methods
	  // https://tc39.github.io/ecma262/#sec-string.prototype.trimend
	  end: createMethod$2(2),
	  // `String.prototype.trim` method
	  // https://tc39.github.io/ecma262/#sec-string.prototype.trim
	  trim: createMethod$2(3)
	};

	var getOwnPropertyNames = objectGetOwnPropertyNames.f;

	var getOwnPropertyDescriptor$2 = objectGetOwnPropertyDescriptor.f;

	var defineProperty$1 = objectDefineProperty.f;

	var trim = stringTrim.trim;

	var NUMBER = 'Number';
	var NativeNumber = global_1[NUMBER];
	var NumberPrototype = NativeNumber.prototype; // Opera ~12 has broken Object#toString

	var BROKEN_CLASSOF = classofRaw(objectCreate(NumberPrototype)) == NUMBER; // `ToNumber` abstract operation
	// https://tc39.github.io/ecma262/#sec-tonumber

	var toNumber = function (argument) {
	  var it = toPrimitive(argument, false);
	  var first, third, radix, maxCode, digits, length, index, code;

	  if (typeof it == 'string' && it.length > 2) {
	    it = trim(it);
	    first = it.charCodeAt(0);

	    if (first === 43 || first === 45) {
	      third = it.charCodeAt(2);
	      if (third === 88 || third === 120) return NaN; // Number('+0x1') should be NaN, old V8 fix
	    } else if (first === 48) {
	      switch (it.charCodeAt(1)) {
	        case 66:
	        case 98:
	          radix = 2;
	          maxCode = 49;
	          break;
	        // fast equal of /^0b[01]+$/i

	        case 79:
	        case 111:
	          radix = 8;
	          maxCode = 55;
	          break;
	        // fast equal of /^0o[0-7]+$/i

	        default:
	          return +it;
	      }

	      digits = it.slice(2);
	      length = digits.length;

	      for (index = 0; index < length; index++) {
	        code = digits.charCodeAt(index); // parseInt parses a string to a first unavailable symbol
	        // but ToNumber should return NaN if a string contains unavailable symbols

	        if (code < 48 || code > maxCode) return NaN;
	      }

	      return parseInt(digits, radix);
	    }
	  }

	  return +it;
	}; // `Number` constructor
	// https://tc39.github.io/ecma262/#sec-number-constructor


	if (isForced_1(NUMBER, !NativeNumber(' 0o1') || !NativeNumber('0b1') || NativeNumber('+0x1'))) {
	  var NumberWrapper = function Number(value) {
	    var it = arguments.length < 1 ? 0 : value;
	    var dummy = this;
	    return dummy instanceof NumberWrapper // check on 1..constructor(foo) case
	    && (BROKEN_CLASSOF ? fails(function () {
	      NumberPrototype.valueOf.call(dummy);
	    }) : classofRaw(dummy) != NUMBER) ? inheritIfRequired(new NativeNumber(toNumber(it)), dummy, NumberWrapper) : toNumber(it);
	  };

	  for (var keys$1 = descriptors ? getOwnPropertyNames(NativeNumber) : ( // ES3:
	  'MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,' + // ES2015 (in case, if modules with ES2015 Number statics required before):
	  'EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,' + 'MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger').split(','), j = 0, key; keys$1.length > j; j++) {
	    if (has(NativeNumber, key = keys$1[j]) && !has(NumberWrapper, key)) {
	      defineProperty$1(NumberWrapper, key, getOwnPropertyDescriptor$2(NativeNumber, key));
	    }
	  }

	  NumberWrapper.prototype = NumberPrototype;
	  NumberPrototype.constructor = NumberWrapper;
	  redefine(global_1, NUMBER, NumberWrapper);
	}

	var TO_STRING_TAG = wellKnownSymbol('toStringTag');
	var test = {};
	test[TO_STRING_TAG] = 'z';
	var toStringTagSupport = String(test) === '[object z]';

	var TO_STRING_TAG$1 = wellKnownSymbol('toStringTag'); // ES3 wrong here

	var CORRECT_ARGUMENTS = classofRaw(function () {
	  return arguments;
	}()) == 'Arguments'; // fallback for IE11 Script Access Denied error

	var tryGet = function (it, key) {
	  try {
	    return it[key];
	  } catch (error) {
	    /* empty */
	  }
	}; // getting tag from ES6+ `Object.prototype.toString`


	var classof = toStringTagSupport ? classofRaw : function (it) {
	  var O, tag, result;
	  return it === undefined ? 'Undefined' : it === null ? 'Null' // @@toStringTag case
	  : typeof (tag = tryGet(O = Object(it), TO_STRING_TAG$1)) == 'string' ? tag // builtinTag case
	  : CORRECT_ARGUMENTS ? classofRaw(O) // ES3 arguments fallback
	  : (result = classofRaw(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : result;
	};

	// `Object.prototype.toString` method implementation
	// https://tc39.github.io/ecma262/#sec-object.prototype.tostring


	var objectToString = toStringTagSupport ? {}.toString : function toString() {
	  return '[object ' + classof(this) + ']';
	};

	// `Object.prototype.toString` method
	// https://tc39.github.io/ecma262/#sec-object.prototype.tostring


	if (!toStringTagSupport) {
	  redefine(Object.prototype, 'toString', objectToString, {
	    unsafe: true
	  });
	}

	var nativePromiseConstructor = global_1.Promise;

	var redefineAll = function (target, src, options) {
	  for (var key in src) redefine(target, key, src[key], options);

	  return target;
	};

	var defineProperty$2 = objectDefineProperty.f;





	var TO_STRING_TAG$2 = wellKnownSymbol('toStringTag');

	var setToStringTag = function (it, TAG, STATIC) {
	  if (it && !has(it = STATIC ? it : it.prototype, TO_STRING_TAG$2)) {
	    defineProperty$2(it, TO_STRING_TAG$2, {
	      configurable: true,
	      value: TAG
	    });
	  }
	};

	var SPECIES$2 = wellKnownSymbol('species');

	var setSpecies = function (CONSTRUCTOR_NAME) {
	  var Constructor = getBuiltIn(CONSTRUCTOR_NAME);
	  var defineProperty = objectDefineProperty.f;

	  if (descriptors && Constructor && !Constructor[SPECIES$2]) {
	    defineProperty(Constructor, SPECIES$2, {
	      configurable: true,
	      get: function () {
	        return this;
	      }
	    });
	  }
	};

	var anInstance = function (it, Constructor, name) {
	  if (!(it instanceof Constructor)) {
	    throw TypeError('Incorrect ' + (name ? name + ' ' : '') + 'invocation');
	  }

	  return it;
	};

	var iterators = {};

	var ITERATOR = wellKnownSymbol('iterator');
	var ArrayPrototype = Array.prototype; // check on default Array iterator

	var isArrayIteratorMethod = function (it) {
	  return it !== undefined && (iterators.Array === it || ArrayPrototype[ITERATOR] === it);
	};

	var ITERATOR$1 = wellKnownSymbol('iterator');

	var getIteratorMethod = function (it) {
	  if (it != undefined) return it[ITERATOR$1] || it['@@iterator'] || iterators[classof(it)];
	};

	// call something on iterator step with safe closing on error


	var callWithSafeIterationClosing = function (iterator, fn, value, ENTRIES) {
	  try {
	    return ENTRIES ? fn(anObject(value)[0], value[1]) : fn(value); // 7.4.6 IteratorClose(iterator, completion)
	  } catch (error) {
	    var returnMethod = iterator['return'];
	    if (returnMethod !== undefined) anObject(returnMethod.call(iterator));
	    throw error;
	  }
	};

	var iterate_1 = createCommonjsModule(function (module) {
	var Result = function (stopped, result) {
	  this.stopped = stopped;
	  this.result = result;
	};

	var iterate = module.exports = function (iterable, fn, that, AS_ENTRIES, IS_ITERATOR) {
	  var boundFunction = functionBindContext(fn, that, AS_ENTRIES ? 2 : 1);
	  var iterator, iterFn, index, length, result, next, step;

	  if (IS_ITERATOR) {
	    iterator = iterable;
	  } else {
	    iterFn = getIteratorMethod(iterable);
	    if (typeof iterFn != 'function') throw TypeError('Target is not iterable'); // optimisation for array iterators

	    if (isArrayIteratorMethod(iterFn)) {
	      for (index = 0, length = toLength(iterable.length); length > index; index++) {
	        result = AS_ENTRIES ? boundFunction(anObject(step = iterable[index])[0], step[1]) : boundFunction(iterable[index]);
	        if (result && result instanceof Result) return result;
	      }

	      return new Result(false);
	    }

	    iterator = iterFn.call(iterable);
	  }

	  next = iterator.next;

	  while (!(step = next.call(iterator)).done) {
	    result = callWithSafeIterationClosing(iterator, boundFunction, step.value, AS_ENTRIES);
	    if (typeof result == 'object' && result && result instanceof Result) return result;
	  }

	  return new Result(false);
	};

	iterate.stop = function (result) {
	  return new Result(true, result);
	};
	});

	var ITERATOR$2 = wellKnownSymbol('iterator');
	var SAFE_CLOSING = false;

	try {
	  var called = 0;
	  var iteratorWithReturn = {
	    next: function () {
	      return {
	        done: !!called++
	      };
	    },
	    'return': function () {
	      SAFE_CLOSING = true;
	    }
	  };

	  iteratorWithReturn[ITERATOR$2] = function () {
	    return this;
	  }; // eslint-disable-next-line no-throw-literal


	  Array.from(iteratorWithReturn, function () {
	    throw 2;
	  });
	} catch (error) {
	  /* empty */
	}

	var checkCorrectnessOfIteration = function (exec, SKIP_CLOSING) {
	  if (!SKIP_CLOSING && !SAFE_CLOSING) return false;
	  var ITERATION_SUPPORT = false;

	  try {
	    var object = {};

	    object[ITERATOR$2] = function () {
	      return {
	        next: function () {
	          return {
	            done: ITERATION_SUPPORT = true
	          };
	        }
	      };
	    };

	    exec(object);
	  } catch (error) {
	    /* empty */
	  }

	  return ITERATION_SUPPORT;
	};

	var SPECIES$3 = wellKnownSymbol('species'); // `SpeciesConstructor` abstract operation
	// https://tc39.github.io/ecma262/#sec-speciesconstructor

	var speciesConstructor = function (O, defaultConstructor) {
	  var C = anObject(O).constructor;
	  var S;
	  return C === undefined || (S = anObject(C)[SPECIES$3]) == undefined ? defaultConstructor : aFunction$1(S);
	};

	var engineIsIos = /(iphone|ipod|ipad).*applewebkit/i.test(engineUserAgent);

	var location = global_1.location;
	var set$1 = global_1.setImmediate;
	var clear = global_1.clearImmediate;
	var process$1 = global_1.process;
	var MessageChannel = global_1.MessageChannel;
	var Dispatch = global_1.Dispatch;
	var counter = 0;
	var queue = {};
	var ONREADYSTATECHANGE = 'onreadystatechange';
	var defer, channel, port;

	var run = function (id) {
	  // eslint-disable-next-line no-prototype-builtins
	  if (queue.hasOwnProperty(id)) {
	    var fn = queue[id];
	    delete queue[id];
	    fn();
	  }
	};

	var runner = function (id) {
	  return function () {
	    run(id);
	  };
	};

	var listener = function (event) {
	  run(event.data);
	};

	var post = function (id) {
	  // old engines have not location.origin
	  global_1.postMessage(id + '', location.protocol + '//' + location.host);
	}; // Node.js 0.9+ & IE10+ has setImmediate, otherwise:


	if (!set$1 || !clear) {
	  set$1 = function setImmediate(fn) {
	    var args = [];
	    var i = 1;

	    while (arguments.length > i) args.push(arguments[i++]);

	    queue[++counter] = function () {
	      // eslint-disable-next-line no-new-func
	      (typeof fn == 'function' ? fn : Function(fn)).apply(undefined, args);
	    };

	    defer(counter);
	    return counter;
	  };

	  clear = function clearImmediate(id) {
	    delete queue[id];
	  }; // Node.js 0.8-


	  if (classofRaw(process$1) == 'process') {
	    defer = function (id) {
	      process$1.nextTick(runner(id));
	    }; // Sphere (JS game engine) Dispatch API

	  } else if (Dispatch && Dispatch.now) {
	    defer = function (id) {
	      Dispatch.now(runner(id));
	    }; // Browsers with MessageChannel, includes WebWorkers
	    // except iOS - https://github.com/zloirock/core-js/issues/624

	  } else if (MessageChannel && !engineIsIos) {
	    channel = new MessageChannel();
	    port = channel.port2;
	    channel.port1.onmessage = listener;
	    defer = functionBindContext(port.postMessage, port, 1); // Browsers with postMessage, skip WebWorkers
	    // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
	  } else if (global_1.addEventListener && typeof postMessage == 'function' && !global_1.importScripts && !fails(post)) {
	    defer = post;
	    global_1.addEventListener('message', listener, false); // IE8-
	  } else if (ONREADYSTATECHANGE in documentCreateElement('script')) {
	    defer = function (id) {
	      html.appendChild(documentCreateElement('script'))[ONREADYSTATECHANGE] = function () {
	        html.removeChild(this);
	        run(id);
	      };
	    }; // Rest old browsers

	  } else {
	    defer = function (id) {
	      setTimeout(runner(id), 0);
	    };
	  }
	}

	var task = {
	  set: set$1,
	  clear: clear
	};

	var getOwnPropertyDescriptor$3 = objectGetOwnPropertyDescriptor.f;



	var macrotask = task.set;



	var MutationObserver = global_1.MutationObserver || global_1.WebKitMutationObserver;
	var process$2 = global_1.process;
	var Promise$1 = global_1.Promise;
	var IS_NODE = classofRaw(process$2) == 'process'; // Node.js 11 shows ExperimentalWarning on getting `queueMicrotask`

	var queueMicrotaskDescriptor = getOwnPropertyDescriptor$3(global_1, 'queueMicrotask');
	var queueMicrotask = queueMicrotaskDescriptor && queueMicrotaskDescriptor.value;
	var flush, head, last, notify, toggle, node, promise, then; // modern engines have queueMicrotask method

	if (!queueMicrotask) {
	  flush = function () {
	    var parent, fn;
	    if (IS_NODE && (parent = process$2.domain)) parent.exit();

	    while (head) {
	      fn = head.fn;
	      head = head.next;

	      try {
	        fn();
	      } catch (error) {
	        if (head) notify();else last = undefined;
	        throw error;
	      }
	    }

	    last = undefined;
	    if (parent) parent.enter();
	  }; // Node.js


	  if (IS_NODE) {
	    notify = function () {
	      process$2.nextTick(flush);
	    }; // browsers with MutationObserver, except iOS - https://github.com/zloirock/core-js/issues/339

	  } else if (MutationObserver && !engineIsIos) {
	    toggle = true;
	    node = document.createTextNode('');
	    new MutationObserver(flush).observe(node, {
	      characterData: true
	    });

	    notify = function () {
	      node.data = toggle = !toggle;
	    }; // environments with maybe non-completely correct, but existent Promise

	  } else if (Promise$1 && Promise$1.resolve) {
	    // Promise.resolve without an argument throws an error in LG WebOS 2
	    promise = Promise$1.resolve(undefined);
	    then = promise.then;

	    notify = function () {
	      then.call(promise, flush);
	    }; // for other environments - macrotask based on:
	    // - setImmediate
	    // - MessageChannel
	    // - window.postMessag
	    // - onreadystatechange
	    // - setTimeout

	  } else {
	    notify = function () {
	      // strange IE + webpack dev server bug - use .call(global)
	      macrotask.call(global_1, flush);
	    };
	  }
	}

	var microtask = queueMicrotask || function (fn) {
	  var task = {
	    fn: fn,
	    next: undefined
	  };
	  if (last) last.next = task;

	  if (!head) {
	    head = task;
	    notify();
	  }

	  last = task;
	};

	var PromiseCapability = function (C) {
	  var resolve, reject;
	  this.promise = new C(function ($$resolve, $$reject) {
	    if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
	    resolve = $$resolve;
	    reject = $$reject;
	  });
	  this.resolve = aFunction$1(resolve);
	  this.reject = aFunction$1(reject);
	}; // 25.4.1.5 NewPromiseCapability(C)


	var f$5 = function (C) {
	  return new PromiseCapability(C);
	};

	var newPromiseCapability = {
		f: f$5
	};

	var promiseResolve = function (C, x) {
	  anObject(C);
	  if (isObject(x) && x.constructor === C) return x;
	  var promiseCapability = newPromiseCapability.f(C);
	  var resolve = promiseCapability.resolve;
	  resolve(x);
	  return promiseCapability.promise;
	};

	var hostReportErrors = function (a, b) {
	  var console = global_1.console;

	  if (console && console.error) {
	    arguments.length === 1 ? console.error(a) : console.error(a, b);
	  }
	};

	var perform = function (exec) {
	  try {
	    return {
	      error: false,
	      value: exec()
	    };
	  } catch (error) {
	    return {
	      error: true,
	      value: error
	    };
	  }
	};

	var task$1 = task.set;



















	var SPECIES$4 = wellKnownSymbol('species');
	var PROMISE = 'Promise';
	var getInternalState = internalState.get;
	var setInternalState = internalState.set;
	var getInternalPromiseState = internalState.getterFor(PROMISE);
	var PromiseConstructor = nativePromiseConstructor;
	var TypeError$1 = global_1.TypeError;
	var document$2 = global_1.document;
	var process$3 = global_1.process;
	var $fetch = getBuiltIn('fetch');
	var newPromiseCapability$1 = newPromiseCapability.f;
	var newGenericPromiseCapability = newPromiseCapability$1;
	var IS_NODE$1 = classofRaw(process$3) == 'process';
	var DISPATCH_EVENT = !!(document$2 && document$2.createEvent && global_1.dispatchEvent);
	var UNHANDLED_REJECTION = 'unhandledrejection';
	var REJECTION_HANDLED = 'rejectionhandled';
	var PENDING = 0;
	var FULFILLED = 1;
	var REJECTED = 2;
	var HANDLED = 1;
	var UNHANDLED = 2;
	var Internal, OwnPromiseCapability, PromiseWrapper, nativeThen;
	var FORCED$1 = isForced_1(PROMISE, function () {
	  var GLOBAL_CORE_JS_PROMISE = inspectSource(PromiseConstructor) !== String(PromiseConstructor);

	  if (!GLOBAL_CORE_JS_PROMISE) {
	    // V8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
	    // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
	    // We can't detect it synchronously, so just check versions
	    if (engineV8Version === 66) return true; // Unhandled rejections tracking support, NodeJS Promise without it fails @@species test

	    if (!IS_NODE$1 && typeof PromiseRejectionEvent != 'function') return true;
	  } // We need Promise#finally in the pure version for preventing prototype pollution
	  // deoptimization and performance degradation
	  // https://github.com/zloirock/core-js/issues/679

	  if (engineV8Version >= 51 && /native code/.test(PromiseConstructor)) return false; // Detect correctness of subclassing with @@species support

	  var promise = PromiseConstructor.resolve(1);

	  var FakePromise = function (exec) {
	    exec(function () {
	      /* empty */
	    }, function () {
	      /* empty */
	    });
	  };

	  var constructor = promise.constructor = {};
	  constructor[SPECIES$4] = FakePromise;
	  return !(promise.then(function () {
	    /* empty */
	  }) instanceof FakePromise);
	});
	var INCORRECT_ITERATION = FORCED$1 || !checkCorrectnessOfIteration(function (iterable) {
	  PromiseConstructor.all(iterable)['catch'](function () {
	    /* empty */
	  });
	}); // helpers

	var isThenable = function (it) {
	  var then;
	  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
	};

	var notify$1 = function (promise, state, isReject) {
	  if (state.notified) return;
	  state.notified = true;
	  var chain = state.reactions;
	  microtask(function () {
	    var value = state.value;
	    var ok = state.state == FULFILLED;
	    var index = 0; // variable length - can't use forEach

	    while (chain.length > index) {
	      var reaction = chain[index++];
	      var handler = ok ? reaction.ok : reaction.fail;
	      var resolve = reaction.resolve;
	      var reject = reaction.reject;
	      var domain = reaction.domain;
	      var result, then, exited;

	      try {
	        if (handler) {
	          if (!ok) {
	            if (state.rejection === UNHANDLED) onHandleUnhandled(promise, state);
	            state.rejection = HANDLED;
	          }

	          if (handler === true) result = value;else {
	            if (domain) domain.enter();
	            result = handler(value); // can throw

	            if (domain) {
	              domain.exit();
	              exited = true;
	            }
	          }

	          if (result === reaction.promise) {
	            reject(TypeError$1('Promise-chain cycle'));
	          } else if (then = isThenable(result)) {
	            then.call(result, resolve, reject);
	          } else resolve(result);
	        } else reject(value);
	      } catch (error) {
	        if (domain && !exited) domain.exit();
	        reject(error);
	      }
	    }

	    state.reactions = [];
	    state.notified = false;
	    if (isReject && !state.rejection) onUnhandled(promise, state);
	  });
	};

	var dispatchEvent = function (name, promise, reason) {
	  var event, handler;

	  if (DISPATCH_EVENT) {
	    event = document$2.createEvent('Event');
	    event.promise = promise;
	    event.reason = reason;
	    event.initEvent(name, false, true);
	    global_1.dispatchEvent(event);
	  } else event = {
	    promise: promise,
	    reason: reason
	  };

	  if (handler = global_1['on' + name]) handler(event);else if (name === UNHANDLED_REJECTION) hostReportErrors('Unhandled promise rejection', reason);
	};

	var onUnhandled = function (promise, state) {
	  task$1.call(global_1, function () {
	    var value = state.value;
	    var IS_UNHANDLED = isUnhandled(state);
	    var result;

	    if (IS_UNHANDLED) {
	      result = perform(function () {
	        if (IS_NODE$1) {
	          process$3.emit('unhandledRejection', value, promise);
	        } else dispatchEvent(UNHANDLED_REJECTION, promise, value);
	      }); // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should

	      state.rejection = IS_NODE$1 || isUnhandled(state) ? UNHANDLED : HANDLED;
	      if (result.error) throw result.value;
	    }
	  });
	};

	var isUnhandled = function (state) {
	  return state.rejection !== HANDLED && !state.parent;
	};

	var onHandleUnhandled = function (promise, state) {
	  task$1.call(global_1, function () {
	    if (IS_NODE$1) {
	      process$3.emit('rejectionHandled', promise);
	    } else dispatchEvent(REJECTION_HANDLED, promise, state.value);
	  });
	};

	var bind = function (fn, promise, state, unwrap) {
	  return function (value) {
	    fn(promise, state, value, unwrap);
	  };
	};

	var internalReject = function (promise, state, value, unwrap) {
	  if (state.done) return;
	  state.done = true;
	  if (unwrap) state = unwrap;
	  state.value = value;
	  state.state = REJECTED;
	  notify$1(promise, state, true);
	};

	var internalResolve = function (promise, state, value, unwrap) {
	  if (state.done) return;
	  state.done = true;
	  if (unwrap) state = unwrap;

	  try {
	    if (promise === value) throw TypeError$1("Promise can't be resolved itself");
	    var then = isThenable(value);

	    if (then) {
	      microtask(function () {
	        var wrapper = {
	          done: false
	        };

	        try {
	          then.call(value, bind(internalResolve, promise, wrapper, state), bind(internalReject, promise, wrapper, state));
	        } catch (error) {
	          internalReject(promise, wrapper, error, state);
	        }
	      });
	    } else {
	      state.value = value;
	      state.state = FULFILLED;
	      notify$1(promise, state, false);
	    }
	  } catch (error) {
	    internalReject(promise, {
	      done: false
	    }, error, state);
	  }
	}; // constructor polyfill


	if (FORCED$1) {
	  // 25.4.3.1 Promise(executor)
	  PromiseConstructor = function Promise(executor) {
	    anInstance(this, PromiseConstructor, PROMISE);
	    aFunction$1(executor);
	    Internal.call(this);
	    var state = getInternalState(this);

	    try {
	      executor(bind(internalResolve, this, state), bind(internalReject, this, state));
	    } catch (error) {
	      internalReject(this, state, error);
	    }
	  }; // eslint-disable-next-line no-unused-vars


	  Internal = function Promise(executor) {
	    setInternalState(this, {
	      type: PROMISE,
	      done: false,
	      notified: false,
	      parent: false,
	      reactions: [],
	      rejection: false,
	      state: PENDING,
	      value: undefined
	    });
	  };

	  Internal.prototype = redefineAll(PromiseConstructor.prototype, {
	    // `Promise.prototype.then` method
	    // https://tc39.github.io/ecma262/#sec-promise.prototype.then
	    then: function then(onFulfilled, onRejected) {
	      var state = getInternalPromiseState(this);
	      var reaction = newPromiseCapability$1(speciesConstructor(this, PromiseConstructor));
	      reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
	      reaction.fail = typeof onRejected == 'function' && onRejected;
	      reaction.domain = IS_NODE$1 ? process$3.domain : undefined;
	      state.parent = true;
	      state.reactions.push(reaction);
	      if (state.state != PENDING) notify$1(this, state, false);
	      return reaction.promise;
	    },
	    // `Promise.prototype.catch` method
	    // https://tc39.github.io/ecma262/#sec-promise.prototype.catch
	    'catch': function (onRejected) {
	      return this.then(undefined, onRejected);
	    }
	  });

	  OwnPromiseCapability = function () {
	    var promise = new Internal();
	    var state = getInternalState(promise);
	    this.promise = promise;
	    this.resolve = bind(internalResolve, promise, state);
	    this.reject = bind(internalReject, promise, state);
	  };

	  newPromiseCapability.f = newPromiseCapability$1 = function (C) {
	    return C === PromiseConstructor || C === PromiseWrapper ? new OwnPromiseCapability(C) : newGenericPromiseCapability(C);
	  };

	  if ( typeof nativePromiseConstructor == 'function') {
	    nativeThen = nativePromiseConstructor.prototype.then; // wrap native Promise#then for native async functions

	    redefine(nativePromiseConstructor.prototype, 'then', function then(onFulfilled, onRejected) {
	      var that = this;
	      return new PromiseConstructor(function (resolve, reject) {
	        nativeThen.call(that, resolve, reject);
	      }).then(onFulfilled, onRejected); // https://github.com/zloirock/core-js/issues/640
	    }, {
	      unsafe: true
	    }); // wrap fetch result

	    if (typeof $fetch == 'function') _export({
	      global: true,
	      enumerable: true,
	      forced: true
	    }, {
	      // eslint-disable-next-line no-unused-vars
	      fetch: function fetch(input
	      /* , init */
	      ) {
	        return promiseResolve(PromiseConstructor, $fetch.apply(global_1, arguments));
	      }
	    });
	  }
	}

	_export({
	  global: true,
	  wrap: true,
	  forced: FORCED$1
	}, {
	  Promise: PromiseConstructor
	});
	setToStringTag(PromiseConstructor, PROMISE, false);
	setSpecies(PROMISE);
	PromiseWrapper = getBuiltIn(PROMISE); // statics

	_export({
	  target: PROMISE,
	  stat: true,
	  forced: FORCED$1
	}, {
	  // `Promise.reject` method
	  // https://tc39.github.io/ecma262/#sec-promise.reject
	  reject: function reject(r) {
	    var capability = newPromiseCapability$1(this);
	    capability.reject.call(undefined, r);
	    return capability.promise;
	  }
	});
	_export({
	  target: PROMISE,
	  stat: true,
	  forced:  FORCED$1
	}, {
	  // `Promise.resolve` method
	  // https://tc39.github.io/ecma262/#sec-promise.resolve
	  resolve: function resolve(x) {
	    return promiseResolve( this, x);
	  }
	});
	_export({
	  target: PROMISE,
	  stat: true,
	  forced: INCORRECT_ITERATION
	}, {
	  // `Promise.all` method
	  // https://tc39.github.io/ecma262/#sec-promise.all
	  all: function all(iterable) {
	    var C = this;
	    var capability = newPromiseCapability$1(C);
	    var resolve = capability.resolve;
	    var reject = capability.reject;
	    var result = perform(function () {
	      var $promiseResolve = aFunction$1(C.resolve);
	      var values = [];
	      var counter = 0;
	      var remaining = 1;
	      iterate_1(iterable, function (promise) {
	        var index = counter++;
	        var alreadyCalled = false;
	        values.push(undefined);
	        remaining++;
	        $promiseResolve.call(C, promise).then(function (value) {
	          if (alreadyCalled) return;
	          alreadyCalled = true;
	          values[index] = value;
	          --remaining || resolve(values);
	        }, reject);
	      });
	      --remaining || resolve(values);
	    });
	    if (result.error) reject(result.value);
	    return capability.promise;
	  },
	  // `Promise.race` method
	  // https://tc39.github.io/ecma262/#sec-promise.race
	  race: function race(iterable) {
	    var C = this;
	    var capability = newPromiseCapability$1(C);
	    var reject = capability.reject;
	    var result = perform(function () {
	      var $promiseResolve = aFunction$1(C.resolve);
	      iterate_1(iterable, function (promise) {
	        $promiseResolve.call(C, promise).then(capability.resolve, reject);
	      });
	    });
	    if (result.error) reject(result.value);
	    return capability.promise;
	  }
	});

	var non = '\u200B\u0085\u180E'; // check that a method works with the correct list
	// of whitespaces and has a correct name

	var stringTrimForced = function (METHOD_NAME) {
	  return fails(function () {
	    return !!whitespaces[METHOD_NAME]() || non[METHOD_NAME]() != non || whitespaces[METHOD_NAME].name !== METHOD_NAME;
	  });
	};

	var $trim = stringTrim.trim;

	 // `String.prototype.trim` method
	// https://tc39.github.io/ecma262/#sec-string.prototype.trim


	_export({
	  target: 'String',
	  proto: true,
	  forced: stringTrimForced('trim')
	}, {
	  trim: function trim() {
	    return $trim(this);
	  }
	});

	// iterable DOM collections
	// flag - `iterable` interface - 'entries', 'keys', 'values', 'forEach' methods
	var domIterables = {
	  CSSRuleList: 0,
	  CSSStyleDeclaration: 0,
	  CSSValueList: 0,
	  ClientRectList: 0,
	  DOMRectList: 0,
	  DOMStringList: 0,
	  DOMTokenList: 1,
	  DataTransferItemList: 0,
	  FileList: 0,
	  HTMLAllCollection: 0,
	  HTMLCollection: 0,
	  HTMLFormElement: 0,
	  HTMLSelectElement: 0,
	  MediaList: 0,
	  MimeTypeArray: 0,
	  NamedNodeMap: 0,
	  NodeList: 1,
	  PaintRequestList: 0,
	  Plugin: 0,
	  PluginArray: 0,
	  SVGLengthList: 0,
	  SVGNumberList: 0,
	  SVGPathSegList: 0,
	  SVGPointList: 0,
	  SVGStringList: 0,
	  SVGTransformList: 0,
	  SourceBufferList: 0,
	  StyleSheetList: 0,
	  TextTrackCueList: 0,
	  TextTrackList: 0,
	  TouchList: 0
	};

	for (var COLLECTION_NAME in domIterables) {
	  var Collection = global_1[COLLECTION_NAME];
	  var CollectionPrototype = Collection && Collection.prototype; // some Chrome versions have non-configurable methods on DOMTokenList

	  if (CollectionPrototype && CollectionPrototype.forEach !== arrayForEach) try {
	    createNonEnumerableProperty(CollectionPrototype, 'forEach', arrayForEach);
	  } catch (error) {
	    CollectionPrototype.forEach = arrayForEach;
	  }
	}

	var pug = (function (exports) {

	  var pug_has_own_property = Object.prototype.hasOwnProperty;
	  /**
	   * Merge two attribute objects giving precedence
	   * to values in object `b`. Classes are special-cased
	   * allowing for arrays and merging/joining appropriately
	   * resulting in a string.
	   *
	   * @param {Object} a
	   * @param {Object} b
	   * @return {Object} a
	   * @api private
	   */

	  exports.merge = pug_merge;

	  function pug_merge(a, b) {
	    if (arguments.length === 1) {
	      var attrs = a[0];

	      for (var i = 1; i < a.length; i++) {
	        attrs = pug_merge(attrs, a[i]);
	      }

	      return attrs;
	    }

	    for (var key in b) {
	      if (key === 'class') {
	        var valA = a[key] || [];
	        a[key] = (Array.isArray(valA) ? valA : [valA]).concat(b[key] || []);
	      } else if (key === 'style') {
	        var valA = pug_style(a[key]);
	        valA = valA && valA[valA.length - 1] !== ';' ? valA + ';' : valA;
	        var valB = pug_style(b[key]);
	        valB = valB && valB[valB.length - 1] !== ';' ? valB + ';' : valB;
	        a[key] = valA + valB;
	      } else {
	        a[key] = b[key];
	      }
	    }

	    return a;
	  }
	  /**
	   * Process array, object, or string as a string of classes delimited by a space.
	   *
	   * If `val` is an array, all members of it and its subarrays are counted as
	   * classes. If `escaping` is an array, then whether or not the item in `val` is
	   * escaped depends on the corresponding item in `escaping`. If `escaping` is
	   * not an array, no escaping is done.
	   *
	   * If `val` is an object, all the keys whose value is truthy are counted as
	   * classes. No escaping is done.
	   *
	   * If `val` is a string, it is counted as a class. No escaping is done.
	   *
	   * @param {(Array.<string>|Object.<string, boolean>|string)} val
	   * @param {?Array.<string>} escaping
	   * @return {String}
	   */

	  exports.classes = pug_classes;

	  function pug_classes_array(val, escaping) {
	    var classString = '',
	        className,
	        padding = '',
	        escapeEnabled = Array.isArray(escaping);

	    for (var i = 0; i < val.length; i++) {
	      className = pug_classes(val[i]);
	      if (!className) continue;
	      escapeEnabled && escaping[i] && (className = pug_escape(className));
	      classString = classString + padding + className;
	      padding = ' ';
	    }

	    return classString;
	  }

	  function pug_classes_object(val) {
	    var classString = '',
	        padding = '';

	    for (var key in val) {
	      if (key && val[key] && pug_has_own_property.call(val, key)) {
	        classString = classString + padding + key;
	        padding = ' ';
	      }
	    }

	    return classString;
	  }

	  function pug_classes(val, escaping) {
	    if (Array.isArray(val)) {
	      return pug_classes_array(val, escaping);
	    } else if (val && typeof val === 'object') {
	      return pug_classes_object(val);
	    } else {
	      return val || '';
	    }
	  }
	  /**
	   * Convert object or string to a string of CSS styles delimited by a semicolon.
	   *
	   * @param {(Object.<string, string>|string)} val
	   * @return {String}
	   */


	  exports.style = pug_style;

	  function pug_style(val) {
	    if (!val) return '';

	    if (typeof val === 'object') {
	      var out = '';

	      for (var style in val) {
	        /* istanbul ignore else */
	        if (pug_has_own_property.call(val, style)) {
	          out = out + style + ':' + val[style] + ';';
	        }
	      }

	      return out;
	    } else {
	      return val + '';
	    }
	  }
	  /**
	   * Render the given attribute.
	   *
	   * @param {String} key
	   * @param {String} val
	   * @param {Boolean} escaped
	   * @param {Boolean} terse
	   * @return {String}
	   */

	  exports.attr = pug_attr;

	  function pug_attr(key, val, escaped, terse) {
	    if (val === false || val == null || !val && (key === 'class' || key === 'style')) {
	      return '';
	    }

	    if (val === true) {
	      return ' ' + (terse ? key : key + '="' + key + '"');
	    }

	    var type = typeof val;

	    if ((type === 'object' || type === 'function') && typeof val.toJSON === 'function') {
	      val = val.toJSON();
	    }

	    if (typeof val !== 'string') {
	      val = JSON.stringify(val);

	      if (!escaped && val.indexOf('"') !== -1) {
	        return ' ' + key + '=\'' + val.replace(/'/g, '&#39;') + '\'';
	      }
	    }

	    if (escaped) val = pug_escape(val);
	    return ' ' + key + '="' + val + '"';
	  }
	  /**
	   * Render the given attributes object.
	   *
	   * @param {Object} obj
	   * @param {Object} terse whether to use HTML5 terse boolean attributes
	   * @return {String}
	   */

	  exports.attrs = pug_attrs;

	  function pug_attrs(obj, terse) {
	    var attrs = '';

	    for (var key in obj) {
	      if (pug_has_own_property.call(obj, key)) {
	        var val = obj[key];

	        if ('class' === key) {
	          val = pug_classes(val);
	          attrs = pug_attr(key, val, false, terse) + attrs;
	          continue;
	        }

	        if ('style' === key) {
	          val = pug_style(val);
	        }

	        attrs += pug_attr(key, val, false, terse);
	      }
	    }

	    return attrs;
	  }
	  /**
	   * Escape the given string of `html`.
	   *
	   * @param {String} html
	   * @return {String}
	   * @api private
	   */

	  var pug_match_html = /["&<>]/;
	  exports.escape = pug_escape;

	  function pug_escape(_html) {
	    var html = '' + _html;
	    var regexResult = pug_match_html.exec(html);
	    if (!regexResult) return _html;
	    var result = '';
	    var i, lastIndex, escape;

	    for (i = regexResult.index, lastIndex = 0; i < html.length; i++) {
	      switch (html.charCodeAt(i)) {
	        case 34:
	          escape = '&quot;';
	          break;

	        case 38:
	          escape = '&amp;';
	          break;

	        case 60:
	          escape = '&lt;';
	          break;

	        case 62:
	          escape = '&gt;';
	          break;

	        default:
	          continue;
	      }

	      if (lastIndex !== i) result += html.substring(lastIndex, i);
	      lastIndex = i + 1;
	      result += escape;
	    }

	    if (lastIndex !== i) return result + html.substring(lastIndex, i);else return result;
	  }
	  /**
	   * Re-throw the given `err` in context to the
	   * the pug in `filename` at the given `lineno`.
	   *
	   * @param {Error} err
	   * @param {String} filename
	   * @param {String} lineno
	   * @param {String} str original source
	   * @api private
	   */

	  exports.rethrow = pug_rethrow;

	  function pug_rethrow(err, filename, lineno, str) {
	    if (!(err instanceof Error)) throw err;

	    if ((typeof window != 'undefined' || !filename) && !str) {
	      err.message += ' on line ' + lineno;
	      throw err;
	    }

	    try {
	      str = str || require('fs').readFileSync(filename, 'utf8');
	    } catch (ex) {
	      pug_rethrow(err, null, lineno);
	    }

	    var context = 3,
	        lines = str.split('\n'),
	        start = Math.max(lineno - context, 0),
	        end = Math.min(lines.length, lineno + context); // Error context

	    var context = lines.slice(start, end).map(function (line, i) {
	      var curr = i + start + 1;
	      return (curr == lineno ? '  > ' : '    ') + curr + '| ' + line;
	    }).join('\n'); // Alter exception message

	    err.path = filename;
	    err.message = (filename || 'Pug') + ':' + lineno + '\n' + context + '\n\n' + err.message;
	    throw err;
	  }
	  return exports;
	})({});

	function q1Fn(locals) {var pug_html = "", pug_interp;var pug_debug_filename, pug_debug_line;try {var pug_debug_sources = {};
	;var locals_for_with = (locals || {});(function (data, pageTitle, progress, uuid) {
	pug_html = pug_html + "\u003Cdiv class=\"app\"\u003E";
	pug_html = pug_html + "\u003Cheader\u003E";
	pug_html = pug_html + "\u003Cdiv class=\"title\"\u003E";
	pug_html = pug_html + "\u003Ch1\u003E";
	pug_html = pug_html + " ";
	pug_html = pug_html + (pug.escape(null == (pug_interp = pageTitle) ? "" : pug_interp)) + "\u003C\u002Fh1\u003E\u003C\u002Fdiv\u003E\u003C\u002Fheader\u003E";
	if (progress) {
	pug_html = pug_html + "\u003Cprogress" + (pug.attr("value", progress, true, true)+" max=\"6\"") + "\u003E";
	pug_html = pug_html + (pug.escape(null == (pug_interp = progress) ? "" : pug_interp));
	pug_html = pug_html + "\u002F6\u003C\u002Fprogress\u003E";
	}
	pug_html = pug_html + "\u003Cmain\u003E";
	pug_html = pug_html + "\u003Carticle\u003E";
	pug_html = pug_html + "\u003Cheader\u003E";
	pug_html = pug_html + "\u003Cp\u003E";
	pug_html = pug_html + "Je kunt elk moment stoppen en weer verdergaan met je studentnummer: ";
	pug_html = pug_html + (pug.escape(null == (pug_interp = uuid) ? "" : pug_interp)) + "\u003C\u002Fp\u003E\u003C\u002Fheader\u003E";
	if (data) {
	pug_html = pug_html + "\u003Cform method=\"POST\" action=\"\u002Fquestion\"\u003E";
	pug_html = pug_html + "\u003Cinput" + (" type=\"hidden\""+pug.attr("value", uuid, true, true)+" name=\"uuid\"") + "\u003E";
	pug_html = pug_html + "\u003Cinput type=\"hidden\" value=\"q1\" name=\"q\"\u003E";
	pug_html = pug_html + "\u003Cfieldset\u003E";
	pug_html = pug_html + "\u003Clegend\u003E";
	pug_html = pug_html + "Cijfer\u003C\u002Flegend\u003E";
	pug_html = pug_html + "\u003Clabel for=\"grade\"\u003E";
	pug_html = pug_html + " Hoe vond je de communicatie van de docenten en docent-assistenten over slack";
	pug_html = pug_html + "\u003Cdiv\u003E";
	pug_html = pug_html + "\u003Cinput" + (" id=\"grade\""+pug.attr("required", true, true, true)+" type=\"number\" name=\"grade\" min=\"1\" max=\"10\""+pug.attr("value", data.grade, true, true)) + "\u003E\u003C\u002Fdiv\u003E\u003C\u002Flabel\u003E\u003C\u002Ffieldset\u003E";
	pug_html = pug_html + "\u003Cfieldset\u003E";
	pug_html = pug_html + "\u003Clegend\u003E";
	pug_html = pug_html + "Beschrijving\u003C\u002Flegend\u003E";
	pug_html = pug_html + "\u003Clabel for=\"desc\"\u003E";
	pug_html = pug_html + " Zou je hier wat op willen aanmerken?";
	pug_html = pug_html + "\u003Ctextarea class=\"desc\" id=\"desc\" rows=\"4\" wrap=\"hard\" name=\"desc\"\u003E";
	pug_html = pug_html + (pug.escape(null == (pug_interp = data.desc) ? "" : pug_interp)) + "\u003C\u002Ftextarea\u003E\u003C\u002Flabel\u003E\u003C\u002Ffieldset\u003E";
	pug_html = pug_html + "\u003Cinput type=\"submit\" value=\"Volgende vraag\" name=\"action\"\u003E\u003C\u002Fform\u003E";
	}
	else {
	pug_html = pug_html + "\u003Cform method=\"POST\" action=\"\u002Fquestion\"\u003E";
	pug_html = pug_html + "\u003Cinput" + (" type=\"hidden\""+pug.attr("value", uuid, true, true)+" name=\"uuid\"") + "\u003E";
	pug_html = pug_html + "\u003Cinput type=\"hidden\" value=\"q1\" name=\"q\"\u003E";
	pug_html = pug_html + "\u003Cfieldset\u003E";
	pug_html = pug_html + "\u003Clegend\u003E";
	pug_html = pug_html + "Cijfer\u003C\u002Flegend\u003E";
	pug_html = pug_html + "\u003Clabel for=\"grade\"\u003E";
	pug_html = pug_html + " Hoe vond je de communicatie van de docenten en docent-assistenten over slack";
	pug_html = pug_html + "\u003Cinput id=\"grade\" required type=\"number\" name=\"grade\" min=\"1\" max=\"10\"\u003E\u003C\u002Flabel\u003E\u003C\u002Ffieldset\u003E";
	pug_html = pug_html + "\u003Cfieldset\u003E";
	pug_html = pug_html + "\u003Clegend\u003E";
	pug_html = pug_html + "Beschrijving\u003C\u002Flegend\u003E";
	pug_html = pug_html + "\u003Clabel for=\"desc\"\u003E";
	pug_html = pug_html + " Zou je hier wat op willen aanmerken?";
	pug_html = pug_html + "\u003Ctextarea id=\"desc\" rows=\"4\" wrap=\"hard\" name=\"desc\"\u003E\u003C\u002Ftextarea\u003E\u003C\u002Flabel\u003E\u003C\u002Ffieldset\u003E";
	pug_html = pug_html + "\u003Cinput type=\"submit\" value=\"Volgende vraag\" name=\"action\"\u003E\u003C\u002Fform\u003E";
	}
	pug_html = pug_html + "\u003C\u002Farticle\u003E\u003C\u002Fmain\u003E";
	pug_html = pug_html + "\u003Cfooter\u003E";
	pug_html = pug_html + "\u003Cdiv\u003E";
	pug_html = pug_html + "MIT © CMD Amsterdam, docs and images are CC-BY-4.0.\u003C\u002Fdiv\u003E\u003C\u002Ffooter\u003E\u003C\u002Fdiv\u003E";
	pug_html = pug_html + "\u003Cscript type=\"text\u002Fjavascript\"\u003E";
	pug_html = pug_html + "if ( 'serviceWorker' in navigator ) {";
	pug_html = pug_html + "\n";
	pug_html = pug_html + "    window.addEventListener ( 'load', function () {";
	pug_html = pug_html + "\n";
	pug_html = pug_html + "        navigator.serviceWorker.register ( '\u002Fsw.js' ).then ( function ( registration ) {";
	pug_html = pug_html + "\n";
	pug_html = pug_html + "            registration.update ()";
	pug_html = pug_html + "\n";
	pug_html = pug_html + "        }, function ( err ) {";
	pug_html = pug_html + "\n";
	pug_html = pug_html + "            console.log ( 'ServiceWorker registration failed: ', err );";
	pug_html = pug_html + "\n";
	pug_html = pug_html + "        } );";
	pug_html = pug_html + "\n";
	pug_html = pug_html + "    } );";
	pug_html = pug_html + "\n";
	pug_html = pug_html + "}\u003C\u002Fscript\u003E";
	}.call(this,"data" in locals_for_with?locals_for_with.data:typeof data!=="undefined"?data:undefined,"pageTitle" in locals_for_with?locals_for_with.pageTitle:typeof pageTitle!=="undefined"?pageTitle:undefined,"progress" in locals_for_with?locals_for_with.progress:typeof progress!=="undefined"?progress:undefined,"uuid" in locals_for_with?locals_for_with.uuid:typeof uuid!=="undefined"?uuid:undefined));} catch (err) {pug.rethrow(err, pug_debug_filename, pug_debug_line, pug_debug_sources[pug_debug_filename]);}return pug_html;}

	function q2Fn(locals) {var pug_html = "", pug_interp;var pug_debug_filename, pug_debug_line;try {var pug_debug_sources = {};
	;var locals_for_with = (locals || {});(function (data, pageTitle, progress, uuid) {
	pug_html = pug_html + "\u003Cdiv class=\"app\"\u003E";
	pug_html = pug_html + "\u003Cheader\u003E";
	pug_html = pug_html + "\u003Cdiv class=\"title\"\u003E";
	pug_html = pug_html + "\u003Ch1\u003E";
	pug_html = pug_html + " ";
	pug_html = pug_html + (pug.escape(null == (pug_interp = pageTitle) ? "" : pug_interp)) + "\u003C\u002Fh1\u003E\u003C\u002Fdiv\u003E\u003C\u002Fheader\u003E";
	if (progress) {
	pug_html = pug_html + "\u003Cprogress" + (pug.attr("value", progress, true, true)+" max=\"6\"") + "\u003E";
	pug_html = pug_html + (pug.escape(null == (pug_interp = progress) ? "" : pug_interp));
	pug_html = pug_html + "\u002F6\u003C\u002Fprogress\u003E";
	}
	pug_html = pug_html + "\u003Cmain\u003E";
	pug_html = pug_html + "\u003Carticle\u003E";
	pug_html = pug_html + "\u003Cheader\u003E";
	pug_html = pug_html + "\u003Cp\u003E";
	pug_html = pug_html + "Je kunt elk moment stoppen en weer verdergaan met je studentnummer: ";
	pug_html = pug_html + (pug.escape(null == (pug_interp = uuid) ? "" : pug_interp)) + "\u003C\u002Fp\u003E\u003C\u002Fheader\u003E";
	if (data) {
	pug_html = pug_html + "\u003Cform method=\"POST\" action=\"\u002Fquestion\"\u003E";
	pug_html = pug_html + "\u003Cinput" + (" type=\"hidden\""+pug.attr("value", uuid, true, true)+" name=\"uuid\"") + "\u003E";
	pug_html = pug_html + "\u003Cinput type=\"hidden\" value=\"q2\" name=\"q\"\u003E";
	pug_html = pug_html + "\u003Cfieldset\u003E";
	pug_html = pug_html + "\u003Clegend\u003E";
	pug_html = pug_html + "Cijfer\u003C\u002Flegend\u003E";
	pug_html = pug_html + "\u003Clabel for=\"grade\"\u003E";
	pug_html = pug_html + " Hoe vond je de digitale colleges over Jitsi";
	pug_html = pug_html + "\u003Cdiv\u003E";
	pug_html = pug_html + "\u003Cinput" + (" id=\"grade\""+pug.attr("required", true, true, true)+" type=\"number\" name=\"grade\" min=\"1\" max=\"10\""+pug.attr("value", data.grade, true, true)) + "\u003E\u003C\u002Fdiv\u003E\u003C\u002Flabel\u003E\u003C\u002Ffieldset\u003E";
	pug_html = pug_html + "\u003Cfieldset\u003E";
	pug_html = pug_html + "\u003Clegend\u003E";
	pug_html = pug_html + "Beschrijving\u003C\u002Flegend\u003E";
	pug_html = pug_html + "\u003Clabel for=\"desc\"\u003E";
	pug_html = pug_html + " Zou je hier wat op willen aanmerken?";
	pug_html = pug_html + "\u003Ctextarea class=\"desc\" id=\"desc\" rows=\"4\" wrap=\"hard\" name=\"desc\"\u003E";
	pug_html = pug_html + (pug.escape(null == (pug_interp = data.desc) ? "" : pug_interp)) + "\u003C\u002Ftextarea\u003E\u003C\u002Flabel\u003E\u003C\u002Ffieldset\u003E";
	pug_html = pug_html + "\u003Cinput type=\"submit\" value=\"Vorige vraag\" name=\"action\"\u003E";
	pug_html = pug_html + "\u003Cinput type=\"submit\" value=\"Volgende vraag\" name=\"action\"\u003E\u003C\u002Fform\u003E";
	}
	else {
	pug_html = pug_html + "\u003Cform method=\"POST\" action=\"\u002Fquestion\"\u003E";
	pug_html = pug_html + "\u003Cinput" + (" type=\"hidden\""+pug.attr("value", uuid, true, true)+" name=\"uuid\"") + "\u003E";
	pug_html = pug_html + "\u003Cinput type=\"hidden\" value=\"q2\" name=\"q\"\u003E";
	pug_html = pug_html + "\u003Cfieldset\u003E";
	pug_html = pug_html + "\u003Clegend\u003E";
	pug_html = pug_html + "Cijfer\u003C\u002Flegend\u003E";
	pug_html = pug_html + "\u003Clabel for=\"grade\"\u003E";
	pug_html = pug_html + " Hoe vond je de digitale colleges over Jitsi";
	pug_html = pug_html + "\u003Cinput id=\"grade\" required type=\"number\" name=\"grade\" min=\"1\" max=\"10\"\u003E\u003C\u002Flabel\u003E\u003C\u002Ffieldset\u003E";
	pug_html = pug_html + "\u003Cfieldset\u003E";
	pug_html = pug_html + "\u003Clegend\u003E";
	pug_html = pug_html + "Beschrijving\u003C\u002Flegend\u003E";
	pug_html = pug_html + "\u003Clabel for=\"desc\"\u003E";
	pug_html = pug_html + " Zou je hier wat op willen aanmerken?";
	pug_html = pug_html + "\u003Ctextarea id=\"desc\" rows=\"4\" wrap=\"hard\" name=\"desc\"\u003E\u003C\u002Ftextarea\u003E\u003C\u002Flabel\u003E\u003C\u002Ffieldset\u003E";
	pug_html = pug_html + "\u003Cinput type=\"submit\" value=\"Vorige vraag\" name=\"action\"\u003E";
	pug_html = pug_html + "\u003Cinput type=\"submit\" value=\"Volgende vraag\" name=\"action\"\u003E\u003C\u002Fform\u003E";
	}
	pug_html = pug_html + "\u003C\u002Farticle\u003E\u003C\u002Fmain\u003E";
	pug_html = pug_html + "\u003Cfooter\u003E";
	pug_html = pug_html + "\u003Cdiv\u003E";
	pug_html = pug_html + "MIT © CMD Amsterdam, docs and images are CC-BY-4.0.\u003C\u002Fdiv\u003E\u003C\u002Ffooter\u003E\u003C\u002Fdiv\u003E";
	pug_html = pug_html + "\u003Cscript type=\"text\u002Fjavascript\"\u003E";
	pug_html = pug_html + "if ( 'serviceWorker' in navigator ) {";
	pug_html = pug_html + "\n";
	pug_html = pug_html + "    window.addEventListener ( 'load', function () {";
	pug_html = pug_html + "\n";
	pug_html = pug_html + "        navigator.serviceWorker.register ( '\u002Fsw.js' ).then ( function ( registration ) {";
	pug_html = pug_html + "\n";
	pug_html = pug_html + "            registration.update ()";
	pug_html = pug_html + "\n";
	pug_html = pug_html + "        }, function ( err ) {";
	pug_html = pug_html + "\n";
	pug_html = pug_html + "            console.log ( 'ServiceWorker registration failed: ', err );";
	pug_html = pug_html + "\n";
	pug_html = pug_html + "        } );";
	pug_html = pug_html + "\n";
	pug_html = pug_html + "    } );";
	pug_html = pug_html + "\n";
	pug_html = pug_html + "}\u003C\u002Fscript\u003E";
	}.call(this,"data" in locals_for_with?locals_for_with.data:typeof data!=="undefined"?data:undefined,"pageTitle" in locals_for_with?locals_for_with.pageTitle:typeof pageTitle!=="undefined"?pageTitle:undefined,"progress" in locals_for_with?locals_for_with.progress:typeof progress!=="undefined"?progress:undefined,"uuid" in locals_for_with?locals_for_with.uuid:typeof uuid!=="undefined"?uuid:undefined));} catch (err) {pug.rethrow(err, pug_debug_filename, pug_debug_line, pug_debug_sources[pug_debug_filename]);}return pug_html;}

	function q3Fn(locals) {var pug_html = "", pug_interp;var pug_debug_filename, pug_debug_line;try {var pug_debug_sources = {};
	;var locals_for_with = (locals || {});(function (data, pageTitle, progress, uuid) {
	pug_html = pug_html + "\u003Cdiv class=\"app\"\u003E";
	pug_html = pug_html + "\u003Cheader\u003E";
	pug_html = pug_html + "\u003Cdiv class=\"title\"\u003E";
	pug_html = pug_html + "\u003Ch1\u003E";
	pug_html = pug_html + " ";
	pug_html = pug_html + (pug.escape(null == (pug_interp = pageTitle) ? "" : pug_interp)) + "\u003C\u002Fh1\u003E\u003C\u002Fdiv\u003E\u003C\u002Fheader\u003E";
	if (progress) {
	pug_html = pug_html + "\u003Cprogress" + (pug.attr("value", progress, true, true)+" max=\"6\"") + "\u003E";
	pug_html = pug_html + (pug.escape(null == (pug_interp = progress) ? "" : pug_interp));
	pug_html = pug_html + "\u002F6\u003C\u002Fprogress\u003E";
	}
	pug_html = pug_html + "\u003Cmain\u003E";
	pug_html = pug_html + "\u003Carticle\u003E";
	pug_html = pug_html + "\u003Cheader\u003E";
	pug_html = pug_html + "\u003Cp\u003E";
	pug_html = pug_html + "Je kunt elk moment stoppen en weer verdergaan met je studentnummer: ";
	pug_html = pug_html + (pug.escape(null == (pug_interp = uuid) ? "" : pug_interp)) + "\u003C\u002Fp\u003E\u003C\u002Fheader\u003E";
	if (data) {
	pug_html = pug_html + "\u003Cform method=\"POST\" action=\"\u002Fquestion\"\u003E";
	pug_html = pug_html + "\u003Cinput" + (" type=\"hidden\""+pug.attr("value", uuid, true, true)+" name=\"uuid\"") + "\u003E";
	pug_html = pug_html + "\u003Cinput type=\"hidden\" value=\"q3\" name=\"q\"\u003E";
	pug_html = pug_html + "\u003Cfieldset\u003E";
	pug_html = pug_html + "\u003Clegend\u003E";
	pug_html = pug_html + "Cijfer\u003C\u002Flegend\u003E";
	pug_html = pug_html + "\u003Clabel for=\"grade\"\u003E";
	pug_html = pug_html + " Hoe vond je de digitale colleges over Bongo";
	pug_html = pug_html + "\u003Cdiv\u003E";
	pug_html = pug_html + "\u003Cinput" + (" id=\"grade\""+pug.attr("required", true, true, true)+" type=\"number\" name=\"grade\" min=\"1\" max=\"10\""+pug.attr("value", data.grade, true, true)) + "\u003E\u003C\u002Fdiv\u003E\u003C\u002Flabel\u003E\u003C\u002Ffieldset\u003E";
	pug_html = pug_html + "\u003Cfieldset\u003E";
	pug_html = pug_html + "\u003Clegend\u003E";
	pug_html = pug_html + "Beschrijving\u003C\u002Flegend\u003E";
	pug_html = pug_html + "\u003Clabel for=\"desc\"\u003E";
	pug_html = pug_html + " Zou je hier wat op willen aanmerken?";
	pug_html = pug_html + "\u003Ctextarea class=\"desc\" id=\"desc\" rows=\"4\" wrap=\"hard\" name=\"desc\"\u003E";
	pug_html = pug_html + (pug.escape(null == (pug_interp = data.desc) ? "" : pug_interp)) + "\u003C\u002Ftextarea\u003E\u003C\u002Flabel\u003E\u003C\u002Ffieldset\u003E";
	pug_html = pug_html + "\u003Cinput type=\"submit\" value=\"Vorige vraag\" name=\"action\"\u003E";
	pug_html = pug_html + "\u003Cinput type=\"submit\" value=\"Volgende vraag\" name=\"action\"\u003E\u003C\u002Fform\u003E";
	}
	else {
	pug_html = pug_html + "\u003Cform method=\"POST\" action=\"\u002Fquestion\"\u003E";
	pug_html = pug_html + "\u003Cinput" + (" type=\"hidden\""+pug.attr("value", uuid, true, true)+" name=\"uuid\"") + "\u003E";
	pug_html = pug_html + "\u003Cinput type=\"hidden\" value=\"q3\" name=\"q\"\u003E";
	pug_html = pug_html + "\u003Cfieldset\u003E";
	pug_html = pug_html + "\u003Clegend\u003E";
	pug_html = pug_html + "Cijfer\u003C\u002Flegend\u003E";
	pug_html = pug_html + "\u003Clabel for=\"grade\"\u003E";
	pug_html = pug_html + " Hoe vond je de digitale colleges over Bongo";
	pug_html = pug_html + "\u003Cdiv\u003E";
	pug_html = pug_html + "\u003Cinput id=\"grade\" required type=\"number\" name=\"grade\" min=\"1\" max=\"10\"\u003E\u003C\u002Fdiv\u003E\u003C\u002Flabel\u003E\u003C\u002Ffieldset\u003E";
	pug_html = pug_html + "\u003Cfieldset\u003E";
	pug_html = pug_html + "\u003Clegend\u003E";
	pug_html = pug_html + "Beschrijving\u003C\u002Flegend\u003E";
	pug_html = pug_html + "\u003Clabel for=\"desc\"\u003E";
	pug_html = pug_html + " Zou je hier wat op willen aanmerken?";
	pug_html = pug_html + "\u003Ctextarea class=\"desc\" id=\"desc\" rows=\"4\" wrap=\"hard\" name=\"desc\"\u003E\u003C\u002Ftextarea\u003E\u003C\u002Flabel\u003E\u003C\u002Ffieldset\u003E";
	pug_html = pug_html + "\u003Cinput type=\"submit\" value=\"Vorige vraag\" name=\"action\"\u003E";
	pug_html = pug_html + "\u003Cinput type=\"submit\" value=\"Volgende vraag\" name=\"action\"\u003E\u003C\u002Fform\u003E";
	}
	pug_html = pug_html + "\u003C\u002Farticle\u003E\u003C\u002Fmain\u003E";
	pug_html = pug_html + "\u003Cfooter\u003E";
	pug_html = pug_html + "\u003Cdiv\u003E";
	pug_html = pug_html + "MIT © CMD Amsterdam, docs and images are CC-BY-4.0.\u003C\u002Fdiv\u003E\u003C\u002Ffooter\u003E\u003C\u002Fdiv\u003E";
	pug_html = pug_html + "\u003Cscript type=\"text\u002Fjavascript\"\u003E";
	pug_html = pug_html + "if ( 'serviceWorker' in navigator ) {";
	pug_html = pug_html + "\n";
	pug_html = pug_html + "    window.addEventListener ( 'load', function () {";
	pug_html = pug_html + "\n";
	pug_html = pug_html + "        navigator.serviceWorker.register ( '\u002Fsw.js' ).then ( function ( registration ) {";
	pug_html = pug_html + "\n";
	pug_html = pug_html + "            registration.update ()";
	pug_html = pug_html + "\n";
	pug_html = pug_html + "        }, function ( err ) {";
	pug_html = pug_html + "\n";
	pug_html = pug_html + "            console.log ( 'ServiceWorker registration failed: ', err );";
	pug_html = pug_html + "\n";
	pug_html = pug_html + "        } );";
	pug_html = pug_html + "\n";
	pug_html = pug_html + "    } );";
	pug_html = pug_html + "\n";
	pug_html = pug_html + "}\u003C\u002Fscript\u003E";
	}.call(this,"data" in locals_for_with?locals_for_with.data:typeof data!=="undefined"?data:undefined,"pageTitle" in locals_for_with?locals_for_with.pageTitle:typeof pageTitle!=="undefined"?pageTitle:undefined,"progress" in locals_for_with?locals_for_with.progress:typeof progress!=="undefined"?progress:undefined,"uuid" in locals_for_with?locals_for_with.uuid:typeof uuid!=="undefined"?uuid:undefined));} catch (err) {pug.rethrow(err, pug_debug_filename, pug_debug_line, pug_debug_sources[pug_debug_filename]);}return pug_html;}

	function q4Fn(locals) {var pug_html = "", pug_interp;var pug_debug_filename, pug_debug_line;try {var pug_debug_sources = {};
	;var locals_for_with = (locals || {});(function (data, pageTitle, progress, uuid) {
	pug_html = pug_html + "\u003Cdiv class=\"app\"\u003E";
	pug_html = pug_html + "\u003Cheader\u003E";
	pug_html = pug_html + "\u003Cdiv class=\"title\"\u003E";
	pug_html = pug_html + "\u003Ch1\u003E";
	pug_html = pug_html + " ";
	pug_html = pug_html + (pug.escape(null == (pug_interp = pageTitle) ? "" : pug_interp)) + "\u003C\u002Fh1\u003E\u003C\u002Fdiv\u003E\u003C\u002Fheader\u003E";
	if (progress) {
	pug_html = pug_html + "\u003Cprogress" + (pug.attr("value", progress, true, true)+" max=\"6\"") + "\u003E";
	pug_html = pug_html + (pug.escape(null == (pug_interp = progress) ? "" : pug_interp));
	pug_html = pug_html + "\u002F6\u003C\u002Fprogress\u003E";
	}
	pug_html = pug_html + "\u003Cmain\u003E";
	pug_html = pug_html + "\u003Carticle\u003E";
	pug_html = pug_html + "\u003Cheader\u003E";
	pug_html = pug_html + "\u003Cp\u003E";
	pug_html = pug_html + "Je kunt elk moment stoppen en weer verdergaan met je studentnummer: ";
	pug_html = pug_html + (pug.escape(null == (pug_interp = uuid) ? "" : pug_interp)) + "\u003C\u002Fp\u003E\u003C\u002Fheader\u003E";
	if (data) {
	pug_html = pug_html + "\u003Cform method=\"POST\" action=\"\u002Fquestion\"\u003E";
	pug_html = pug_html + "\u003Cinput" + (" type=\"hidden\""+pug.attr("value", uuid, true, true)+" name=\"uuid\"") + "\u003E";
	pug_html = pug_html + "\u003Cinput type=\"hidden\" value=\"q4\" name=\"q\"\u003E";
	pug_html = pug_html + "\u003Cfieldset\u003E";
	pug_html = pug_html + "\u003Clegend\u003E";
	pug_html = pug_html + "Cijfer\u003C\u002Flegend\u003E";
	pug_html = pug_html + "\u003Clabel for=\"grade\"\u003E";
	pug_html = pug_html + " Hoe vond je de hulp van je mede-studenten tijdens de weken thuis?";
	pug_html = pug_html + "\u003Cdiv\u003E";
	pug_html = pug_html + "\u003Cinput" + (" id=\"grade\""+pug.attr("required", true, true, true)+" type=\"number\" name=\"grade\" min=\"1\" max=\"10\""+pug.attr("value", data.grade, true, true)) + "\u003E\u003C\u002Fdiv\u003E\u003C\u002Flabel\u003E\u003C\u002Ffieldset\u003E";
	pug_html = pug_html + "\u003Cfieldset\u003E";
	pug_html = pug_html + "\u003Clegend\u003E";
	pug_html = pug_html + "Beschrijving\u003C\u002Flegend\u003E";
	pug_html = pug_html + "\u003Clabel for=\"desc\"\u003E";
	pug_html = pug_html + " Zou je hier wat op willen aanmerken?";
	pug_html = pug_html + "\u003Ctextarea class=\"desc\" id=\"desc\" rows=\"4\" wrap=\"hard\" name=\"desc\"\u003E";
	pug_html = pug_html + (pug.escape(null == (pug_interp = data.desc) ? "" : pug_interp)) + "\u003C\u002Ftextarea\u003E\u003C\u002Flabel\u003E\u003C\u002Ffieldset\u003E";
	pug_html = pug_html + "\u003Cinput type=\"submit\" value=\"Vorige vraag\" name=\"action\"\u003E";
	pug_html = pug_html + "\u003Cinput type=\"submit\" value=\"Volgende vraag\" name=\"action\"\u003E\u003C\u002Fform\u003E";
	}
	else {
	pug_html = pug_html + "\u003Cform method=\"POST\" action=\"\u002Fquestion\"\u003E";
	pug_html = pug_html + "\u003Cinput" + (" type=\"hidden\""+pug.attr("value", uuid, true, true)+" name=\"uuid\"") + "\u003E";
	pug_html = pug_html + "\u003Cinput type=\"hidden\" value=\"q4\" name=\"q\"\u003E";
	pug_html = pug_html + "\u003Cfieldset\u003E";
	pug_html = pug_html + "\u003Clegend\u003E";
	pug_html = pug_html + "Cijfer\u003C\u002Flegend\u003E";
	pug_html = pug_html + "\u003Clabel for=\"grade\"\u003E";
	pug_html = pug_html + " Hoe vond je de hulp van je mede-studenten tijdens de weken thuis?";
	pug_html = pug_html + "\u003Cdiv\u003E";
	pug_html = pug_html + "\u003Cinput id=\"grade\" required type=\"number\" name=\"grade\" min=\"1\" max=\"10\"\u003E\u003C\u002Fdiv\u003E\u003C\u002Flabel\u003E\u003C\u002Ffieldset\u003E";
	pug_html = pug_html + "\u003Cfieldset\u003E";
	pug_html = pug_html + "\u003Clegend\u003E";
	pug_html = pug_html + "Beschrijving\u003C\u002Flegend\u003E";
	pug_html = pug_html + "\u003Clabel for=\"desc\"\u003E";
	pug_html = pug_html + " Zou je hier wat op willen aanmerken?";
	pug_html = pug_html + "\u003Ctextarea class=\"desc\" id=\"desc\" rows=\"4\" wrap=\"hard\" name=\"desc\"\u003E\u003C\u002Ftextarea\u003E\u003C\u002Flabel\u003E\u003C\u002Ffieldset\u003E";
	pug_html = pug_html + "\u003Cinput type=\"submit\" value=\"Vorige vraag\" name=\"action\"\u003E";
	pug_html = pug_html + "\u003Cinput type=\"submit\" value=\"Volgende vraag\" name=\"action\"\u003E\u003C\u002Fform\u003E";
	}
	pug_html = pug_html + "\u003C\u002Farticle\u003E\u003C\u002Fmain\u003E";
	pug_html = pug_html + "\u003Cfooter\u003E";
	pug_html = pug_html + "\u003Cdiv\u003E";
	pug_html = pug_html + "MIT © CMD Amsterdam, docs and images are CC-BY-4.0.\u003C\u002Fdiv\u003E\u003C\u002Ffooter\u003E\u003C\u002Fdiv\u003E";
	pug_html = pug_html + "\u003Cscript type=\"text\u002Fjavascript\"\u003E";
	pug_html = pug_html + "if ( 'serviceWorker' in navigator ) {";
	pug_html = pug_html + "\n";
	pug_html = pug_html + "    window.addEventListener ( 'load', function () {";
	pug_html = pug_html + "\n";
	pug_html = pug_html + "        navigator.serviceWorker.register ( '\u002Fsw.js' ).then ( function ( registration ) {";
	pug_html = pug_html + "\n";
	pug_html = pug_html + "            registration.update ()";
	pug_html = pug_html + "\n";
	pug_html = pug_html + "        }, function ( err ) {";
	pug_html = pug_html + "\n";
	pug_html = pug_html + "            console.log ( 'ServiceWorker registration failed: ', err );";
	pug_html = pug_html + "\n";
	pug_html = pug_html + "        } );";
	pug_html = pug_html + "\n";
	pug_html = pug_html + "    } );";
	pug_html = pug_html + "\n";
	pug_html = pug_html + "}\u003C\u002Fscript\u003E";
	}.call(this,"data" in locals_for_with?locals_for_with.data:typeof data!=="undefined"?data:undefined,"pageTitle" in locals_for_with?locals_for_with.pageTitle:typeof pageTitle!=="undefined"?pageTitle:undefined,"progress" in locals_for_with?locals_for_with.progress:typeof progress!=="undefined"?progress:undefined,"uuid" in locals_for_with?locals_for_with.uuid:typeof uuid!=="undefined"?uuid:undefined));} catch (err) {pug.rethrow(err, pug_debug_filename, pug_debug_line, pug_debug_sources[pug_debug_filename]);}return pug_html;}

	function q5Fn(locals) {var pug_html = "", pug_interp;var pug_debug_filename, pug_debug_line;try {var pug_debug_sources = {};
	;var locals_for_with = (locals || {});(function (data, pageTitle, progress, uuid) {
	pug_html = pug_html + "\u003Cdiv class=\"app\"\u003E";
	pug_html = pug_html + "\u003Cheader\u003E";
	pug_html = pug_html + "\u003Cdiv class=\"title\"\u003E";
	pug_html = pug_html + "\u003Ch1\u003E";
	pug_html = pug_html + " ";
	pug_html = pug_html + (pug.escape(null == (pug_interp = pageTitle) ? "" : pug_interp)) + "\u003C\u002Fh1\u003E\u003C\u002Fdiv\u003E\u003C\u002Fheader\u003E";
	if (progress) {
	pug_html = pug_html + "\u003Cprogress" + (pug.attr("value", progress, true, true)+" max=\"6\"") + "\u003E";
	pug_html = pug_html + (pug.escape(null == (pug_interp = progress) ? "" : pug_interp));
	pug_html = pug_html + "\u002F6\u003C\u002Fprogress\u003E";
	}
	pug_html = pug_html + "\u003Cmain\u003E";
	pug_html = pug_html + "\u003Carticle\u003E";
	pug_html = pug_html + "\u003Cheader\u003E";
	pug_html = pug_html + "\u003Cp\u003E";
	pug_html = pug_html + "Je kunt elk moment stoppen en weer verdergaan met je studentnummer: ";
	pug_html = pug_html + (pug.escape(null == (pug_interp = uuid) ? "" : pug_interp)) + "\u003C\u002Fp\u003E\u003C\u002Fheader\u003E";
	if (data) {
	pug_html = pug_html + "\u003Cform method=\"POST\" action=\"\u002Fquestion\"\u003E";
	pug_html = pug_html + "\u003Cinput" + (" type=\"hidden\""+pug.attr("value", uuid, true, true)+" name=\"uuid\"") + "\u003E";
	pug_html = pug_html + "\u003Cinput type=\"hidden\" value=\"q5\" name=\"q\"\u003E";
	pug_html = pug_html + "\u003Cfieldset\u003E";
	pug_html = pug_html + "\u003Clegend\u003E";
	pug_html = pug_html + "Cijfer\u003C\u002Flegend\u003E";
	pug_html = pug_html + "\u003Clabel for=\"grade\"\u003E";
	pug_html = pug_html + " Hoe vaak heb je gegamed tussendoor?";
	pug_html = pug_html + "\u003Cdiv\u003E";
	pug_html = pug_html + "\u003Cinput" + (" id=\"grade\""+pug.attr("required", true, true, true)+" type=\"number\" name=\"grade\" min=\"1\" max=\"10\""+pug.attr("value", data.grade, true, true)) + "\u003E\u003C\u002Fdiv\u003E\u003C\u002Flabel\u003E\u003C\u002Ffieldset\u003E";
	pug_html = pug_html + "\u003Cfieldset\u003E";
	pug_html = pug_html + "\u003Clegend\u003E";
	pug_html = pug_html + "Beschrijving\u003C\u002Flegend\u003E";
	pug_html = pug_html + "\u003Clabel for=\"desc\"\u003E";
	pug_html = pug_html + " Zou je hier wat op willen aanmerken?";
	pug_html = pug_html + "\u003Ctextarea class=\"desc\" id=\"desc\" rows=\"4\" wrap=\"hard\" name=\"desc\"\u003E";
	pug_html = pug_html + (pug.escape(null == (pug_interp = data.desc) ? "" : pug_interp)) + "\u003C\u002Ftextarea\u003E\u003C\u002Flabel\u003E\u003C\u002Ffieldset\u003E";
	pug_html = pug_html + "\u003Cinput type=\"submit\" value=\"Vorige vraag\" name=\"action\"\u003E";
	pug_html = pug_html + "\u003Cinput type=\"submit\" value=\"Afronden\" name=\"action\"\u003E\u003C\u002Fform\u003E";
	}
	else {
	pug_html = pug_html + "\u003Cform method=\"POST\" action=\"\u002Fquestion\"\u003E";
	pug_html = pug_html + "\u003Cinput" + (" type=\"hidden\""+pug.attr("value", uuid, true, true)+" name=\"uuid\"") + "\u003E";
	pug_html = pug_html + "\u003Cinput type=\"hidden\" value=\"q5\" name=\"q\"\u003E";
	pug_html = pug_html + "\u003Cfieldset\u003E";
	pug_html = pug_html + "\u003Clegend\u003E";
	pug_html = pug_html + "Cijfer\u003C\u002Flegend\u003E";
	pug_html = pug_html + "\u003Clabel for=\"grade\"\u003E";
	pug_html = pug_html + " Hoe vaak heb je gegamed tussendoor?";
	pug_html = pug_html + "\u003Cdiv\u003E";
	pug_html = pug_html + "\u003Cinput id=\"grade\" required type=\"number\" name=\"grade\" min=\"1\" max=\"10\"\u003E\u003C\u002Fdiv\u003E\u003C\u002Flabel\u003E\u003C\u002Ffieldset\u003E";
	pug_html = pug_html + "\u003Cfieldset\u003E";
	pug_html = pug_html + "\u003Clegend\u003E";
	pug_html = pug_html + "Beschrijving\u003C\u002Flegend\u003E";
	pug_html = pug_html + "\u003Clabel for=\"desc\"\u003E";
	pug_html = pug_html + " Zou je hier wat op willen aanmerken?";
	pug_html = pug_html + "\u003Ctextarea class=\"desc\" id=\"desc\" rows=\"4\" wrap=\"hard\" name=\"desc\"\u003E\u003C\u002Ftextarea\u003E\u003C\u002Flabel\u003E\u003C\u002Ffieldset\u003E";
	pug_html = pug_html + "\u003Cinput type=\"submit\" value=\"Vorige vraag\" name=\"action\"\u003E";
	pug_html = pug_html + "\u003Cinput type=\"submit\" value=\"Afronden\" name=\"action\"\u003E\u003C\u002Fform\u003E";
	}
	pug_html = pug_html + "\u003C\u002Farticle\u003E\u003C\u002Fmain\u003E";
	pug_html = pug_html + "\u003Cfooter\u003E";
	pug_html = pug_html + "\u003Cdiv\u003E";
	pug_html = pug_html + "MIT © CMD Amsterdam, docs and images are CC-BY-4.0.\u003C\u002Fdiv\u003E\u003C\u002Ffooter\u003E\u003C\u002Fdiv\u003E";
	pug_html = pug_html + "\u003Cscript type=\"text\u002Fjavascript\"\u003E";
	pug_html = pug_html + "if ( 'serviceWorker' in navigator ) {";
	pug_html = pug_html + "\n";
	pug_html = pug_html + "    window.addEventListener ( 'load', function () {";
	pug_html = pug_html + "\n";
	pug_html = pug_html + "        navigator.serviceWorker.register ( '\u002Fsw.js' ).then ( function ( registration ) {";
	pug_html = pug_html + "\n";
	pug_html = pug_html + "            registration.update ()";
	pug_html = pug_html + "\n";
	pug_html = pug_html + "        }, function ( err ) {";
	pug_html = pug_html + "\n";
	pug_html = pug_html + "            console.log ( 'ServiceWorker registration failed: ', err );";
	pug_html = pug_html + "\n";
	pug_html = pug_html + "        } );";
	pug_html = pug_html + "\n";
	pug_html = pug_html + "    } );";
	pug_html = pug_html + "\n";
	pug_html = pug_html + "}\u003C\u002Fscript\u003E";
	}.call(this,"data" in locals_for_with?locals_for_with.data:typeof data!=="undefined"?data:undefined,"pageTitle" in locals_for_with?locals_for_with.pageTitle:typeof pageTitle!=="undefined"?pageTitle:undefined,"progress" in locals_for_with?locals_for_with.progress:typeof progress!=="undefined"?progress:undefined,"uuid" in locals_for_with?locals_for_with.uuid:typeof uuid!=="undefined"?uuid:undefined));} catch (err) {pug.rethrow(err, pug_debug_filename, pug_debug_line, pug_debug_sources[pug_debug_filename]);}return pug_html;}

	function finishFn(locals) {var pug_html = "", pug_interp;var pug_debug_filename, pug_debug_line;try {var pug_debug_sources = {};
	;var locals_for_with = (locals || {});(function (data, pageTitle, progress, uuid) {
	pug_html = pug_html + "\u003Cdiv class=\"app\"\u003E";
	pug_html = pug_html + "\u003Cheader\u003E";
	pug_html = pug_html + "\u003Cdiv class=\"title\"\u003E";
	pug_html = pug_html + "\u003Ch1\u003E";
	pug_html = pug_html + " ";
	pug_html = pug_html + (pug.escape(null == (pug_interp = pageTitle) ? "" : pug_interp)) + "\u003C\u002Fh1\u003E\u003C\u002Fdiv\u003E\u003C\u002Fheader\u003E";
	if (progress) {
	pug_html = pug_html + "\u003Cprogress" + (pug.attr("value", progress, true, true)+" max=\"6\"") + "\u003E";
	pug_html = pug_html + (pug.escape(null == (pug_interp = progress) ? "" : pug_interp));
	pug_html = pug_html + "\u002F6\u003C\u002Fprogress\u003E";
	}
	pug_html = pug_html + "\u003Cmain\u003E";
	pug_html = pug_html + "\u003Carticle\u003E";
	pug_html = pug_html + "\u003Cheader\u003E";
	pug_html = pug_html + "\u003Cp\u003E";
	pug_html = pug_html + (pug.escape(null == (pug_interp = uuid) ? "" : pug_interp)) + "\u003C\u002Fp\u003E";
	pug_html = pug_html + "\u003Ch2\u003E";
	pug_html = pug_html + "Afronden\u003C\u002Fh2\u003E";
	pug_html = pug_html + "\u003Cprogress value=\"5\" max=\"5\"\u003E";
	pug_html = pug_html + "5\u002F5\u003C\u002Fprogress\u003E";
	pug_html = pug_html + "\u003Cform method=\"POST\" action=\"\u002Ffinish\"\u003E";
	pug_html = pug_html + "\u003Cinput" + (" type=\"hidden\""+pug.attr("value", uuid, true, true)+" name=\"uuid\"") + "\u003E";
	pug_html = pug_html + "\u003Cinput type=\"hidden\" value=\"finish\" name=\"q\"\u003E";
	pug_html = pug_html + "\u003Cfieldset name=\"q1\"\u003E";
	pug_html = pug_html + "\u003Clegend\u003E";
	pug_html = pug_html + "Vraag 1\u003C\u002Flegend\u003E";
	pug_html = pug_html + "\u003Cfieldset\u003E";
	pug_html = pug_html + "\u003Clegend\u003E";
	pug_html = pug_html + "Cijfer\u003C\u002Flegend\u003E";
	pug_html = pug_html + "\u003Clabel for=\"grade1\"\u003E";
	pug_html = pug_html + " Hoe vond je de communicatie van de docenten en docent-assistenten over slack";
	pug_html = pug_html + "\u003Cdiv\u003E";
	pug_html = pug_html + "\u003Cinput" + (" id=\"grade1\""+pug.attr("required", true, true, true)+" type=\"number\" name=\"grade1\" min=\"1\" max=\"10\""+pug.attr("value", data.q1.grade, true, true)) + "\u003E\u003C\u002Fdiv\u003E\u003C\u002Flabel\u003E\u003C\u002Ffieldset\u003E";
	pug_html = pug_html + "\u003Cfieldset\u003E";
	pug_html = pug_html + "\u003Clegend\u003E";
	pug_html = pug_html + "Beschrijving\u003C\u002Flegend\u003E";
	pug_html = pug_html + "\u003Clabel for=\"desc1\"\u003E";
	pug_html = pug_html + " Zou je hier wat op willen aanmerken?";
	pug_html = pug_html + "\u003Ctextarea class=\"desc\" id=\"desc1\" rows=\"4\" wrap=\"hard\" name=\"desc1\"\u003E";
	pug_html = pug_html + (pug.escape(null == (pug_interp = data.q1.desc) ? "" : pug_interp)) + "\u003C\u002Ftextarea\u003E\u003C\u002Flabel\u003E\u003C\u002Ffieldset\u003E\u003C\u002Ffieldset\u003E";
	pug_html = pug_html + "\u003Cfieldset name=\"q2\"\u003E";
	pug_html = pug_html + "\u003Clegend\u003E";
	pug_html = pug_html + "Vraag 2\u003C\u002Flegend\u003E";
	pug_html = pug_html + "\u003Cfieldset\u003E";
	pug_html = pug_html + "\u003Clegend\u003E";
	pug_html = pug_html + "Cijfer\u003C\u002Flegend\u003E";
	pug_html = pug_html + "\u003Clabel for=\"grade2\"\u003E";
	pug_html = pug_html + " Hoe vond je de digitale colleges over Jitsi";
	pug_html = pug_html + "\u003Cdiv\u003E";
	pug_html = pug_html + "\u003Cinput" + (" id=\"grade2\""+pug.attr("required", true, true, true)+" type=\"number\" name=\"grade2\" min=\"1\" max=\"10\""+pug.attr("value", data.q2.grade, true, true)) + "\u003E\u003C\u002Fdiv\u003E\u003C\u002Flabel\u003E\u003C\u002Ffieldset\u003E";
	pug_html = pug_html + "\u003Cfieldset\u003E";
	pug_html = pug_html + "\u003Clegend\u003E";
	pug_html = pug_html + "Beschrijving\u003C\u002Flegend\u003E";
	pug_html = pug_html + "\u003Clabel for=\"desc2\"\u003E";
	pug_html = pug_html + " Zou je hier wat op willen aanmerken?";
	pug_html = pug_html + "\u003Ctextarea class=\"desc\" id=\"desc2\" rows=\"4\" wrap=\"hard\" name=\"desc2\"\u003E";
	pug_html = pug_html + (pug.escape(null == (pug_interp = data.q2.desc) ? "" : pug_interp)) + "\u003C\u002Ftextarea\u003E\u003C\u002Flabel\u003E\u003C\u002Ffieldset\u003E\u003C\u002Ffieldset\u003E";
	pug_html = pug_html + "\u003Cfieldset name=\"q3\"\u003E";
	pug_html = pug_html + "\u003Clegend\u003E";
	pug_html = pug_html + "Vraag 3\u003C\u002Flegend\u003E";
	pug_html = pug_html + "\u003Cfieldset\u003E";
	pug_html = pug_html + "\u003Clegend\u003E";
	pug_html = pug_html + "Cijfer\u003C\u002Flegend\u003E";
	pug_html = pug_html + "\u003Clabel for=\"grade3\"\u003E";
	pug_html = pug_html + " Hoe vond je de digitale colleges over Bongo";
	pug_html = pug_html + "\u003Cdiv\u003E";
	pug_html = pug_html + "\u003Cinput" + (" id=\"grade3\""+pug.attr("required", true, true, true)+" type=\"number\" name=\"grade3\" min=\"1\" max=\"10\""+pug.attr("value", data.q3.grade, true, true)) + "\u003E\u003C\u002Fdiv\u003E\u003C\u002Flabel\u003E\u003C\u002Ffieldset\u003E";
	pug_html = pug_html + "\u003Cfieldset\u003E";
	pug_html = pug_html + "\u003Clegend\u003E";
	pug_html = pug_html + "Beschrijving\u003C\u002Flegend\u003E";
	pug_html = pug_html + "\u003Clabel for=\"desc3\"\u003E";
	pug_html = pug_html + " Zou je hier wat op willen aanmerken?";
	pug_html = pug_html + "\u003Ctextarea class=\"desc\" id=\"desc3\" rows=\"4\" wrap=\"hard\" name=\"desc3\"\u003E";
	pug_html = pug_html + (pug.escape(null == (pug_interp = data.q3.desc) ? "" : pug_interp)) + "\u003C\u002Ftextarea\u003E\u003C\u002Flabel\u003E\u003C\u002Ffieldset\u003E\u003C\u002Ffieldset\u003E";
	pug_html = pug_html + "\u003Cfieldset name=\"q4\"\u003E";
	pug_html = pug_html + "\u003Clegend\u003E";
	pug_html = pug_html + "Vraag 4\u003C\u002Flegend\u003E";
	pug_html = pug_html + "\u003Cfieldset\u003E";
	pug_html = pug_html + "\u003Clegend\u003E";
	pug_html = pug_html + "Cijfer\u003C\u002Flegend\u003E";
	pug_html = pug_html + "\u003Clabel for=\"grade4\"\u003E";
	pug_html = pug_html + " Hoe vond je de hulp van je mede-studenten tijdens de weken thuis?";
	pug_html = pug_html + "\u003Cdiv\u003E";
	pug_html = pug_html + "\u003Cinput" + (" id=\"grade4\""+pug.attr("required", true, true, true)+" type=\"number\" name=\"grade4\" min=\"1\" max=\"10\""+pug.attr("value", data.q4.grade, true, true)) + "\u003E\u003C\u002Fdiv\u003E\u003C\u002Flabel\u003E\u003C\u002Ffieldset\u003E";
	pug_html = pug_html + "\u003Cfieldset\u003E";
	pug_html = pug_html + "\u003Clegend\u003E";
	pug_html = pug_html + "Beschrijving\u003C\u002Flegend\u003E";
	pug_html = pug_html + "\u003Clabel for=\"desc4\"\u003E";
	pug_html = pug_html + " Zou je hier wat op willen aanmerken?";
	pug_html = pug_html + "\u003Ctextarea class=\"desc\" id=\"desc4\" rows=\"4\" wrap=\"hard\" name=\"desc4\"\u003E";
	pug_html = pug_html + (pug.escape(null == (pug_interp = data.q4.desc) ? "" : pug_interp)) + "\u003C\u002Ftextarea\u003E\u003C\u002Flabel\u003E\u003C\u002Ffieldset\u003E\u003C\u002Ffieldset\u003E";
	pug_html = pug_html + "\u003Cfieldset name=\"q5\"\u003E";
	pug_html = pug_html + "\u003Clegend\u003E";
	pug_html = pug_html + "Vraag 5\u003C\u002Flegend\u003E";
	pug_html = pug_html + "\u003Cfieldset\u003E";
	pug_html = pug_html + "\u003Clegend\u003E";
	pug_html = pug_html + "Cijfer\u003C\u002Flegend\u003E";
	pug_html = pug_html + "\u003Clabel for=\"grade5\"\u003E";
	pug_html = pug_html + " Hoe vaak heb je gegamed tussendoor?";
	pug_html = pug_html + "\u003Cdiv\u003E";
	pug_html = pug_html + "\u003Cinput" + (" id=\"grade5\""+pug.attr("required", true, true, true)+" type=\"number\" name=\"grade5\" min=\"1\" max=\"10\""+pug.attr("value", data.q5.grade, true, true)) + "\u003E\u003C\u002Fdiv\u003E\u003C\u002Flabel\u003E\u003C\u002Ffieldset\u003E";
	pug_html = pug_html + "\u003Cfieldset\u003E";
	pug_html = pug_html + "\u003Clegend\u003E";
	pug_html = pug_html + "Beschrijving\u003C\u002Flegend\u003E";
	pug_html = pug_html + "\u003Clabel for=\"desc5\"\u003E";
	pug_html = pug_html + " Zou je hier wat op willen aanmerken?";
	pug_html = pug_html + "\u003Ctextarea class=\"desc\" id=\"desc5\" rows=\"4\" wrap=\"hard\" name=\"desc5\"\u003E";
	pug_html = pug_html + (pug.escape(null == (pug_interp = data.q5.desc) ? "" : pug_interp)) + "\u003C\u002Ftextarea\u003E\u003C\u002Flabel\u003E\u003C\u002Ffieldset\u003E\u003C\u002Ffieldset\u003E";
	pug_html = pug_html + "\u003Cinput type=\"submit\" value=\"Versturen\"\u003E\u003C\u002Fform\u003E\u003C\u002Fheader\u003E\u003C\u002Farticle\u003E\u003C\u002Fmain\u003E";
	pug_html = pug_html + "\u003Cfooter\u003E";
	pug_html = pug_html + "\u003Cdiv\u003E";
	pug_html = pug_html + "MIT © CMD Amsterdam, docs and images are CC-BY-4.0.\u003C\u002Fdiv\u003E\u003C\u002Ffooter\u003E\u003C\u002Fdiv\u003E";
	pug_html = pug_html + "\u003Cscript type=\"text\u002Fjavascript\"\u003E";
	pug_html = pug_html + "if ( 'serviceWorker' in navigator ) {";
	pug_html = pug_html + "\n";
	pug_html = pug_html + "    window.addEventListener ( 'load', function () {";
	pug_html = pug_html + "\n";
	pug_html = pug_html + "        navigator.serviceWorker.register ( '\u002Fsw.js' ).then ( function ( registration ) {";
	pug_html = pug_html + "\n";
	pug_html = pug_html + "            registration.update ()";
	pug_html = pug_html + "\n";
	pug_html = pug_html + "        }, function ( err ) {";
	pug_html = pug_html + "\n";
	pug_html = pug_html + "            console.log ( 'ServiceWorker registration failed: ', err );";
	pug_html = pug_html + "\n";
	pug_html = pug_html + "        } );";
	pug_html = pug_html + "\n";
	pug_html = pug_html + "    } );";
	pug_html = pug_html + "\n";
	pug_html = pug_html + "}\u003C\u002Fscript\u003E";
	}.call(this,"data" in locals_for_with?locals_for_with.data:typeof data!=="undefined"?data:undefined,"pageTitle" in locals_for_with?locals_for_with.pageTitle:typeof pageTitle!=="undefined"?pageTitle:undefined,"progress" in locals_for_with?locals_for_with.progress:typeof progress!=="undefined"?progress:undefined,"uuid" in locals_for_with?locals_for_with.uuid:typeof uuid!=="undefined"?uuid:undefined));} catch (err) {pug.rethrow(err, pug_debug_filename, pug_debug_line, pug_debug_sources[pug_debug_filename]);}return pug_html;}

	function doneFn(locals) {var pug_html = "", pug_interp;var pug_debug_filename, pug_debug_line;try {var pug_debug_sources = {};
	;var locals_for_with = (locals || {});(function (fromBegin, pageTitle, progress, uuid) {
	pug_html = pug_html + "\u003Cdiv class=\"app\"\u003E";
	pug_html = pug_html + "\u003Cheader\u003E";
	pug_html = pug_html + "\u003Cdiv class=\"title\"\u003E";
	pug_html = pug_html + "\u003Ch1\u003E";
	pug_html = pug_html + " ";
	pug_html = pug_html + (pug.escape(null == (pug_interp = pageTitle) ? "" : pug_interp)) + "\u003C\u002Fh1\u003E\u003C\u002Fdiv\u003E\u003C\u002Fheader\u003E";
	if (progress) {
	pug_html = pug_html + "\u003Cprogress" + (pug.attr("value", progress, true, true)+" max=\"6\"") + "\u003E";
	pug_html = pug_html + (pug.escape(null == (pug_interp = progress) ? "" : pug_interp));
	pug_html = pug_html + "\u002F6\u003C\u002Fprogress\u003E";
	}
	pug_html = pug_html + "\u003Cmain\u003E";
	pug_html = pug_html + "\u003Carticle\u003E";
	pug_html = pug_html + "\u003Cheader\u003E";
	pug_html = pug_html + "\u003Cdiv class=\"done\"\u003E";
	pug_html = pug_html + "\u003Cp\u003E";
	pug_html = pug_html + (pug.escape(null == (pug_interp = uuid) ? "" : pug_interp)) + "\u003C\u002Fp\u003E";
	pug_html = pug_html + "\u003Cdiv class=\"content\"\u003E";
	if (!fromBegin) {
	pug_html = pug_html + "\u003Ch2\u003E";
	pug_html = pug_html + "Bedankt voor het invullen van de WebDev Minor Enquete over het digitale lesgeven\u003C\u002Fh2\u003E";
	pug_html = pug_html + "\u003Ch3\u003E";
	pug_html = pug_html + "✅\u003C\u002Fh3\u003E";
	pug_html = pug_html + "\u003Ca href=\"\u002F\"\u003E";
	pug_html = pug_html + "Terug naar het begin\u003C\u002Fa\u003E";
	}
	else {
	pug_html = pug_html + "\u003Ch2\u003E";
	pug_html = pug_html + "Je hebt de enquete al eens ingevuld, nogmaals bedankt voor het invullen van de WebDev Minor Enquete over het digitale lesgeven\u003C\u002Fh2\u003E";
	pug_html = pug_html + "\u003Ch3\u003E";
	pug_html = pug_html + "😬\u003C\u002Fh3\u003E";
	pug_html = pug_html + "\u003Ca href=\"\u002F\"\u003E";
	pug_html = pug_html + "Terug naar het begin\u003C\u002Fa\u003E";
	}
	pug_html = pug_html + "\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E\u003C\u002Fheader\u003E\u003C\u002Farticle\u003E\u003C\u002Fmain\u003E";
	pug_html = pug_html + "\u003Cfooter\u003E";
	pug_html = pug_html + "\u003Cdiv\u003E";
	pug_html = pug_html + "MIT © CMD Amsterdam, docs and images are CC-BY-4.0.\u003C\u002Fdiv\u003E\u003C\u002Ffooter\u003E\u003C\u002Fdiv\u003E";
	pug_html = pug_html + "\u003Cscript type=\"text\u002Fjavascript\"\u003E";
	pug_html = pug_html + "if ( 'serviceWorker' in navigator ) {";
	pug_html = pug_html + "\n";
	pug_html = pug_html + "    window.addEventListener ( 'load', function () {";
	pug_html = pug_html + "\n";
	pug_html = pug_html + "        navigator.serviceWorker.register ( '\u002Fsw.js' ).then ( function ( registration ) {";
	pug_html = pug_html + "\n";
	pug_html = pug_html + "            registration.update ()";
	pug_html = pug_html + "\n";
	pug_html = pug_html + "        }, function ( err ) {";
	pug_html = pug_html + "\n";
	pug_html = pug_html + "            console.log ( 'ServiceWorker registration failed: ', err );";
	pug_html = pug_html + "\n";
	pug_html = pug_html + "        } );";
	pug_html = pug_html + "\n";
	pug_html = pug_html + "    } );";
	pug_html = pug_html + "\n";
	pug_html = pug_html + "}\u003C\u002Fscript\u003E";
	}.call(this,"fromBegin" in locals_for_with?locals_for_with.fromBegin:typeof fromBegin!=="undefined"?fromBegin:undefined,"pageTitle" in locals_for_with?locals_for_with.pageTitle:typeof pageTitle!=="undefined"?pageTitle:undefined,"progress" in locals_for_with?locals_for_with.progress:typeof progress!=="undefined"?progress:undefined,"uuid" in locals_for_with?locals_for_with.uuid:typeof uuid!=="undefined"?uuid:undefined));} catch (err) {pug.rethrow(err, pug_debug_filename, pug_debug_line, pug_debug_sources[pug_debug_filename]);}return pug_html;}

	var support = {
	  searchParams: 'URLSearchParams' in self,
	  iterable: 'Symbol' in self && 'iterator' in Symbol,
	  blob: 'FileReader' in self && 'Blob' in self && function () {
	    try {
	      new Blob();
	      return true;
	    } catch (e) {
	      return false;
	    }
	  }(),
	  formData: 'FormData' in self,
	  arrayBuffer: 'ArrayBuffer' in self
	};

	function isDataView(obj) {
	  return obj && DataView.prototype.isPrototypeOf(obj);
	}

	if (support.arrayBuffer) {
	  var viewClasses = ['[object Int8Array]', '[object Uint8Array]', '[object Uint8ClampedArray]', '[object Int16Array]', '[object Uint16Array]', '[object Int32Array]', '[object Uint32Array]', '[object Float32Array]', '[object Float64Array]'];

	  var isArrayBufferView = ArrayBuffer.isView || function (obj) {
	    return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1;
	  };
	}

	function normalizeName(name) {
	  if (typeof name !== 'string') {
	    name = String(name);
	  }

	  if (/[^a-z0-9\-#$%&'*+.^_`|~]/i.test(name)) {
	    throw new TypeError('Invalid character in header field name');
	  }

	  return name.toLowerCase();
	}

	function normalizeValue(value) {
	  if (typeof value !== 'string') {
	    value = String(value);
	  }

	  return value;
	} // Build a destructive iterator for the value list


	function iteratorFor(items) {
	  var iterator = {
	    next: function () {
	      var value = items.shift();
	      return {
	        done: value === undefined,
	        value: value
	      };
	    }
	  };

	  if (support.iterable) {
	    iterator[Symbol.iterator] = function () {
	      return iterator;
	    };
	  }

	  return iterator;
	}

	function Headers(headers) {
	  this.map = {};

	  if (headers instanceof Headers) {
	    headers.forEach(function (value, name) {
	      this.append(name, value);
	    }, this);
	  } else if (Array.isArray(headers)) {
	    headers.forEach(function (header) {
	      this.append(header[0], header[1]);
	    }, this);
	  } else if (headers) {
	    Object.getOwnPropertyNames(headers).forEach(function (name) {
	      this.append(name, headers[name]);
	    }, this);
	  }
	}

	Headers.prototype.append = function (name, value) {
	  name = normalizeName(name);
	  value = normalizeValue(value);
	  var oldValue = this.map[name];
	  this.map[name] = oldValue ? oldValue + ', ' + value : value;
	};

	Headers.prototype['delete'] = function (name) {
	  delete this.map[normalizeName(name)];
	};

	Headers.prototype.get = function (name) {
	  name = normalizeName(name);
	  return this.has(name) ? this.map[name] : null;
	};

	Headers.prototype.has = function (name) {
	  return this.map.hasOwnProperty(normalizeName(name));
	};

	Headers.prototype.set = function (name, value) {
	  this.map[normalizeName(name)] = normalizeValue(value);
	};

	Headers.prototype.forEach = function (callback, thisArg) {
	  for (var name in this.map) {
	    if (this.map.hasOwnProperty(name)) {
	      callback.call(thisArg, this.map[name], name, this);
	    }
	  }
	};

	Headers.prototype.keys = function () {
	  var items = [];
	  this.forEach(function (value, name) {
	    items.push(name);
	  });
	  return iteratorFor(items);
	};

	Headers.prototype.values = function () {
	  var items = [];
	  this.forEach(function (value) {
	    items.push(value);
	  });
	  return iteratorFor(items);
	};

	Headers.prototype.entries = function () {
	  var items = [];
	  this.forEach(function (value, name) {
	    items.push([name, value]);
	  });
	  return iteratorFor(items);
	};

	if (support.iterable) {
	  Headers.prototype[Symbol.iterator] = Headers.prototype.entries;
	}

	function consumed(body) {
	  if (body.bodyUsed) {
	    return Promise.reject(new TypeError('Already read'));
	  }

	  body.bodyUsed = true;
	}

	function fileReaderReady(reader) {
	  return new Promise(function (resolve, reject) {
	    reader.onload = function () {
	      resolve(reader.result);
	    };

	    reader.onerror = function () {
	      reject(reader.error);
	    };
	  });
	}

	function readBlobAsArrayBuffer(blob) {
	  var reader = new FileReader();
	  var promise = fileReaderReady(reader);
	  reader.readAsArrayBuffer(blob);
	  return promise;
	}

	function readBlobAsText(blob) {
	  var reader = new FileReader();
	  var promise = fileReaderReady(reader);
	  reader.readAsText(blob);
	  return promise;
	}

	function readArrayBufferAsText(buf) {
	  var view = new Uint8Array(buf);
	  var chars = new Array(view.length);

	  for (var i = 0; i < view.length; i++) {
	    chars[i] = String.fromCharCode(view[i]);
	  }

	  return chars.join('');
	}

	function bufferClone(buf) {
	  if (buf.slice) {
	    return buf.slice(0);
	  } else {
	    var view = new Uint8Array(buf.byteLength);
	    view.set(new Uint8Array(buf));
	    return view.buffer;
	  }
	}

	function Body() {
	  this.bodyUsed = false;

	  this._initBody = function (body) {
	    this._bodyInit = body;

	    if (!body) {
	      this._bodyText = '';
	    } else if (typeof body === 'string') {
	      this._bodyText = body;
	    } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
	      this._bodyBlob = body;
	    } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
	      this._bodyFormData = body;
	    } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
	      this._bodyText = body.toString();
	    } else if (support.arrayBuffer && support.blob && isDataView(body)) {
	      this._bodyArrayBuffer = bufferClone(body.buffer); // IE 10-11 can't handle a DataView body.

	      this._bodyInit = new Blob([this._bodyArrayBuffer]);
	    } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
	      this._bodyArrayBuffer = bufferClone(body);
	    } else {
	      this._bodyText = body = Object.prototype.toString.call(body);
	    }

	    if (!this.headers.get('content-type')) {
	      if (typeof body === 'string') {
	        this.headers.set('content-type', 'text/plain;charset=UTF-8');
	      } else if (this._bodyBlob && this._bodyBlob.type) {
	        this.headers.set('content-type', this._bodyBlob.type);
	      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
	        this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
	      }
	    }
	  };

	  if (support.blob) {
	    this.blob = function () {
	      var rejected = consumed(this);

	      if (rejected) {
	        return rejected;
	      }

	      if (this._bodyBlob) {
	        return Promise.resolve(this._bodyBlob);
	      } else if (this._bodyArrayBuffer) {
	        return Promise.resolve(new Blob([this._bodyArrayBuffer]));
	      } else if (this._bodyFormData) {
	        throw new Error('could not read FormData body as blob');
	      } else {
	        return Promise.resolve(new Blob([this._bodyText]));
	      }
	    };

	    this.arrayBuffer = function () {
	      if (this._bodyArrayBuffer) {
	        return consumed(this) || Promise.resolve(this._bodyArrayBuffer);
	      } else {
	        return this.blob().then(readBlobAsArrayBuffer);
	      }
	    };
	  }

	  this.text = function () {
	    var rejected = consumed(this);

	    if (rejected) {
	      return rejected;
	    }

	    if (this._bodyBlob) {
	      return readBlobAsText(this._bodyBlob);
	    } else if (this._bodyArrayBuffer) {
	      return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer));
	    } else if (this._bodyFormData) {
	      throw new Error('could not read FormData body as text');
	    } else {
	      return Promise.resolve(this._bodyText);
	    }
	  };

	  if (support.formData) {
	    this.formData = function () {
	      return this.text().then(decode);
	    };
	  }

	  this.json = function () {
	    return this.text().then(JSON.parse);
	  };

	  return this;
	} // HTTP methods whose capitalization should be normalized


	var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];

	function normalizeMethod(method) {
	  var upcased = method.toUpperCase();
	  return methods.indexOf(upcased) > -1 ? upcased : method;
	}

	function Request(input, options) {
	  options = options || {};
	  var body = options.body;

	  if (input instanceof Request) {
	    if (input.bodyUsed) {
	      throw new TypeError('Already read');
	    }

	    this.url = input.url;
	    this.credentials = input.credentials;

	    if (!options.headers) {
	      this.headers = new Headers(input.headers);
	    }

	    this.method = input.method;
	    this.mode = input.mode;
	    this.signal = input.signal;

	    if (!body && input._bodyInit != null) {
	      body = input._bodyInit;
	      input.bodyUsed = true;
	    }
	  } else {
	    this.url = String(input);
	  }

	  this.credentials = options.credentials || this.credentials || 'same-origin';

	  if (options.headers || !this.headers) {
	    this.headers = new Headers(options.headers);
	  }

	  this.method = normalizeMethod(options.method || this.method || 'GET');
	  this.mode = options.mode || this.mode || null;
	  this.signal = options.signal || this.signal;
	  this.referrer = null;

	  if ((this.method === 'GET' || this.method === 'HEAD') && body) {
	    throw new TypeError('Body not allowed for GET or HEAD requests');
	  }

	  this._initBody(body);
	}

	Request.prototype.clone = function () {
	  return new Request(this, {
	    body: this._bodyInit
	  });
	};

	function decode(body) {
	  var form = new FormData();
	  body.trim().split('&').forEach(function (bytes) {
	    if (bytes) {
	      var split = bytes.split('=');
	      var name = split.shift().replace(/\+/g, ' ');
	      var value = split.join('=').replace(/\+/g, ' ');
	      form.append(decodeURIComponent(name), decodeURIComponent(value));
	    }
	  });
	  return form;
	}

	function parseHeaders(rawHeaders) {
	  var headers = new Headers(); // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
	  // https://tools.ietf.org/html/rfc7230#section-3.2

	  var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ');
	  preProcessedHeaders.split(/\r?\n/).forEach(function (line) {
	    var parts = line.split(':');
	    var key = parts.shift().trim();

	    if (key) {
	      var value = parts.join(':').trim();
	      headers.append(key, value);
	    }
	  });
	  return headers;
	}

	Body.call(Request.prototype);
	function Response(bodyInit, options) {
	  if (!options) {
	    options = {};
	  }

	  this.type = 'default';
	  this.status = options.status === undefined ? 200 : options.status;
	  this.ok = this.status >= 200 && this.status < 300;
	  this.statusText = 'statusText' in options ? options.statusText : 'OK';
	  this.headers = new Headers(options.headers);
	  this.url = options.url || '';

	  this._initBody(bodyInit);
	}
	Body.call(Response.prototype);

	Response.prototype.clone = function () {
	  return new Response(this._bodyInit, {
	    status: this.status,
	    statusText: this.statusText,
	    headers: new Headers(this.headers),
	    url: this.url
	  });
	};

	Response.error = function () {
	  var response = new Response(null, {
	    status: 0,
	    statusText: ''
	  });
	  response.type = 'error';
	  return response;
	};

	var redirectStatuses = [301, 302, 303, 307, 308];

	Response.redirect = function (url, status) {
	  if (redirectStatuses.indexOf(status) === -1) {
	    throw new RangeError('Invalid status code');
	  }

	  return new Response(null, {
	    status: status,
	    headers: {
	      location: url
	    }
	  });
	};

	var DOMException = self.DOMException;

	try {
	  new DOMException();
	} catch (err) {
	  DOMException = function (message, name) {
	    this.message = message;
	    this.name = name;
	    var error = Error(message);
	    this.stack = error.stack;
	  };

	  DOMException.prototype = Object.create(Error.prototype);
	  DOMException.prototype.constructor = DOMException;
	}

	function fetch$1(input, init) {
	  return new Promise(function (resolve, reject) {
	    var request = new Request(input, init);

	    if (request.signal && request.signal.aborted) {
	      return reject(new DOMException('Aborted', 'AbortError'));
	    }

	    var xhr = new XMLHttpRequest();

	    function abortXhr() {
	      xhr.abort();
	    }

	    xhr.onload = function () {
	      var options = {
	        status: xhr.status,
	        statusText: xhr.statusText,
	        headers: parseHeaders(xhr.getAllResponseHeaders() || '')
	      };
	      options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL');
	      var body = 'response' in xhr ? xhr.response : xhr.responseText;
	      resolve(new Response(body, options));
	    };

	    xhr.onerror = function () {
	      reject(new TypeError('Network request failed'));
	    };

	    xhr.ontimeout = function () {
	      reject(new TypeError('Network request failed'));
	    };

	    xhr.onabort = function () {
	      reject(new DOMException('Aborted', 'AbortError'));
	    };

	    xhr.open(request.method, request.url, true);

	    if (request.credentials === 'include') {
	      xhr.withCredentials = true;
	    } else if (request.credentials === 'omit') {
	      xhr.withCredentials = false;
	    }

	    if ('responseType' in xhr && support.blob) {
	      xhr.responseType = 'blob';
	    }

	    request.headers.forEach(function (value, name) {
	      xhr.setRequestHeader(name, value);
	    });

	    if (request.signal) {
	      request.signal.addEventListener('abort', abortXhr);

	      xhr.onreadystatechange = function () {
	        // DONE (success or failure)
	        if (xhr.readyState === 4) {
	          request.signal.removeEventListener('abort', abortXhr);
	        }
	      };
	    }

	    xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit);
	  });
	}
	fetch$1.polyfill = true;

	if (!self.fetch) {
	  self.fetch = fetch$1;
	  self.Headers = Headers;
	  self.Request = Request;
	  self.Response = Response;
	}

	var templates = {
	  q1Fn: q1Fn,
	  q2Fn: q2Fn,
	  q3Fn: q3Fn,
	  q4Fn: q4Fn,
	  q5Fn: q5Fn,
	  finishFn: finishFn,
	  doneFn: doneFn
	};
	init(true);
	/**
	 *
	 */

	function init() {
	  var initial = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

	  if (!initial) {
	    handleNetStates();
	  }

	  if (checkStorage() && initial) {
	    throwLoadingState(function () {
	      return getStorage();
	    }).then(function (data) {
	      sendData(data);
	      renderPage(data);
	      init(false);
	    });
	  } else {
	    if (document.getElementById('begin')) {
	      console.log('index Page');
	      document.querySelector('form').addEventListener('submit', function (e) {
	        e.preventDefault();
	        throwLoadingState(function () {
	          return getAllUserData(e.target.elements.namedItem('uuid').value);
	        }).then(function (data) {
	          storeData(data);
	          renderPage(data);
	          init(false);
	        });
	      }, false);
	    } else {
	      console.log('Question Page');
	      activatePrevNext();
	      transformNumberToRange();
	      watchForm();
	    }
	  }
	}

	function renderPage(data) {
	  var fromBegin = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
	  var title = "Vraag ".concat(data.state[1]);

	  if (data[data.state]) {
	    renderBody(templates["".concat(data.state, "Fn")]({
	      title: "".concat(title, " | WebDev Enquete"),
	      pageTitle: title,
	      progress: data.state.substring(1),
	      uuid: data.uuid,
	      data: data[data.state]
	    }));
	  } else if (data.state === 'finish') {
	    renderBody(templates["".concat(data.state, "Fn")]({
	      title: "Afronden | WebDev Enquete",
	      pageTitle: 'Afronden',
	      progress: data.state.substring(1),
	      uuid: data.uuid,
	      data: data
	    }));
	  } else if (data.state === 'done') {
	    var doneTitle = fromBegin ? 'Nogmaals bedankt' : 'Bedankt';
	    renderBody(templates["".concat(data.state, "Fn")]({
	      title: "".concat(doneTitle, " | WebDev Enquete"),
	      pageTitle: doneTitle,
	      progress: 6,
	      uuid: data.uuid,
	      fromBegin: fromBegin
	    }));
	    clearStorage();
	  } else {
	    renderBody(templates["".concat(data.state, "Fn")]({
	      title: "".concat(title, " | WebDev Enquete"),
	      pageTitle: title,
	      progress: data.state.substring(1),
	      uuid: data.uuid
	    }));
	  }
	}
	/**
	 *
	 * @param uuid
	 * @returns {Promise<unknown>}
	 */


	function getAllUserData(uuid) {
	  return new Promise(function (resolve, reject) {
	    fetch('/all', {
	      method: 'POST',
	      headers: {
	        'Content-Type': 'application/json'
	      },
	      body: JSON.stringify({
	        'uuid': uuid
	      })
	    }).then(function (res) {
	      if (res.ok) {
	        resolve(res.json());
	      } else {
	        reject(res);
	      }
	    });
	  });
	}
	/**
	 *
	 * @param promise
	 * @returns {Promise<unknown>}
	 */


	function throwLoadingState(promise) {
	  return new Promise(function (resolve, reject) {
	    var body = document.querySelector('body');
	    var header = body.querySelector('header');
	    var main = body.querySelector('main');
	    var footer = body.querySelector('footer');
	    toggleBlurClass(header, main, footer);
	    var svg = "<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" style=\"margin:auto;background:transparent;display:block;\" width=\"201px\" height=\"201px\" viewBox=\"0 0 100 100\" preserveAspectRatio=\"xMidYMid\">\n<g transform=\"translate(0 -6)\">\n  <circle cx=\"50\" cy=\"42.8\" r=\"5.84999\" fill=\"#ffa57a\" transform=\"rotate(271.8 50 50)\">\n    <animateTransform attributeName=\"transform\" type=\"rotate\" dur=\"1.6949152542372878s\" repeatCount=\"indefinite\" keyTimes=\"0;1\" values=\"0 50 50;360 50 50\"></animateTransform>\n    <animate attributeName=\"r\" dur=\"1.6949152542372878s\" repeatCount=\"indefinite\" calcMode=\"spline\" keyTimes=\"0;0.5;1\" values=\"0;12;0\" keySplines=\"0.2 0 0.8 1;0.2 0 0.8 1\"></animate>\n  </circle>\n  <circle cx=\"50\" cy=\"42.8\" r=\"6.15001\" fill=\"#005a85\" transform=\"rotate(451.8 50 50)\">\n    <animateTransform attributeName=\"transform\" type=\"rotate\" dur=\"1.6949152542372878s\" repeatCount=\"indefinite\" keyTimes=\"0;1\" values=\"180 50 50;540 50 50\"></animateTransform>\n    <animate attributeName=\"r\" dur=\"1.6949152542372878s\" repeatCount=\"indefinite\" calcMode=\"spline\" keyTimes=\"0;0.5;1\" values=\"12;0;12\" keySplines=\"0.2 0 0.8 1;0.2 0 0.8 1\"></animate>\n  </circle>\n</g>\n</svg>";
	    var loadingModal = createNodeFromString("<div class=\"modal\"><div class=\"loading\">".concat(svg, "</div></div>"));
	    body.appendChild(loadingModal);
	    promise().then(function (data) {
	      toggleBlurClass(header, main, footer);
	      removeElement(loadingModal);
	      resolve(data);
	    }).catch(function (err) {
	      toggleBlurClass(header, main, footer);
	      removeElement(loadingModal);
	      reject(err);
	    });
	  });
	}
	/**
	 *
	 * @param markup
	 */


	function createNodeFromString(markup) {
	  var template = document.createElement('template');
	  template.insertAdjacentHTML('afterbegin', markup.trim());
	  return template.firstElementChild;
	}

	function renderBody(markup) {
	  var app = document.querySelector('.app');
	  clearElement(app);
	  app.insertAdjacentHTML('afterbegin', markup.trim());
	}

	function removeElement(el) {
	  el.parentElement.removeChild(el);
	}

	function clearElement(el) {
	  while (el.firstChild) {
	    el.removeChild(el.lastChild);
	  }
	}

	function toggleBlurClass() {
	  for (var _len = arguments.length, els = new Array(_len), _key = 0; _key < _len; _key++) {
	    els[_key] = arguments[_key];
	  }

	  els.forEach(function (el) {
	    el.classList.toggle('blur');
	  });
	}

	function activatePrevNext() {
	  // if document.querySelector()
	  document.querySelector('form').addEventListener('submit', function (e) {
	    var input;

	    if (e.explicitOriginalTarget) {
	      e.preventDefault();
	      input = e.explicitOriginalTarget;
	    } else if (document.activeElement.tagName === 'INPUT') {
	      e.preventDefault();
	      input = document.activeElement;
	    }

	    if (input) {
	      if (input.value === 'Volgende vraag' && e.target.elements.grade.value <= 5 && !e.target.elements.desc.value) {
	        console.log("invalid");
	        e.target.classList.toggle('invalidWarning', true);
	      } else if (input.value === 'Volgende vraag') {
	        console.log("Volgende vraag");
	        getStorage().then(function (user) {
	          console.log(nextQ(user.state));
	          user.state = nextQ(user.state);
	          storeData(user);
	          sendData(user);
	          renderPage(user);
	          init(false);
	        });
	      } else if (input.value === 'Vorige vraag') {
	        console.log("Vorige vraag");
	        getStorage().then(function (user) {
	          console.log(prevQ(user.state));
	          user.state = prevQ(user.state);
	          storeData(user);
	          sendData(user);
	          renderPage(user);
	          init(false);
	        });
	      } else if (input.value === 'Versturen') {
	        console.log("Versturen");
	        getStorage().then(function (user) {
	          console.log('local state = done');
	          user.state = 'done';
	          storeData(user);
	          sendData(user);
	          renderPage(user, false);
	          init(false);
	          clearStorage();
	        });
	      } else {
	        console.log("Afronden");
	        getStorage().then(function (user) {
	          console.log('finish');
	          user.state = 'finish';
	          storeData(user);
	          sendData(user);
	          renderPage(user);
	          init(false);
	        });
	      }
	    }
	  }, false);
	}

	function watchForm() {
	  var form = document.querySelector('form');
	  var state = form.elements.q.value || 'done';
	  form.addEventListener('change', function (e) {
	    updateEntry(form, state);
	  });
	  document.querySelectorAll('.desc').forEach(function (desc) {
	    desc.addEventListener('keyup', function () {
	      updateEntry(form, state);
	      console.log('hallo?');
	      form.classList.remove('invalidWarning');
	    });
	  });
	}

	function storeData(data) {
	  // check if localStorage is available.
	  if (typeof Storage !== 'undefined') {
	    localStorage.setItem('user', JSON.stringify(data));
	    return true;
	  }

	  return false;
	}

	function updateEntry(form, state) {
	  if (checkStorage()) {
	    getStorage().then(function (user) {
	      if (form.elements.grade) {
	        user[state] = {
	          grade: form.elements.grade.value,
	          desc: form.elements.desc.value
	        };
	      } else {
	        user[state] = {
	          desc: form.elements.desc.value
	        };
	      }

	      storeData(user);
	    });
	  }
	}

	function checkStorage() {
	  if (typeof Storage !== 'undefined') {
	    // check if we have saved data in localStorage.
	    var item = localStorage.getItem('user');
	    var entry = item && JSON.parse(item);

	    if (entry) {
	      // we have valid form data, try to submit it.
	      return entry;
	    }
	  } else {
	    return false;
	  }
	}

	function getStorage() {
	  return new Promise(function (resolve, reject) {
	    if (typeof Storage !== 'undefined') {
	      // check if we have saved data in localStorage.
	      var item = localStorage.getItem('user');
	      var entry = JSON.parse(item);

	      if (entry) {
	        // we have valid form data, try to submit it.
	        resolve(entry);
	      } else {
	        reject('Entry not found');
	      }
	    } else {
	      reject("No local Storage available");
	    }
	  });
	}

	function sendData(data) {
	  if (data._id) {
	    delete data._id;
	  } // send ajax request to server


	  fetch('/update-user', {
	    method: 'POST',
	    headers: {
	      'Content-Type': 'application/json'
	    },
	    body: JSON.stringify(data)
	  }).then(function (res) {
	    if (res.ok) {
	      console.log('Data saved online');
	    }
	  }).catch(function (error) {
	    console.warn(error);
	  });
	}

	function handleNetStates() {
	  if (navigator.onLine) {
	    netStatus('online');
	  } else {
	    netStatus('offline');
	  }

	  window.addEventListener('online', function () {
	    console.log('online');
	    netStatus('online');
	    getStorage().then(function (user) {
	      sendData(user);
	    });
	  });
	  window.addEventListener('offline', function () {
	    netStatus('offline');
	  });
	}

	function netStatus(status) {
	  console.log(status);

	  if (document.getElementById('onlineStatus')) {
	    document.getElementById('onlineStatus').setAttribute('class', status);
	  } else {
	    var notice = createNodeFromString("<section id=\"onlineStatus\" class=\"".concat(status, "\"><p>\uD83D\uDCBE You seem to be offline</p> <span>Your data is saved locally and will be saved online when your connection comes back</span></section>"));
	    document.querySelector('header').insertAdjacentElement('beforeend', notice);
	  }
	}

	function nextQ(q) {
	  return q[0] + (parseInt(q[1]) + 1);
	}

	function prevQ(q) {
	  return q[0] + (parseInt(q[1]) - 1);
	}

	function clearStorage() {
	  if (typeof Storage !== 'undefined') {
	    localStorage.clear();
	  }
	}

	function transformNumberToRange() {
	  document.querySelectorAll('input[type="number"]').forEach(function (number) {
	    var nullValue = !!number.value;
	    number.type = 'range';
	    number.parentElement.classList.add('rangeWrapper');
	    var output = number.value > 0 ? createNodeFromString("<output for=\"".concat(number.id, "\" class=\"rangeValue\" id=\"").concat(number.id, "Value\">").concat(number.value, "</output>")) : createNodeFromString("<output for=\"".concat(number.id, "\" class=\"rangeValue\" id=\"").concat(number.id, "Value\"></output>"));
	    number.insertAdjacentElement('afterend', output);
	    number.value = nullValue ? number.value : 1;
	    setOutput(number, output);
	    number.addEventListener('click', function (e) {
	      output.classList.toggle('active', true);
	    });
	    number.addEventListener('mouseover', function (e) {
	      output.classList.toggle('active', true);
	    });
	    number.addEventListener('mouseout', function (e) {
	      output.classList.toggle('active', false);
	    });
	    output.addEventListener('mouseover', function (e) {
	      output.classList.toggle('active', true);
	    });
	    output.addEventListener('mouseout', function (e) {
	      output.classList.toggle('active', false);
	    });
	    number.addEventListener('touchstart', function (e) {
	      output.classList.toggle('active', true);
	    });
	    document.getElementById(number.id).addEventListener('change', function (e) {
	      setOutput(number, output);
	    });
	    document.getElementById(number.id).addEventListener('input', function (e) {
	      setOutput(number, output);
	    });
	  });
	}

	function setOutput(range, output) {
	  var value = range.value;
	  var min = range.min ? range.min : 0;
	  var max = range.max ? range.max : 10;
	  var percentage = Number((value - min) * 100 / (max - min));
	  output.innerText = value;
	  output.style.left = "calc(".concat(percentage, "% + (").concat(18 - percentage * 0.34, "px))");
	}

}());
