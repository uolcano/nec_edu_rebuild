/************************************
Compatible solution for native methods
 ************************************/
! function () {
    'use strict';
    if (typeof Object.create != 'function') {
        Object.create = function () {
            var Temp = function () {};
            return function (proto) {
                if (proto !== Object(proto) && proto !== null) {
                    console.log('Error: Object.create - parameter 1 must be an object, or null');
                    return;
                }
                Temp.prototype = proto || {};
                var result = new Temp();
                Temp.prototype = null;
                // simulate Object.create(null)
                proto === null && (result.__proto__ = null);
                return result;
            }
        }();
    }
    if (typeof Function.prototype.bind != 'function') {
        Function.prototype.bind = function (content) {
            if (typeof this != 'function') {
                console.log('Function.prototype.bind - what is trying to be bound is not callable.')
            }
            var args = Array.prototype.slice.call(arguments, 1),
                toBind = this;
            return function () {
                toBind.apply(content, args.concat(Array.prototype.slice.call(arguments)));
            }
        };
    }
    if (typeof Array.prototype.indexOf != 'function') {
        Array.prototype.indexOf = function (itm) {
            var arr = Object(this),
                i = 0,
                len = 0;
            if (Object.prototype.toString.call(arr).slice(8, -1) != 'Array') {
                console.log('Error: Array.prototype.indexOf - the caller must be an array!');
                return;
            }
            if (!(len = arr.length)) return;
            do {
                if (arr[i] === itm) return i;
            } while (++i < len);
            return -1;
        };
    }
    if (typeof Array.prototype.forEach != 'function') {
        Array.prototype.forEach = function (fn) {
            var arr = Object(this),
                i = 0,
                len = 0;
            if (Object.prototype.toString.call(arr).slice(8, -1) != 'Array') {
                console.log('Error: Array.prototype.indexOf - the caller must be an array!');
                return;
            }
            if (!(len = arr.length)) return;
            do {
                fn(arr[i], i, arr);
            } while (++i < len);
            fn = arr = null;
        }
    }
    if (typeof Array.prototype.reduce != 'function') {
        Array.prototype.reduce = function (fn, orig) {
            var arr = Object(this),
                i = 0,
                len = 0,
                pre = 0;
            if (Object.prototype.toString.call(arr).slice(8, -1) != 'Array') {
                console.log('Error: Array.prototype.indexOf - the caller must be an array!');
                return;
            }
            if (!(len = arr.length)) return;
            if (typeof orig != 'undefined') {
                pre = orig;
            } else {
                pre = arr[0];
                if (len === 1) {
                    return pre;
                }
                i++;
            }
            do {
                pre = fn(pre, arr[i], i, arr);
            } while (++i < len);
            fn = org = arr = null;
            return pre;
        }
    }
    if (typeof Array.prototype.some != 'function') {
        Array.prototype.some = function (fn) {
            var arr = Object(this),
                i = 0,
                len = 0;
            if (Object.prototype.toString.call(arr).slice(8, -1) != 'Array') {
                console.log('Error: Array.prototype.indexOf - the caller must be an array!');
                return;
            }
            if (!(len = arr.length)) return;
            do {
                if (fn(arr[i], i, arr)) {
                    return true;
                }
            } while (++i < len);
            fn = arr = null;
            return false;
        }
    }
    if (typeof Array.prototype.every != 'function') {
        Array.prototype.every = function (fn) {
            var arr = Object(this),
                i = 0,
                len = 0;
            if (Object.prototype.toString.call(arr).slice(8, -1) != 'Array') {
                console.log('Error: Array.prototype.indexOf - the caller must be an array!');
                return;
            }
            if (!(len = arr.length)) return;
            do {
                if (!fn(arr[i], i, arr)) {
                    return false;
                }
            } while (++i < len);
            fn = arr = null;
            return true;
        }
    }
    if (typeof Array.prototype.join != 'function') {
        Array.prototype.join = function (rep) {
            rep = String(rep);
            this.reduce(function (pre, crt, idx, arr) {
                return '' + pre + rep + crt;
            });
        }
    }
    if (typeof String.prototype.trim != 'function') {
        String.prototype.trim = function () {
            return this.toString().replace(/^\s*|\s*$/g, '');
        }
    }
}();

! function () {
    // source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice#Streamlining_cross-browser_behavior
    // deal with that slice can not be call with DOM elements in IE < 9
    'use strict';
    var slice = Array.prototype.slice;
    try {
        // slice can not be used with DOM elements in IE < 9
        slice.call(document.documentElement);
    } catch (e) {
        Array.prototype.slice = function (begin, end) {
            end = typeof end != 'undefined' ? end : this.length;
            // if the caller is an native Array
            if (Object.prototype.toString.call(this).slice(8, -1) == 'Array') {
                return slice.call(this, begin, end);
            }
            var i, size, start, last,
                obj = Object(this),
                copy = [],
                len = obj.length;
            // format arguments
            start = typeof begin != 'number' ? 0 :
                begin >= 0 ? begin :
                Math.max(0, len + begin);
            last = typeof end != 'number' ? len :
                end >= 0 ? Math.min(end, len) :
                len + end;
            size = last - start;
            if (size > 0) {
                copy = new Array(size);
                // process when slice bound to a string
                if (obj.charAt) {
                    for (i = 0; i < size; i++) {
                        copy[i] = obj.charAt(start + i);
                    }
                } else {
                    for (i = 0; i < size; i++) {
                        copy[i] = obj[start + i];
                    }
                }
            }
            return copy;
        };
    }
}();

/*****************************
Create the uTools function and namespace
usage: $('.selectors'); // use selectors return a wrapped object
       $(domElm);       // use a DOM element return a wrapped object
       $(object);       // use a object
 *****************************/
! function (global) {
    var _slice = Array.prototype.slice;
    var $ = global.uTools = function (val) {
        // 1. get DOM element(s)
        // 2. create wrapped object
        // 3. wrap object
        var m, elms, len, tmp,
            // complete tag, must be ended with corresponding close tag
            reg1 = /^\s*\<([\d\w]+)[\s\S]*\>[\s\S]*\<\/\1\>\s*$/,
            // self-closed tag, with optional slash
            reg2 = /^\s*\<(area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)[^\<\>]*\/?\>\s*$/;
        // backup: reg2 = /^\s*\<([\d\w]+)[^\<\>]*\/\>\s*$/;

        if (val == null) {
            return val;
        } else if (typeof val == 'string') {
            try {
                // 1.look up DOM elements by selector, and get'em
                elms = document.querySelectorAll(val);
                len = elms.length;
            } catch (e) {
                if ($.fn.isIE.ver || $.fn.isIE()) {
                    console.log('Warning: window.uTools - querySelectorAll failed.');
                } else {
                    console.log(e);
                }
            }
            if (len) {
                return $.dom.wrp(_slice.call(elms));
            } else if (m = val.match(reg1) || val.match(reg2)) {
                // 2. create wrapped object with some DOM elements
                tmp = document.createElement('div');
                tmp.innerHTML = val;
                elms = [];
                // can not use promise in async, because need for return
                _slice.call(tmp.childNodes).forEach(function (elm) {
                    elm.nodeType === 1 && elms.push(elm);
                });
                tmp = m = null;
                if (elms.length) {
                    return $.dom.wrp(elms);
                }
                elms = null;
                return;
            }
            return val;
            // 3. wrapping node or other object
        } else if ((m = $.fn.isNode(val)) || $.fn.isNode(val[0])) { // the DOM nodes
            elms = [];
            if (m) { // a single DOM node
                elms.push(val);
            } else { // an array-like collectio
                _slice.call(val).forEach(function (elm) {
                    elms.push(elm);
                });
            }
            return $.dom.wrp(elms);
        } else if (val.type == 'wrapped') { // the wrapped objects
            return val;
        } else if (val && typeof val == 'object') { // the other type objects
            if (val.length == null) {
                return $.ev.wrp([val]);
            } else if ($.fn.isNumeric(val.length)) {
                elms = [];
                _slice.call(val).forEach(function (elm) {
                    elms.push(elm);
                });
            }
            return $.ev.wrp(elms);
        }
    };
    // the buffer to allow developer access cross-scope references temporarily
    $.temp = {};
    global._uTools = global.uTools;
}(window || self);

! function ($, global) {
    var _hasOwn = Object.prototype.hasOwnProperty,
        _getOwns = Object.getOwnPropertyNames,
        _slice = Array.prototype.slice,
        _create = Object.create,
        INTERVAL = 80; // the chunk traversing delay interval time

    /******************************
        Common tool set
usage: $.fn.getTypeOf([]) == 'array'
       $.fn.isArray([])                // return true
       $.fn.isNumeric(12)              // return true
       $.fn.isNode(document)           // return true
       $.fn.isElement(divElm)          // return true
       $.fn.isIE(8)                    // return 8 when browser is IE8, then $.fn.isIE.ver == 8
       $.fn.lazyLoad(                  // return callback1 when parameter 1 return true, otherwise return callback2
           $.fn.lazyLoadAid('textContent', 'undefined'),
           callback1,
           callback2
       )
       $.fn.chunk([1,2,3], function(elm, idx, arr){
           // process
       }, 500, window);
       $.fn.throttle(function(arg1, arg2){
           // process
       }, 300, [arg1, arg2], window);
       $.fn.each({
           height: 100,
           width: 200
       }, function(propVal, propName, obj){
          // process
       })
       $.fn.clone({
          url: 'http://example.com',
          opt: {
             method: 'get',
             timestamp: true,
             data: {
               name: 'username',
               password: '*****'
             }
          }
       }, true);
       $.fn.sleep(function(arg1, arg2){
          // process
       }, 100, [arg1, arg2], window);
     ******************************/
    ! function () {
        $.fn = _create({
            /****************** detector *************/
            getTypeOf: function (obj) {
                var type = Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
                if (type != 'object') return type;
                if (obj.constructor &&
                    !_hasOwn.call(obj, 'constructor') &&
                    !_hasOwn.call(obj, 'isPrototypeOf')) {
                    return obj.constructor.toString().match(/function\s*([^\(\s]*)/)[1].toLowerCase();
                }
            },

            // return true if it is a array
            isArray: function (obj) {
                return $.fn.getTypeOf(obj) == 'array';
            },
            // return true if it is a numeric number
            isNumeric: function (val) {
                if (typeof val == 'object') return false; // exclude object
                if (typeof val != 'number') return false; // exclude true, false, null, undefined
                if (!isFinite(val)) return false; // exclude undefined, NaN, Infinity
                return true;
            },
            // return true if it is a DOM node
            isNode: function (obj) {
                return typeof Node == 'object' ?
                    obj instanceof Node :
                    obj &&
                    typeof obj == 'object' &&
                    typeof obj.nodeType == 'number' &&
                    typeof obj.nodeName == 'string';
            },
            // return true if it is a DOM element
            isElement: function (obj) {
                return typeof HTMLElement == 'object' ? obj instanceof HTMLElement :
                    obj && typeof obj == 'object' && obj != null && obj.nodeType === 1 && typeof obj.nodeName == 'string';
            },
            // detect IE or IE version
            isIE: function (ver) {
                var t, i, v, len,
                    self = arguments.callee,
                    arr = [5, 6, 7, 8, 9, 10],
                    b = document.createElement('b');
                b.innerHTML = '<!--[if IE ' + ver + ']><i></i><![endif]-->';
                t = b.getElementsByTagName('i').length === 1;
                // use the ver property in isIE to store the IE version
                // to prevent check IE ver frequently
                if (self.ver == null) {
                    if (ver && t) {
                        self.ver = ver;
                    } else {
                        i = arr.indexOf(ver);
                        arr.splice(i, 1);
                        i = 0;
                        len = arr.length;
                        do {
                            v = arr[i];
                            b.innerHTML = '<!--[if IE ' + v + ']><i></i><![endif]-->';
                            if (b.getElementsByTagName('i').length === 1) {
                                self.ver = v;
                                break;
                            };
                        } while (++i < len);
                    }
                }
                b.innerHTML = '';
                arr = b = null;
                return t;
            },
            /***************** performance optimization ******************/
            // lazy load some compatibly choosing function
            // @param {boolean|function} [determine condition]
            // @param {fn1}              [callback if expr is true]
            // @param {fn2}              [callback if expr is false]
            lazyLoad: function (expr, fn1, fn2) {
                if (typeof fn1 != 'function') {
                    console.log('Error: uTools.fn.lazyLoad - The parameter 2 must be a function to be returned.');
                }
                if (typeof fn2 != 'function') {
                    console.log('Error: uTools.fn.lazyLoad - The parameter 3 must be a function to be returned.');
                }
                if (typeof expr == 'boolean') {
                    return expr ? fn1 : fn2;
                } else if (typeof expr == 'function') {
                    return expr() ? fn1 : fn2;
                } else {
                    console.log('Error: uTools.fn.lazyLoad - The parameter 1 should be a boolean value or a function to be called.');
                }
            },
            // lazy load assistant for easily using lazy load
            // @param {string} [the property name to verify]
            // @param {string} [the property native type]
            lazyLoadAid: function (name, type) {
                var b = document.createElement('b'),
                    t = typeof b[name] == type;
                b = null;
                return t;
            },
            // array chunk traversing auxiliary method
            // @param {number}   [interval time]
            // @param {array}    [array to traverse]
            // @param {function} [callback]
            // @param {object}   [bound context]
            chunk: function (arr, fn, intv, ctx) {
                if (!$.fn.isArray(arr)) {
                    console.log('Error: uTools.fn.chunk - The parameter 1 must be an array!');
                }
                if (!arr.length) return;
                if (typeof fn != 'function') return;
                if (intv != null && typeof intv != 'number') return;
                if (ctx != null && typeof ctx != 'object') return;
                // return a Promise for sometimes async needs
                return new $.Promise(function (resolve, reject) {
                    var copy = arr.slice(),
                        idx = 0;
                    intv = intv || 100; // if undefined or null
                    intv = intv > 0 ? ~~intv : 0; // get the non-negative and also integer
                    setTimeout(function recur() {
                        var item = copy.shift();
                        fn.call(ctx, item, idx++, copy);
                        if (copy.length > 0) {
                            setTimeout(recur, intv);
                        } else {
                            resolve('chunk completed!');
                        }
                    }, 0);
                });
            },
            // frequently process throttle method
            // @param {function} [callback]
            // @param {number}   [interval time]
            // @param {array}    [vals]
            // @param {object}   [bound context]
            throttle: function (fn, intv, vals, ctx) {
                if (typeof fn != 'function') {
                    console.log('Error: uTools.fn.throttle - The parameter 1 must be a function.');
                }
                clearTimeout(fn.tId);
                intv = intv || 100;
                vals = vals || [];
                fn.tId = setTimeout(function () {
                    fn.apply(ctx, vals);
                }, intv);
            },
            // traversal of array, array-like and object
            each: function (obj, fn) {
                var k, v;
                // convert NodeList into array if the first element is node
                if (isNode(obj[0])) {
                    obj = _slice.call(obj);
                }
                if ($.fn.isArray(obj)) {
                    obj.forEach(fn);
                } else if (typeof obj == 'object') {
                    for (k in obj) {
                        if (_hasOwn.call(obj, k)) {
                            v = obj[k];
                            fn(v, k, obj);
                        }
                    }
                } else {
                    console.log('Error: uTools.fn.each - This method only accept array or arraylike and object.');
                }
                return obj;
            },
            // clone an Object properties straight, or recursively by depth.
            clone: function () {
                return function recur(obj, depth) {
                    var k, v,
                        newObj = {};
                    if (typeof obj == 'object') {
                        for (k in obj) {
                            if (_hasOwn.call(obj, k)) {
                                v = obj[k];
                                if (typeof v == 'object') {
                                    if (depth) {
                                        v = recur(v, depth);
                                    } else {
                                        v = v.toString();
                                    }
                                } else if (typeof v == 'function') {
                                    v = eval('(' + v.toString() + ')');
                                }
                                newObj[k] = v;
                            }
                        }
                        return newObj;
                    }
                }
            }(),
            // external wait for status complete
            sleep: function (fn, intv, vals, ctx) {
                // when intv is a numeric
                intv = intv > 0 && intv < Number.MAX_VALUE ? intv : 500;
                vals = vals || [];
                setTimeout(function t() {
                    if (!fn.complete) {
                        setTimeout(t, intv);
                    } else {
                        fn.apply(ctx, vals);
                        // fn.complete = false;
                    }
                }, 0);
            }
        });
        // end fn
    }();

    /*******************************
        Evernt wrapper
usage:  var $obj = $.ev.wrp(obj);
        $obj.on('click', callback);
        $obj.off('click', callback);
        $.ev.on(document, 'click', callback);
        $.ev.formate(event); // return a compatible event object
    *****************************/
    ! function () {
        function EventWrapper(objs) {
            this.type = 'wrapped';
            this.source = function () {
                if (typeof objs != 'object') {
                    console.log('Warning: EventWrapper - The parameter 1 must be an array-like.');
                    return;
                }
                // undefined or null
                if (objs.length == null) return [objs];
                if ($.fn.isNumeric(objs.length)) {
                    return _slice.call(objs);
                }
                return [];
            }();
        }
        EventWrapper.prototype = {
            constructor: EventWrapper,
            on: function (type, fn) {
                if (!(this instanceof EventWrapper)) {
                    console.log('Error: EventWrapper.prototype.on - This caller is not EventWrapper instance.');
                }
                this.source.forEach(function (itm) {
                    $.ev.on(itm, type, fn);
                });
                return this;
            },
            off: function (type, fn) {
                if (!(this instanceof EventWrapper)) {
                    console.log('Error: EventWrapper.prototype.off - This caller is not EventWrapper instance.');
                }
                this.source.forEach(function (itm) {
                    $.ev.off(itm, type, fn);
                });
                return this;
            }
        };
        $.ev = _create({
            on: $.fn.lazyLoad(
                // typeof domElm.addEventListener == 'function'
                $.fn.lazyLoadAid('addEventListener', 'function'),
                function (obj, type, listener) {
                    obj.addEventListener(type, listener);
                },
                function (obj, type, listener) {
                    obj.attachEvent('on' + type, listener);
                }),
            off: $.fn.lazyLoad(
                // typeof domElm.removeEventListener == 'function'
                $.fn.lazyLoadAid('removeEventListener', 'function'),
                function (obj, type, listener) {
                    obj.removeEventListener(type, listener);
                },
                function (obj, type, listener) {
                    obj.detachEvent('on' + type, listener);
                }),
            // format the event object
            format: function format(event) {
                event = event || window.event;
                event.target || (event.target = event.srcElement);
                if (typeof event.preventDefault != 'function') {
                    event.preventDefault = function () {
                        event.returnValue = false;
                    }
                }
                return event;
            },
            // create an EventWrapper instance
            wrp: function wrp(objs) {
                return new EventWrapper(objs);
            }
        });
    }();

    /*************************
    The DOM wrapper for compatibility
all DOMWrapper object's methods have internal implicitly iteration
usage: var $wrappedObj = $.dom.wrp(domElm);
       $wrappedObj.css({});
       $wrappedObj.data('index');
       $wrappedObj.prop('disabled', true);
       $wrappedObj.attr('type', 'password');
       $wrappedObj.appendTo('body');
     ************************/
    ! function () {
        function DOMWrapper(domElms) {
            this.source = function () {
                if (typeof domElms != 'object') {
                    console.log('Warning: DOMWrapper - The parameter 1 must be an array-like.');
                    return;
                }
                if (!domElms.length) return [domElms];
                return _slice.call(domElms);
            }();
        }
        // prototype inherit the EventWrapper type
        var proto = new $.ev.wrp();
        proto.constructor = DOMWrapper;
        proto.get = function (idx) {
            if (idx == null) return this.source;
            if (typeof idx == 'number') return this.source[idx];
        };
        // @description: add class on the DOM element
        proto.addClass = $.fn.lazyLoad(
            $.fn.lazyLoadAid('classList', 'undefined'),
            function (val, async, intv) {
                if (val == null) return;
                var domElms = this.source;

                function f(elm) {
                    var classList = elm.className.split(' '),
                        classname = classList.join(' ');
                    // add class when not exist the same class
                    classList.indexOf(val) > -1 ||
                        (classname += ' ' + String(val),
                            elm.className = classname.replace(/^\s*|\s*$/, ''));
                }

                intv = intv == null ? INTERVAL : ~~intv;
                if (async === true) {
                    // internal traversal
                    return $.fn.chunk(domElms, f, intv);
                } else {
                    domElms.forEach(f);
                    return this;
                }
            },
            function (val, async, intv) {
                if (val == null) return;
                var domElms = this.source;

                function f(elm) {
                    elm.classList.add(val);
                }

                intv = intv == null ? INTERVAL : ~~intv;
                if (async === true) {
                    // internal traversal
                    return $.fn.chunk(domElms, f, intv);
                } else {
                    domElms.forEach(f);
                    return this;
                }
            });
        // @description: remove class on the DOM element
        proto.removeClass = $.fn.lazyLoad(
            $.fn.lazyLoadAid('classList', 'undefined'),
            function (val, async, intv) {
                if (val == null) return;
                var domElms = this.source;

                function f(elm) {
                    var classList = elm.className.split(' '),
                        idx = classList.indexOf(val),
                        removed;
                    // remove class when exist the given one
                    idx > -1 &&
                        (removed = classList.splice(idx, 1),
                            elm.className = classList.join(' '));
                }
                intv = intv == null ? INTERVAL : ~~intv;
                if (async === true) {
                    // internal traversal
                    return $.fn.chunk(domElms, f, intv);
                } else {
                    domElms.forEach(f);
                    return this;
                }
            },
            function (val, async, intv) {
                if (val == null) return;
                var domElms = this.source;

                function f(elm) {
                    elm.classList.remove(val);
                }
                intv = intv == null ? INTERVAL : ~~intv;
                if (async === true) {
                    // internal traversal
                    return $.fn.chunk(domElms, f, intv);
                } else {
                    domElms.forEach(f);
                    return this;
                }
            });
        proto.hasClass = $.fn.lazyLoad(
            $.fn.lazyLoadAid('classList', 'undefined'),
            function (val) {
                if (val == null) return;
                var domElms = this.source;
                return domElms.some(function (elm) {
                    var classList = elm.className.split(' ');
                    if (classList.indexOf(val) > -1)
                        return true;
                })
            },
            function (val) {
                if (val == null) return;
                var domElms = this.source;
                return domElms.some(function (elm) {
                    if (elm.classList.contains(val))
                        return true;
                })
            });
        // @description: get or set the style sheets in a DOM element
        // @param: {function} [fn] // the function to process the css value
        // @param: {boolean} [async] // false for sync
        // @param: {integer}   [intv] // the interval times when async
        proto.css = function (obj, fn, async, intv) {
            var k, v, t,
                domElms = this.source;

            function f(elm) {
                var is = typeof fn == 'function',
                    curStyle;
                is && (curStyle = $.dom.getStyle(elm));
                for (k in obj) {
                    if (_hasOwn.call(obj, k)) {
                        v = obj[k];
                        is && (v = fn(curStyle[k], v));
                        t = typeof v;
                        if (t != 'string' &&
                            t != 'number' &&
                            t != 'boolean') continue;
                        // format the camel modifier
                        k = k.replace(/-([^-])/g, function (m, p) {
                            return p.toUpperCase();
                        });
                        elm.style[k] = v;
                    }
                }
            }

            intv = intv == null ? INTERVAL : ~~intv;
            // detect null and undefined
            if (obj == null) {
                console.log('Warning: DOMWrapper.prototype.css - The parameter 1 is null.');
            } else if (typeof obj == 'object') {
                if (async === true) {
                    // internal traversal
                    return $.fn.chunk(domElms, f, intv);
                } else {
                    domElms.forEach(f);
                    return this;
                }
            }
        };
        // @description: get or set the text within DOM element(s)
        //               argument [val] will not contain leading or heading white space,
        //               and <script> or <style> element do not use this method!
        // @param: {string} [val]
        // @param: {fnction} [fn] // the function to process the previous text and the input
        // @param: {boolean} [async] // whether async invoked
        // @param: {integer} [intv] // the interval time when async invoked
        proto.text = $.fn.lazyLoad(
            // typeof domElm.textContent == 'undefined'
            $.fn.lazyLoadAid('textContent', 'undefined'),
            function (val, fn, async, intv) {
                var domElms = this.source;

                function f(elm) {
                    var is = typeof fn == 'function',
                        v = val;
                    is && (v = fn(elm.innerText, v));
                    v = String(v);
                    elm.innerText = v;
                }

                intv = intv == null ? INTERVAL : ~~intv;
                // null and undefined
                if (val == null) {
                    return domElms[0].innerText;
                } else {
                    if (async == null || async === true) {
                        return $.fn.chunk(domElms, f, intv);
                    } else {
                        domElms.forEach(f);
                        return this;
                    }
                }
            },
            function (val, fn, async, intv) {
                var domElms = this.source;

                function f(elm) {
                    var is = typeof fn == 'function',
                        v = val;
                    is && (v = fn(elm.textContent, v));
                    v = String(v);
                    elm.textContent = v;
                }

                intv = intv == null ? INTERVAL : ~~intv;
                // null and undefined
                if (val == null) {
                    return domElms[0].textContent;
                } else {
                    if (async === true) {
                        return $.fn.chunk(domElms, f, intv);
                    } else {
                        domElms.forEach(f);
                        return this;
                    }
                }
            });

        // get or set data of the first DOM element's data attribute in a wrapper set,
        // can choose get simple string or parsed object
        proto.data = $.fn.lazyLoad(
            // typeof domElm.dataset == 'undefined'
            $.fn.lazyLoadAid('dataset', 'undefined'),
            function (name, val, fn, doParse, async, intv) {
                var domElms = this.source,
                    value;

                function f(elm) {
                    var is = typeof fn == 'function',
                        data = elm.getAttribute(name),
                        v = value;
                    is && (v = fn(data, v));
                    elm.setAttribute(name, v);
                }

                intv = intv == null ? INTERVAL : ~~intv;
                // detect null and undefined
                if (name == null) return;
                name = String(name);
                // eliminate the '-*' or '*-' data name
                if (/^-.+|.+-$/g.test(name)) {
                    console.log('Error: DOMWrapper.prototype.data - The leading or trailing dash is not allowed!');
                }
                // process the data name except for 'data-*'
                /^data-.+/.test(name) ||
                    /[^-]-[^-]/.test() ?
                    (name = 'data-' + name) : // prepend 'data-' into the '*-*' data name
                    (name = 'data-' + name.replace(/[A-Z]/g, function (m) {
                        return '-' + m.toLowerCase();
                    }));
                // detect null and undefined
                if (val == null) {
                    value = domElms[0].getAttribute(name);
                    !doParse || (value = JSON.parse(value));
                    return value;
                } else {
                    value = !doParse ? String(val) : JSON.stringify(val);
                    if (async === true) {
                        return $.fn.chunk(domElms, f, intv);
                    } else {
                        domElms.forEach(f);
                        return this;
                    }
                }
            },
            function (name, val, fn, doParse, async, intv) {
                var domElms = this.source,
                    value;

                function f(elm) {
                    var is = typeof fn == 'function',
                        data = elm.dataset[name],
                        v = value;
                    is && (v = fn(data, v));
                    elm.dataset[name] = v;
                }

                intv = intv == null ? INTERVAL : ~~intv;
                // detect null and undefined
                if (name == null) return;
                name = String(name);
                if (/^-.+|.+-$/g.test(name)) {
                    console.log('Error: DOMWrapper.prototype.data - The leading or trailing dash is not allowed!');
                }
                // process the wrong format of name, like data-at-of-by into atOfBy
                /^data-.+/.test(name) &&
                    (name = name.replace(/^data-/, ''));
                name = name.replace(/-([^-])/g, function (m, p) {
                    return p.toUpperCase();
                });
                // detect null and undefined
                if (val == null) {
                    value = domElms[0].dataset[name];
                    !doParse || (value = JSON.parse(value));
                    return value;
                } else {
                    value = !doParse ? String(val) : JSON.stringify(val);
                    if (async === true) {
                        return $.fn.chunk(domElms, f, intv);
                    } else {
                        domElms.forEach(f);
                        return this;
                    }
                }
            });
        // get or set the attribute of the first DOM element in a wrapper set
        proto.attr = function (name, val, fn, async, intv) {
            var domElms = this.source;

            function f(elm) {
                var is = typeof fn == 'function',
                    attr = elm.getAttribute(name),
                    v = val;
                is && (v = fn(attr, v));
                elm.setAttribute(name, String(v));
            }

            intv = intv == null ? INTERVAL : ~~intv;
            if (typeof name == 'undefined') return;
            name = String(name);
            // detect null and undefined
            if (val == null) {
                return domElms[0].getAttribute(name);
            } else {
                if (async === true) {
                    return $.fn.chunk(domElms, f, intv);
                } else {
                    domElms.forEach(f);
                    return this;
                }
            }
        };
        // get or set the property of the first DOM element in a wrapper set
        proto.prop = function (name, val, fn, async, intv) {
            var domElms = this.source;

            function f(elm) {
                var is = typeof fn == 'function',
                    prop = elm[name],
                    v = val;
                is && (v = fn(prop, v));
                elm[name] = v;
            }

            intv = intv == null ? INTERVAL : ~~intv;
            if (typeof name == 'undefined') return;
            name = String(name);
            // detect null and undefined
            if (val == null) {
                return domElms[0][name];
            } else {
                if (async === true) {
                    return $.fn.chunk(domElms, f, intv);
                } else {
                    domElms.forEach(f);
                    return this;
                }
            }
        };
        // DOM node manipulation
        proto.append = function (wrpObj, async, intv) {
            var parent = this.source[0],
                newChilds = $(wrpObj).source;

            function f(elm) {
                parent.appendChild(elm);
            }

            intv = intv == null ? INTERVAL : ~~intv;
            if (async === true) {
                return $.fn.chunk(newChilds, f, intv);
            } else {
                newChilds.forEach(f);
                return this;
            }
        };
        proto.prepend = function (wrpObj, async, intv) {
            var parent = this.source[0],
                newChilds = $(wrpObj).source;

            function f(elm) {
                var firstChild = parent.firstChild;
                parent.insertBefore(elm, firstChild);
            }

            intv = intv == null ? INTERVAL : ~~intv;
            if (async === true) {
                return $.fn.chunk(newChilds, f, intv);
            } else {
                newChilds.forEach(f);
                return this;
            }
        };
        proto.before = function (wrpObj, async, intv) {
            var newChilds = $(wrpObj).source,
                refChild = this.source[0],
                parent = refChild.parentNode;

            function f(elm) {
                parent.insertBefore(elm, refChild);
            }

            intv = intv == null ? INTERVAL : ~~intv;
            if (async === true) {
                return $.fn.chunk(newChilds, f, intv);
            } else {
                newChilds.forEach(f);
                return this;
            }
        }
        proto.after = function (wrpObj, async, intv) {
            var newChilds = $(wrpObj).source,
                refChild = this.source[0],
                parent = refChild.parentNode,
                nextChild;

            function f(elm) {
                if (refChild == parent.lastChild) {
                    parent.appendChild(elm);
                } else {
                    nextChild = refChild.nextSibling;
                    parent.insertBefore(elm, nextChild);
                }
            }

            intv = intv == null ? INTERVAL : ~~intv;
            if (async === true) {
                return $.fn.chunk(newChilds, f, intv);
            } else {
                newChilds.forEach(f);
                return this;
            }
        }
        proto.appendTo = function (wrpObj, async, intv) {
            var ret = $(wrpObj).append(this, async, intv);
            if (async === true) {
                return ret;
            } else {
                return this;
            }
        };
        proto.prependTo = function (wrpObj, async, intv) {
            var ret = $(wrpObj).prepend(this, async, intv);
            if (async === true) {
                return ret;
            } else {
                return this;
            }
        };
        proto.insertBefore = function (wrpObj, async, intv) {
            var ret = $(wrpObj).before(this, async, intv);
            if (async === true) {
                return ret;
            } else {
                return this;
            }
        };
        proto.insertAfter = function (wrpObj, async, intv) {
            var ret = $(wrpObj).after(this, async, intv);
            if (async === true) {
                return ret;
            } else {
                return this;
            }
        };
        DOMWrapper.prototype = proto;
        proto = null;
        $.dom = _create({
            /****************** compatible tools ********************/
            getWinWidth: $.fn.lazyLoad(typeof global.innerWidth == 'number', function () {
                    return global.innerWidth;
                },
                function () {
                    return document.body.clientWidth || document.documentElement.clientWidth
                }),
            // get computed style in a DOM element
            getStyle: $.fn.lazyLoad(function () {
                return typeof global.getComputedStyle == 'function';
            }, function (domElm) {
                return global.getComputedStyle(domElm);
            }, function (domElm) {
                return domElm.currentStyle;
            }),
            getElms: function (parent, selector) {
                return _slice.call(parent.querySelectorAll(selector));
            },
            getRules: function (sheet) {
                return sheet.cssRules || sheet.rules;
            },
            getOffset: function (domElm) {
                var parent = domElm.offsetParent,
                    offset = {
                        // content + padding
                        width: domElm.clientWidth,
                        height: domElm.clientHeight,
                        // content + padding + border
                        left: domElm.offsetLeft,
                        top: domElm.offsetTop
                    };
                while (parent) {
                    offset.left += parent.offsetLeft;
                    offset.top += parent.offsetTop;
                    parent = parent.offsetParent;
                }
                return offset;
            },
            wrp: function (objs) {
                return new DOMWrapper(objs);
            }
        });
    }();

    /*************************
    The Promise
    source: https://www.promisejs.org/implementing/
usage: new $.Promise(function(resolve, reject){
    setTimeout(function(words){
       resolve(words);
    },5000, 'hello world');
}).then(function(val){
    return val += '\nhello javascript';
}, function(err){
    // error
}).done(function(val){
    console.log(val); // hello world\nhello javascript
}, function(err){
    // error
});
     *************************/
    ! function () {
        var PENDING = 0,
            FULFILLED = 1,
            REJECTED = 2;

        function Promise(fn) {
            // store state which can be PENDING, FULFILLED or REJECTED
            var state = PENDING;
            // store value once FULFILLED or REJECTED
            var value = null;
            // store success and failure handlers
            var handlers = [];

            function getThen(value) {
                var t = typeof value,
                    then;
                if (value && (t == 'object' || t == 'function')) {
                    then = value.then;
                    if (typeof then == 'function') {
                        return then;
                    }
                }
                return null;
            }

            function doResolve(fn, onFulfilled, onRejected) {
                var done = false;
                try {
                    fn(function (value) {
                        if (done) return;
                        done = true;
                        onFulfilled(value);
                    }, function (reason) {
                        if (done) return;
                        done = true;
                        onRejected(reason);
                    });
                } catch (e) {
                    if (done) return;
                    done = true;
                    onRejected(e);
                }
            }

            function fulfill(result) {
                state = FULFILLED;
                value = result;
                handlers.forEach(handle);
                handlers = null;
            }

            function reject(error) {
                state = REJECTED;
                value = error;
                handlers.forEach(handle);
                handlers = null;
            }

            function resolve(result) {
                try {
                    var then = getThen(result);
                    if (then) {
                        doResolve(then.bind(result), resolve, reject);
                        return;
                    }
                    fulfill(result);
                } catch (e) {
                    reject(e);
                }
            }

            function handle(handler) {
                if (state === PENDING) {
                    handlers.push(handler);
                } else {
                    if (state === FULFILLED && typeof handler.onFulfilled == 'function') {
                        handler.onFulfilled(value);
                    }
                    if (state === REJECTED && typeof handler.onRejected == 'function') {
                        handler.onRejected(value);
                    }
                }
            }
            this.done = function (onFulfilled, onRejected) {
                // wait for vacant of thread
                setTimeout(function () {
                    handle({
                        onFulfilled: onFulfilled,
                        onRejected: onRejected
                    });
                }, 0);
            };
            this.then = function (onFulfilled, onRejected) {
                var self = this;
                return new Promise(function (resolve, reject) {
                    return self.done(function (result) {
                        if (typeof onFulfilled == 'function') {
                            try {
                                return resolve(onFulfilled(result));
                            } catch (e) {
                                return reject(e);
                            }
                        } else {
                            return resolve(result);
                        }
                    }, function (error) {
                        if (typeof onRejected == 'function') {
                            try {
                                return resolve(onRejected(error));
                            } catch (e) {
                                return reject(e);
                            }
                        } else {
                            return reject(error);
                        }
                    });
                })
            };
            doResolve(fn, resolve, reject);
        }
        $.Promise = Promise;
    }();

    /************************
        Ajax communication
usage:  $.ajax(url, {
            method: 'get',
            timestamp: true,
            userName: md5('username'),
            password: md5('password')
        }).done(success, fail);
     ***********************/
    ! function () {
        // serialize the query string
        function serialize(dataObj) {
            var p, n, v,
                pairs = [];
            // process null or undefined
            if (dataObj == null) return '';
            for (p in dataObj) {
                v = dataObj[p];
                if (!dataObj.hasOwnProperty(p) ||
                    typeof v == 'function' ||
                    typeof v == 'object') {
                    continue;
                }
                v = v.toString();
                n = encodeURIComponent(p);
                v = encodeURIComponent(v);
                pairs.push(n + '=' + v);
            }
            return pairs.join('&');
        }
        // detect the XMLHttpRequest whether support CORS
        function isXhrSupportCors() {
            try {
                return typeof XMLHttpRequest != 'undefined' && ('withCredentials' in new XMLHttpRequest());
            } catch (e) {
                return false;
            }
        }
        // Ajax encapsulation
        // @param {string} [url]
        // @param {object} [opt]
        // opt: {
        //   method: {sring},
        //   success: {function},
        //   fail: {function},
        //   data: {object},
        //   timestamp: {boolean},
        //   otherfields
        // }
        // @return Promise
        $.ajax = function (url, opt) {
            opt = $.fn.clone(opt, true);
            var xhr, queryUri, method, success, fail, timestamp, data, isSupport;
            var err = false;
            if (opt && typeof opt == 'object') {
                if (typeof opt.success == 'function') {
                    success = opt.success;
                    delete opt.success || (err = true);
                }
                if (typeof opt.fail == 'function') {
                    fail = opt.fail;
                    delete opt.fail || (err = true);
                }
                if (typeof opt.method == 'string') {
                    switch (opt.method.toLowerCase()) {
                    case 'get':
                    case 'post':
                        method = opt.method;
                        delete opt.method || (err = true);
                        break;
                    }
                }
                if (typeof opt.timestamp == 'boolean') {
                    if (opt.timestamp) {
                        timestamp = '&_=uTools' + +new Date();
                    }
                    delete opt.timestamp || (err = true);
                }
                if (typeof opt.data == 'object' && opt.data.constructor.prototype.hasOwnProperty('isPrototypeOf')) {
                    data = opt.data;
                    delete opt.data || (err = true);
                }
            }
            if (err) {
                return new $.Promise(function (resolve, reject) {
                    reject('Error: uTools.ajax - The parameter 2 contains some properties undeletable.');
                });
            }
            method = method || 'get';
            opt = serialize(opt) + (timestamp ? timestamp : '');
            queryUri = url + (opt && opt.length > 0 ?
                '?' + opt : '');
            // console.log(queryUri)

            if (isSupport = isXhrSupportCors()) {
                xhr = new XMLHttpRequest();
                if (xhr) {
                    xhr.open(method, queryUri, true);
                    console.log('Message: uTools.ajax - XMLHttpRequest CORS openning.');
                }
            } else if (typeof XDomainRequest != 'undefined') {
                xhr = new XDomainRequest();
                xhr.open(method, queryUri);
                // [issue fixed]to fix the IE8/9 some unexpected abort issues
                xhr.onprogress = function () {
                    return;
                };
                xhr.ontimeout = function () {
                    return;
                };
                xhr.timeout = 0;
                console.log('Message: uTools.ajax - XDomainRequest CORS openning.');
            } else {
                xhr = null;
            }
            if (xhr) {
                console.log('Message: uTools.ajax - sending request.');
                return new $.Promise(function (resolve, reject) {
                    xhr.onload = function () {
                        var t = (typeof xhr.status != 'undefined') ? // xhr does not own status property in IE8/9
                            ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) :
                            (typeof xhr.responseText != 'undefined');
                        if (t) {
                            if (typeof success == 'function') {
                                success(xhr);
                            }
                            resolve(xhr);
                        } else {
                            if (typeof fail == 'function') {
                                fail(xhr);
                            }
                            reject(xhr);
                        }
                    };
                    xhr.onerror = function () {
                        if (typeof fail == 'function') {
                            fail(xhr);
                        }
                        reject(xhr);
                    };
                    if (isSupport) {
                        xhr.send(data || null);
                    } else {
                        // [issue fixed]to fix the IE8/9 some unexpected abort issues
                        setTimeout(function () {
                            xhr.send(data || null);
                        }, 0);
                    }
                });
            }
            return new $.Promise(function (resolve, reject) {
                reject('Create XMLHttpRquest failed.');
            });
        }
    }();

    /*****************
    cookies method set
usage: $.cookies.get('name')
       $.cookies.set('name', 'value', seconds, 'path', 'domain', false);
       $.cookies.unset('name', 'path', 'domain', false)
     *****************/
    ! function () {
        $.cookies = _create({
            get: function (name) {
                var cookies = document.cookie,
                    name = encodeURIComponent(name) + '=',
                    start = cookies.indexOf(name),
                    end = null,
                    value = '';
                if (start > -1) {
                    end = cookies.indexOf('; ', start);
                    end === -1 && (end = cookies.length);
                    value = decodeURIComponent(cookies.slice(start += name.length, end));
                }
                return value;
            },
            set: function (name, value, maxAge, path, domain, secure) {
                var cookie = '';
                if (typeof name == 'undefined' || typeof value == 'undefined') {
                    console.log('Error: uTools.cookies.set - The name and value must be defined.');
                }
                cookie += encodeURIComponent(String(name)) +
                    '=' + encodeURIComponent(String(value));
                // use the max-age by seconds
                typeof maxAge == 'number' && (cookie += '; max-age=' + maxAge);
                typeof path == 'string' && (cookie += '; path=' + path);
                typeof domain == 'string' && (cookie += '; domain=' + domain);
                typeof secure == 'boolean' && (cookie += '; secure');
                document.cookie = cookie;
            },
            unset: function (name, path, domain, secure) {
                this.set(name, '', 0, path, domain, secure);
            }
        });
    }();
    /***********************
        The template parser
usag: var tmpl = uTools.tmpl();                                             // new a Template instance
      var mirrorObj = tmpl.getMirrors(templateString);                      // produce the mirror object
      tmpl.putNodes(DOMcontainer, templateString, dataToInsert, process);   // insert nodes and(or) data, return DOMcontainer
      tmpl.putData(dataToInsert, process).done(function(resolve,reject){    // insert data
          // async process
      });
      tmpl.clean(true);                                                     // clean all cache of the instance

attention: in IE8/9 you have only way to retrieve the script element's text by it innerHTML protpery,
           on the other words, innerText not work.
     ***********************/
    ! function () {
        // @description: match the openning tag,
        //               must use RegExp.rightContent to get right part string
        // match points: match[1]->tag name,
        //               match[2]->attributes pairs
        var r1 = /^\s*\<([\d\w]+)([^\<\>]*)\>\s*/,
            // @description: sequentially only match for tag name matched by r1, as self-closed HTML tag,
            //               can not contain any other redundant alphabets and spaces,
            //               used after the r1,
            //               must use RegExp.rightContent to get right part string
            // match points: match[1]->tag name
            r2 = /^[^\s\S]*(area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)[^\s\S]*$/,
            // @description: match text node,
            //               must use RegExp.rightContent to get right part string
            // match points: match[0]->the text
            r3 = /^[^\<\>]+/,
            // @description: match the close tag
            // match points: match[1]->tag name
            r4 = /^\<\/([\w\d]+?)\>/,
            // @description: match the key/value pairs of the element's attribute,
            //               and sometimes attribute's value is void,
            //               must use exec(RegExp.rightContent) to traversal the entire string until return null
            // match points: match[1]->attribute name
            //               match[3]->attribute value
            r5 = /([\w\d\_\-]+)(=[\"\']([\s\S]*?)[\"\'])?/,
            // @description: match the track to be filled with data, i.e. ajax data in async
            // match points: match[1]->the data name to be filled
            r6 = /^\$\{track\.([\w\d\_\$]+)\}$/;

        var LIMIT = 40; // iteration limit for security

        // @description: [issue fixed]fix the unexpected values of RegExp.rightContext
        //               only valid to heading curStr in fullStr
        // @param: {string} [curStr]  // the current matched string
        // @param: {string} [fullStr] // the full string to be matched
        // @return: {string} // the right context of the current matched string
        function getRightContext(curStr, fullStr) {
            var start = fullStr.indexOf(curStr);
            return fullStr.slice(start + curStr.length);
        }
        // @description: get the attributes, return a object, store the attribute name/value pairs
        // @param: [string] [attrsStr] // a part template string
        // @return: {object}
        function getAttrs(attrsStr) {
            var attrsLimit = LIMIT,
                str = String(attrsStr).trim(),
                attrs = {},
                attrKvp;
            while ((attrKvp = r5.exec(str)) && --attrsLimit > 0) {
                attrs[attrKvp[1]] = attrKvp[3];
                // label the node to insert dynamical data, i.e. ajax data
                // dataTarget is an array in attributes, not the same to those in child nodes
                if (r6.test(attrKvp[3])) {
                    if (!attrs.dataTarget) {
                        attrs.dataTarget = [];
                    }
                    attrs.dataTarget.push(attrKvp[1]);
                }
                str = getRightContext(attrKvp[0], str).trim();
            }
            attrKvp = null;
            return attrs;
        }
        // @description: flattening a DOM element reference, those to insert data into
        //               find those DOM element, into whom the data will be inserted
        //               and make a 'bookmark' cache, in favour of going to insert subsequent data
        // @param: {DOM}    [elm]     // the created DOM elements
        // @param: {object} [mirror]  // the template node mirror
        // @return: {array} // the cache of those data-target elements
        function findTargets(elm, mirror) {
            var cache = [];

            function recur(el, mi) {
                var ref = {},
                    obj, len, idx, arr;
                // record text node
                if (mi.dataTarget) {
                    obj = {};
                    idx = null;
                    arr = mi.parent.childNodes
                    len = arr.length;
                    obj.content = mi.nodeValue.match(r6)[1];
                    arr.forEach(function (e, i) {
                        if (e === mi) idx = i;
                    });
                    obj.position = idx;
                    arr = null;
                    return obj;
                }
                // record attributes
                if (mi.attributes && mi.attributes.dataTarget) {
                    ref.targetElement = el;
                    ref.dataTarget = {};
                    obj = {};
                    arr = mi.attributes.dataTarget;
                    arr.forEach(function (e) {
                        obj[e] = mi.attributes[e].match(r6)[1];
                    });
                    ref.dataTarget.attributes = obj;
                }
                // process child nodes
                if (mi.childNodes) {
                    arr = [];
                    _slice.call(el.childNodes).forEach(function (e) {
                        if (e.nodeType === 1) arr.push(e);
                    })
                    mi.childNodes.forEach(function (e, i) {
                        var text = recur(arr[i], e);
                        if (text) {
                            ref.targetElement || (ref.targetElement = el);
                            ref.dataTarget || (ref.dataTarget = {});
                            ref.dataTarget.text = text;
                        };
                    });
                }
                if (ref.dataTarget) cache.push(ref);
                (obj = null), (arr = null);
                // return ref;
            }

            recur(elm, mirror);
            return cache;
        }

        // the template parser contructor
        function Template() {
            // store the template node mirror corrsponding to a DOM element created by template
            this.mirror = [];
            // store the flattened references of all the DOM element to insert data
            // structure: [
            //              0: [ // the references set of the first inserted DOM element
            //                   0: { // the first descendant node within the first inserted DOM element
            //                     targetElement: Element, // reference of DOM element to insert data
            //                     dataTarget: {
            //                       text: {
            //                         position: Number, // the index to insert within parent node's childNodes
            //                         content: 'text node content'
            //                       },
            //                       attributes: {
            //                         attributeName1: attributeValue1,
            //                         attributeName2: attributeValue2,
            //                         ...
            //                       }
            //                     }
            //                   },
            //                   1: {}
            //                 ],
            //              1: [],
            //              ...
            //            ]
            this.cache = [];
            // backup the parent container that those template-created child nodes will be inserted into
            this.destination = null;
            // backup the template string
            this.template = '';
        }

        Template.prototype = {
            // @description: reset the Template instance's cache and mirror,
            //               depath for clean'em alll
            // @param: {boolean} [depth]
            clean: function (depth) {
                this.mirror = this.cache = [];
                if (depth) {
                    this.destination = null;
                    this.template = '';
                }
            },
            // @description: get the mirror of DOM structure, that created by template
            // @param: {string} [tmplStr] // the template string to create nodes
            // @return: an array of template mirrors.
            //          each template mirrors contain the mirror of node to be insert page.
            // structure :  [
            //                0: { // the first mirror node
            //                  attributes: { // the node attribute list
            //                    dataTarget: [ // the dataTarget by array used to label the 'position' that data shall insert into
            //                      0: 'attributeName1',
            //                      1: 'attributeName2',
            //                      ...
            //                    ]
            //                    attributeName1: attributeValue1,
            //                    attributeName2: attributeValue2,
            //                    ...
            //                  },
            //                  childNodes: [ // the child mirror nodes of the first mirror node
            //                    0: {
            //                      attributes: [],
            //                      childNodes: [],
            //                      nodeName: 'node name' // the node Name, e.g. 'div' for div element node
            //                    },
            //                    1: { // only the text node contains nodeValue and dataTarget as string
            //                      nodeName: '#text',
            //                      nodeValue: 'text node content'
            //                      dataTarget: '#text' // the dataTarget by string used to label the 'position' that data shall insert into
            //                    },
            //                    ...
            //                  ],
            //                  nodeName: 'node name' // the nodeName, e.g. 'div' for div element node
            //                },
            //                ...
            //              ]
            getMirrors: function (tmplStr) {
                if (!(this instanceof Template)) {
                    console.log('Error: getMirrors - this function can not bound to other caller.');
                    return;
                }
                var tmpl = String(tmplStr), // template string to be parsed
                    tmpls = [], // store all the premier parent nodes within template node
                    tmplLimit = LIMIT; // restrict the number of templates

                function recur(parent) {
                    var childsLimit = LIMIT, // restrict the number of direct child nodes within every node
                        node = {}, // a node mirror
                        mTag, // tag match
                        tag; // tag store temporary
                    if (mTag = tmpl.match(r1)) {
                        tmpl = RegExp.rightContext;
                        node.nodeName = mTag[1];
                        node.attributes = getAttrs(mTag[2]);
                        // return the node if it is a self-closed tag
                        if (r2.test(mTag[1])) {
                            node.parent = parent;
                            return node;
                        }
                        node.childNodes = [];
                        // find the child nodes if it is a openning tag
                        do {
                            // recurse the child nodes
                            tag = recur(node);
                            // skip when meet some error
                            if (!tag) continue;

                            if (tag.nodeType == 'closed') {
                                // return the node if meet the close tag related to the openning one
                                if (tag.nodeName == node.nodeName) {
                                    node.parent = parent;
                                    return node;
                                } else {
                                    // return none if the close tag not corresponding to the openning
                                    console.log('Error: getMirrors - the HTML tag is not closed correctly.')
                                    return;
                                }
                            }
                            node.childNodes.push(tag);
                        } while (--childsLimit > 0); // 
                    } else if (mTag = tmpl.match(r3)) {
                        // return the node if it is a text
                        tmpl = RegExp.rightContext;
                        // exclude text node of simple spaces
                        if (/^\s*$/.test(mTag[0])) {
                            return;
                        }
                        node.parent = parent;
                        node.nodeName = '#text';
                        node.nodeValue = mTag[0];
                        // label the node to insert dynamical data, i.e. ajax data
                        // targetData is a string in child nodes, not the same to those in attributes
                        if (r6.test(mTag[0])) node.dataTarget = '#text';
                    } else if (mTag = tmpl.match(r4)) {
                        // return the tag if it is a close tag
                        tmpl = RegExp.rightContext;
                        node.nodeName = mTag[1];
                        node.nodeType = 'closed';
                    } else {
                        // return none if there are nothing matched
                        return;
                    }
                    return node;
                }
                // get all elements within template node
                while (r1.test(tmpl) && --tmplLimit > 0) {
                    tmpls.push(recur());
                }
                return tmpls;
            },
            // insert the nodes into parent DOM element
            // @description: initial insert DOM child nodes into parent container
            // @param {DOM}          [destElm] // the parent container
            // @param {DOM string}   [srcStr]  // the template string
            // @param {number/array} [data]    // the times or the data list to insert
            // @param {callback}     [fn]      // the function to process inserted data
            // @return [DOM]                   // the parent container
            // disadvantages: 1. lack flexibility to insert DOM child nodes, created by template string
            putNodes: function (destElm, srcStr, data, fn) {
                if (!(this instanceof Template)) {
                    console.log('Error: uTools.tmpl.putNodes - this function can not bound to other caller.');
                    return;
                }
                var m,
                    len,
                    self = this,
                    rmdStr, // the rightcontext of matched regexp
                    itemStr, // string of a item to be inserted into destElm
                    insHtml = '', // string of all the items to be inserted into destElm
                    childs = [], // the destElm's inserted childNodes
                    limit = LIMIT, // restriction of the number of data to insert
                    rData1 = /\$\{track\.([\w\d\_\$]+?)\}/,
                    rData2 = /\$\{track\.([\w\d\_\$]+?)\}/g; // match the 'position' to insert data
                // arguments detecting
                if (!destElm || destElm.nodeType !== 1) {
                    console.log('Error: uTools.tmpl.putNodes - the parameter 1 must be an DOM element.');
                    return;
                }
                if (!srcStr || typeof srcStr != 'string') {
                    console.log('Error: uTools.tmpl.putNodes - the parameter 2 must be a template string');
                    return;
                }
                // automatically create the template node mirror
                if (this.mirror.length === 0) {
                    this.mirror = this.getMirrors(srcStr);
                    this.destination = destElm;
                    this.template = srcStr;
                }

                if (data != null) {
                    // insert the vacant child nodes into target parent node, when no data passed into
                    if ($.fn.isNumeric(data)) {
                        // warning creating too much child nodes at one-time
                        if (data > limit * 10) {
                            console.log('Warning: uTools.tmpl.putNodes - be careful of creating ' + data + ' child nodes.');
                        }
                        srcStr = srcStr.replace(rData2, '');
                        while (data-- > 0) {
                            insHtml += srcStr;
                        }
                        destElm.innerHTML = insHtml;
                    } else if ($.fn.isArray(data)) {
                        // insert the child nodes, replaced by data, into target parent node, when get data passed into
                        data.forEach(function (d) {
                            var value;
                            limit = LIMIT;
                            itemStr = srcStr;
                            rmdStr = srcStr;
                            while ((m = rData1.exec(rmdStr)) && --limit > 0) {
                                rmdStr = getRightContext(m[0], rmdStr).trim();
                                // initially insert data into each DOM node, created by template
                                value = d[m[1]];
                                fn && (value = fn(value));
                                itemStr = itemStr.replace(m[0], value);
                            }
                            // concatenate the child nodes HTML string
                            insHtml += itemStr;
                        });
                        destElm.innerHTML = insHtml;
                    } else {
                        console.log('Error: uTools.tmpl.putNodes - the parameter 3 must be a positive numeric or array.');
                        return;
                    }
                }
                // collapse the adjacent text nodes
                destElm.normalize();
                // get the Element child nodes list within destElm
                _slice.call(destElm.childNodes).forEach(function (elm) {
                    if (elm.nodeType === 1) {
                        // traverse all the template node mirror
                        self.mirror.forEach(function (mi) {
                            self.cache.push(findTargets(elm, mi));
                        });
                    }
                });
                self = childs = rData1 = rData2 = null
                return destElm;
            },
            // @deacription: insert new data into the target 'position' in the created child nodes
            // @param: {array}    [data]
            // @param: {callback} [fn]
            putData: function (data, fn) {
                if (!(this instanceof Template)) {
                    console.log('Error: uTools.tmpl.putData - this function can not bound to other caller.');
                    return;
                }
                if (!$.fn.isArray(data)) {
                    console.log('Error: uTools.tmpl.putData - the parameter 1 must be an array.');
                    return;
                }
                var self = this;
                // just insert data into target DOM element if the data length less than the cahce length
                if (data.length <= this.cache.length) {
                    // traverse all the child nodes created by template string
                    return $.fn.chunk(data, function (itm, idx, lst) {
                        // traverse the data-target elements within or inclusive those child nodes
                        $.fn.chunk(self.cache[idx], function (elm) {
                            var k, v,
                                target = elm.targetElement,
                                attrs = elm.dataTarget.attributes,
                                text = elm.dataTarget.text,
                                newText,
                                removed;
                            if (attrs) {
                                // traverse all data-target attributes of an element/tag
                                // and replace the attribute value with new data item
                                for (k in attrs) {
                                    if (_hasOwn.call(attrs, k)) {
                                        v = attrs[k];
                                        target.setAttribute(k, fn(itm[v]));
                                    }
                                }
                            }
                            if (text) {
                                // insert text node with new data item
                                removed = target.childNodes[text.position];
                                newText = document.createTextNode(fn(itm[text.content]));
                                target.replaceChild(newText, removed);
                            }
                        }, INTERVAL);
                    }, INTERVAL);
                } else { // rebuild the child nodes if the data length larger than the cache length
                    // clear the mirror and cache
                    this.clean();
                    this.putNodes(this.destination, this.template, data, fn);
                }
                self = null;
            }
        };
        $.tmpl = function () {
            return new Template();
        };
    }();
    /****************************
     Animation simple implementation
usage:  $.fx.animate(domElm, {
            top: 200,
            left: -300,
            width: 80
        }, 'ease', 3000, 30);
     ***************************/
    ! function () {
        // !attention: you must explicitly setting the initial css property value in IE8,
        //             otherwise, the corresponding property animation will not work
        $.fx = _create({
            // @description: encapsulated animate = null
            // @param:  {DOM}           [domElm]  // the DOM element to animate effect
            // @param:  {object}        [css]     // the final style on the DOM element
            // @param:{function/string} [ease]   // the easing effect function
            // ease function param: (startValue, distance, steps, count)
            // @param:  {number}        [step]    // the steps to finish the animation
            // @param:  {number}        [duration]// the duration to finish the animation
            animate: function (domElm, css, ease, duration, step) {
                if (!domElm || domElm.nodeType !== 1) {
                    console.log('Error: uTools.fx.animate - the parameter 1 must be a DOM element.');
                    return;
                }
                if (!css || typeof css != 'object') {
                    console.log('Error: uTools.fx.animate - the parameter 2 must be an object with property, representing the final css to change.');
                }
                ease = ease || this.linear;
                // get the internal supported function as effect
                if (typeof ease == 'string') {
                    ease = this[ease];
                    if (!ease) {
                        console.log('Error: uTools.fx.animate - the parameter 3 is not a valid string, or you can use a function to process the values.');
                    };
                }
                if (duration != null && !$.fn.isNumeric(duration)) {
                    console.log('Error: uTools.fx.animate - the parameter 4 must be a number.');
                }
                if (step != null && !$.fn.isNumeric(step)) {
                    console.log('Error: uTools.fx.animate - the parameter 5 must be a number.');
                }
                var p, start, end, dir, diff, intv, count,
                    styles = [], // cache the css property modified information
                    curStyle,
                    self = this;

                step = step || 100;
                duration = duration || 3000;
                intv = ~~(duration / step); // get the integer interval time

                return new $.Promise(function (resolve, reject) {
                    setTimeout(function () {
                        curStyle = $.dom.getStyle(domElm);
                        for (p in css) {
                            if (css.hasOwnProperty(p)) {
                                end = self.parseValue(css, p);
                                if (end == null) {
                                    // set the css directly if return nothing
                                    domElm.style[p] = css[p];
                                } else {
                                    // if end get valid return
                                    start = parseFloat(curStyle[p]);
                                    diff = end - start;
                                    if (!diff) continue;
                                    dir = diff > 0 ? 1 : -1;
                                    styles.push({
                                        // the css property name
                                        prop: p,
                                        // the start css value
                                        start: start,
                                        // the final css value
                                        end: end,
                                        // the distance between start and final vlaues
                                        diff: diff,
                                        // the direction for increasing or decreasing of ccs value
                                        dir: dir
                                    });
                                }
                            }
                        }
                        curStyle = css = null;
                        // stepping counter
                        count = 0;
                        // determine whether some css need modified.
                        if (styles.length) {
                            ! function f() {
                                styles.forEach(function (s) {
                                    self.update(domElm, s, step, count, ease);
                                });
                                count++;
                                if (count <= step) {
                                    setTimeout(f, intv);
                                } else {
                                    styles = null;
                                    resolve('animate completed!');
                                }
                            }();
                        }
                    }, 0);
                });
            },
            // @description: simply parse the position and size property
            // @param:  {object} [css]     // the final style on the DOM element
            // @param:  {string} [prop]    // the specific css property
            parseValue: function (css, prop) {
                var m1, m2, k, v,
                    r1 = /^(top|right|bottom|left|width|height)$/,
                    r2 = /([+-]?\d+)(px)?/;
                // r3 = /(margin|padding|border)(\w*)/,
                // directions = ['top', 'right', 'bottom', 'left'];

                if (m1 = prop.match(r1)) {
                    v = css[prop] + '';
                    if (m2 = v.match(r2)) {
                        return +m2[1]; // get the number
                    }
                }
            },
            // update the current style
            update: function (domElm, style, step, count, fx) {
                // the current space or distance, gone through
                var space = fx(style.start, style.diff, step, count);
                // change the space untill reach the final value
                if (style.dir > 0 ? space < style.end : space > style.end) {
                    domElm.style[style.prop] = space + 'px';
                } else {
                    domElm.style[style.prop] = style.end + 'px';
                    console.log('Message: animate - animation completed.');
                }
            },
            /********* the easing effect function **************/
            linear: function (a, b, c, x) {
                return +(a + b * x / c).toFixed(4);
            },
            ease: function (a, b, c, x) {
                return +(a + b * ((Math.sin((Math.PI / 2) * (2 * x / c - 1)) + 1) / 2).toFixed(4));
            },
            easeOut: function (a, b, c, x) {
                return +(a + b * (Math.sin((Math.PI / 2) * (x / c))).toFixed(4));
            },
            easeIn: function (a, b, c, x) {
                return +(a + b * (Math.sin((Math.PI / 2) * (x / c - 1)) + 1).toFixed(4));
            }
        });
    }();
    /**************
    dragdrop event
usage: var drag = $.drag(draggableElm, true); // new a DragDrop object to process the draggable event
    **************/
    ! function () {
        function DragDrop() {
            this.handlers = {};
        }
        DragDrop.prototype = {
            constructor: DragDrop,
            add: function (type, handler) {
                if (typeof this.handlers[type] == 'undefined') {
                    this.handlers[type] = [];
                }
                this.handlers[type].push(handler);
            },
            remove: function (type, handler) {
                var handlers = this.handlers[type],
                    len = handlers.length,
                    idx = 0;
                if ($.fn.isArray(handlers) && len) {
                    do {
                        if (handlers[idx] == handler) {
                            handlers.splice(idx, 1);
                            break;
                        }
                    } while (++idx < len);
                }
            },
            fire: function (event) {
                var handlers = this.handlers[event.type],
                    len = handlers.length,
                    idx = 0;
                if ($.fn.isArray(handlers) && len) {
                    do {
                        handlers[idx](event);
                    } while (++idx < len);
                }
            }
        };
        // @param: {DOM}     [dragelm] // DOM element with selector - draggable
        // @param: {boolean} [notMove] // draggable element can not move but can set its child nodes movable
        $.drag = function (dragElm, notMove) {
            var dragTarget = $(dragElm),
                dragDrop = new DragDrop(),
                dragging = null,
                diffX = 0,
                diffY = 0;

            function dragHandle(event) {
                event = $.ev.format(event);
                var currentTarget = event.currentTarget,
                    target = event.target,
                    x = event.clientX,
                    y = event.clientY;
                // to fix the IE8 not support event.currentTarget
                if (!currentTarget) {
                    isCurrent = false;
                    currentTarget = event.target;
                    do {
                        if (currentTarget.className.indexOf('draggable') > -1) {
                            isCurrent = true;
                            break;
                        }
                        currentTarget = currentTarget.parentNode;
                    } while (--stopLimit > 0);
                    if (!isCurrent) {
                        console.log('Error: dragstart - event handler had been bound to a wrong DOM element.');
                        return;
                    }
                }
                switch (event.type) {
                case 'mousedown':
                    if (currentTarget.className.indexOf('draggable') > -1) {
                        dragging = currentTarget;
                        diffX = x - currentTarget.offsetLeft;
                        diffY = y - currentTarget.offsetTop;
                        dragDrop.fire({ type: 'dragstart', currentTarget: currentTarget, target: target, clientX: x, clientY: y });
                    }
                    break;
                case 'mousemove':
                    if (!!dragging) {
                        if (!notMove) {
                            dragging.style.left = x - diffX + 'px';
                            dragging.style.top = y - diffY + 'px';
                        }
                        dragDrop.fire({ type: 'drag', currentTarget: currentTarget, target: target, clientX: x, clientY: y });
                    }
                    break;
                case 'mouseup':
                    if (!!dragging) {
                        dragDrop.fire({ type: 'dragend', currentTarget: currentTarget, target: target, clientX: x, clientY: y });
                        dragging = null;
                    }
                    break;
                case 'mouseleave':
                    // [issue fixed]use the mouseleave can not bubble,
                    // to fix the the mouse target still movable, when mouse leave the target zone,
                    if (!!dragging) {
                        dragDrop.fire({ type: 'dragend', currentTarget: currentTarget, target: target, clientX: x, clientY: y });
                        dragging = null;
                    }
                    break;
                }
            }
            dragDrop.enable = function () {
                dragTarget.on('mousedown', dragHandle);
                dragTarget.on('mousemove', dragHandle);
                dragTarget.on('mouseup', dragHandle);
                dragTarget.on('mouseleave', dragHandle);
            };
            dragDrop.disable = function () {
                dragTarget.off('mousedown', dragHandle);
                dragTarget.off('mousemove', dragHandle);
                dragTarget.off('mouseup', dragHandle);
                dragTarget.on('mouseleave', dragHandle);
            };
            return dragDrop;
        };
    }();
}(uTools, window || self);
