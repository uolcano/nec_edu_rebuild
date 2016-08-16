/******************
responsive page and course cards 
usage: $.resize() // when window loaded
 ******************/
! function ($) {
    var MAXLEN = 20,
        MINLEN = 15,
        $blockCenter1,
        $blockCenter2,
        $mainLeft,
        $ftWrp,
        $ftWrpChilds;

    function resize(cache) {
        var winWidth = $.dom.getWinWidth();
        if (resize.isIE) {
            // using refined responsive width
            // [issue fixed]to fix the scroll bar width producing some unexpected influence
            if (winWidth < 1205) {
                $blockCenter1.css({ width: 960 });
                $ftWrp.css({ padding: 0 });
                $ftWrpChilds.css({ 'padding-right': 70 });
            } else if (winWidth < 1222) {
                $blockCenter2.css({ width: 1188 });
                $ftWrp.css({ padding: '0 50px' });
                $ftWrpChilds.css({ 'padding-right': 100 });
            } else {
                $blockCenter1.css({ width: 1205 });
            }
            // the left main zone of the course list
            // fix the boundary value
            if (winWidth < 1225) {
                $mainLeft.css({ width: 735 });
            } else {
                $mainLeft.css({ width: 980 });
            }
        }

        // change the number of the course loading card
        if (winWidth < 1225) {
            $.temp.getPageSize(MINLEN);
            cache.forEach(function (card) {
                card.style.display = 'none';
            });
        } else {
            $.temp.getPageSize(MAXLEN);
            cache.forEach(function (card) {
                card.style.display = 'block';
            });
        }
    }

    $.resize = function () {
        var courseContainer = $('.course--list').get(0),
            courseCards, // course item
            cache, // the cache of course item to hidden when nessessary
            idx, card;

        clearTimeout($.resize.tId);

        resize.isIE = !+[1, ] && ($.fn.isIE.ver == 8 || $.fn.isIE()); // if IE < 9

        if (resize.isIE) {
            $blockCenter1 = $('.block-center');
            $blockCenter2 = $('.course--container .block-center');
            $mainLeft = $('.main-left');
            $ftWrp = $('.footer .wrapper');
            $ftWrpChilds = $('.footer .wrapper > *');
        }
        // ensure the course container is valid
        if (courseContainer.childNodes.length) {
            courseCards = $('.course--item').get();
            // cache the course item to be hidden
            cache = [];
            idx = courseCards.length;
            while (idx-- > MINLEN) {
                cache.push(courseCards[idx]);
            }
            // response the window width when initial loaded page
            resize(cache);
            window.onresize = function () {
                // throttle the resize event
                $.fn.throttle(resize, 100, [cache]);
            };
        } else {
            $.resize.tId = setTimeout(function () {
                $.resize();
            }, 3000);
        }
    }
}(uTools);

/****************************
        carousel
usage: var caro = $.carousel();
       caro.enable();       // enable a carousel
       caro.disable();      // disable a carousel
       $.carousel.pause();  // disable all carousel
       $.carousel.resume(); // enable all carousel
****************************/
! function ($) {
    var INTERVAL = 5000; // the loop timeout interval constant

    // picture fade in animation
    function fadeIn($sld, dur, step) {
        var count = 0,
            factor = +(1 / step).toFixed(6),
            tIntv = dur / step;
        // sld = $sld.get(0);
        dur = dur || 1000;
        step = step || 20;
        return new $.Promise(function (resolve) {
            setTimeout(function f() {
                var opacity = (++count * factor).toFixed(6);
                if ($.fn.isIE.ver < 9 || $.fn.isIE(8)) {
                    $sld.css({ filter: 'alpha(opacity=' + (opacity * 100) + ')' })
                        // sld.style.filter = 'alpha(opacity=' + opacity * 100 + ')';
                } else {
                    $sld.css({ opacity: opacity });
                    // sld.style.opacity = opacity;
                }
                if (opacity < 1) {
                    setTimeout(f, tIntv);
                } else {
                    f = $sld = null;
                    resolve('fadeIn completed!');
                }
            }, 0);
        });
    }
    // create the cache of slides and indicators
    function initCache(sldSel, indcSel) {
        var cache = [],
            $slide = $(sldSel),
            $indicator = $(indcSel);

        if (!$slide || !$indicator) {
            console.log('Error: initCache - selectors wrong');
        }

        $indicator.removeClass('active');
        $indicator.get().forEach(function (indc, i) {
            var $sld = $($slide.get(i)),
                $indc = $(indc);
            $sld.data('index', i);
            $indc.data('index', i);
            if ($sld) {
                $sld.css({ zIndex: 12 - i });
                cache.push({
                    sld: $sld,
                    indc: $indc
                });
            }
        });
        cache.active = 0;
        cache[0].indc.addClass('active');
        return cache;
    }

    function next(cache, dur, step, idx) {
        next.complete = false;

        var curIdx = cache.active,
            gotoIdx;
        gotoIdx = idx != null ? +idx :
            (curIdx + 1) % cache.length;
        dur = dur || 1000;
        step = step || 20;
        // switch active indicator
        cache[curIdx].indc.removeClass('active');
        cache[gotoIdx].indc.addClass('active');
        // [issue fixed] to fix the IE to fast to set z-index
        if ($.fn.isIE.ver < 9 || $.fn.isIE(8)) {
            cache[gotoIdx].sld.css({ filter: 'alpha(opacity=0)' });
        } else {
            cache[gotoIdx].sld.css({ opacity: 0 });
        }
        // preprocess the slides z-index
        cache.forEach(function (itm, i) {
            if (i == curIdx || i == gotoIdx) return;
            itm.sld.css({ zIndex: 10 });
        });
        cache[curIdx].sld.css({ zIndex: 11 });
        cache[gotoIdx].sld.css({ zIndex: 12 });

        return fadeIn(cache[gotoIdx].sld, dur, step).then(function () {
            cache.active = gotoIdx;
            // next complete
            next.complete = true;
        });
    }

    function autoPlay(cache, intv, dur, step) {
        var time = +new Date();
        intv = intv || INTERVAL;
        autoPlay.tId = setTimeout(function () {
            autoPlay.complete = false;
            next(cache, dur, step).done(function () {
                // next complete then autoPlay complete
                autoPlay.complete = true;
                console.log('Message: autoPlay - ' + (+new Date() - time));
                autoPlay(cache, intv, dur, step);
            });
        }, intv);
    }

    // ensure the previous next process completed
    function polling(fn, args) {
        // console.log(fn.complete);
        $.fn.sleep(fn, 100, args);
    }

    function Carousel(sel) {
        var sld = sel + ' .slide',
            indc = sel + ' .indicator';
        this.$set = {
            caro: $(sel),
            sld: $(sld),
            indc: $(indc)
        };
        // cache of the slides and indicators, and the active index
        this.cache = initCache(sld, indc);
    }

    $.carousel = function (sel, intv, dur, step) {
        var caro = new Carousel(sel, intv);

        function handle(event) {
            event = $.ev.format(event);
            var target, index;
            switch (event.type) {
            case 'mouseenter':
                clearTimeout(autoPlay.tId);
                break;
            case 'mouseleave':
                // waiting for autoPlay complete
                polling(autoPlay, [caro.cache, intv, dur, step]);
                break;
            case 'mouseover':
                target = event.target;
                index = target.getAttribute('data-index');
                // throttle user repetitive actions
                $.fn.throttle(polling, 400, [next, [caro.cache, dur, step, +index]]);
                break;
            }
        }

        caro.enable = function () {
            next.complete = true;
            autoPlay.complete = true;
            autoPlay(this.cache, intv, dur, step);
            this.$set.caro.on('mouseenter', handle);
            this.$set.caro.on('mouseleave', handle);
            this.$set.indc.on('mouseover', handle);
        };
        caro.disable = function (argument) {
            clearTimeout(autoPlay.tId);
            this.$set.caro.off('mouseenter', handle);
            this.$set.caro.off('mouseleave', handle);
            this.$set.indc.off('mouseover', handle);
        };
        $.carousel.caros.push(caro);
        return caro;
    };
    $.carousel.caros = [];
    $.carousel.pause = function () {
        this.caros.forEach(function (caro) {
            caro.disable();
        });
    };
    $.carousel.resume = function () {
        this.caros.forEach(function (caro) {
            caro.enable();
        });
    }
}(uTools);

/*************************
automatic scroll up course rank
usage: $.temp.roll();         // roll rank up when rank data inserted
       $.temp.roll.pause()    // pause roll up
       $.temp.roll.resume()   // resume roll up
*************************/
! function ($) {
    var INTERVAL,
        rank;

    function roll() {
        return $.fx.animate(rank, {
            top: -70
        }, 'ease', 1000, 10).done(function (val) { // for pause it
            rank.appendChild(rank.firstChild);
            rank.style.top = '0';
            if (!roll.isPaused) {
                roll.intvId = setTimeout(roll, INTERVAL);
            }
        });
    }

    $.temp.roll = function () {
        var children;
        rank = $('.js-course--rank').get(0);
        INTERVAL = 5000;
        roll.isPaused = false;

        // [issue fixed]to fix the diffrence of childNodes in IE,
        // and also domElm.children not work well.
        children = rank.childNodes;
        Array.prototype.slice.call(children).forEach(function (child) {
            if (child.nodeType !== 1) {
                rank.removeChild(child);
            }
        });
        setTimeout(roll, INTERVAL);
        children = null;
    };
    $.temp.roll.pause = function () {
        roll.isPaused = true;
        clearTimeout(roll.intvId);
        console.log('roll stoped')
    };
    $.temp.roll.resume = function () {
        roll.isPaused = false;
        roll();
        console.log('roll resumed');
    }
}(uTools);

/****************************
 select page and load data
usage: $.temp.getPageSize(num) // to get the psize as to the query option
****************************/
! function ($) {
    var tmplObjs = {}, // store the Template instances
        destObjs = {}, // store the references of destinated elements
        tmpls = $('.js-template').get(), // array of the template element
        totalPage, // the total number of pages in remote database
        pageNo = 1, // current selected page number to load
        psize = 20, // current selected page size to load
        courseType = 10, // current selected course category type to load
        $tabs = $('.js-tab'), // the tabs within category picker
        cache = [], // cache the page controls, prev and next store as DOM, others as wrapped object
        urls = { // the urls for course list and hot course rank
            card: 'http://study.163.com/webDev/couresByCategory.htm',
            rank: 'http://study.163.com/webDev/hotcouresByCategory.htm'
        },
        optObjs = { // the query options for course list and hot course rank
            card: { method: 'get', timestamp: true, pageNo: pageNo, psize: psize, type: courseType },
            rank: { method: 'get', timestamp: true }
        };

    // filter the ajax data
    function dataFilter(val) {
        var result;
        switch (val) {
        case null:
            result = '暂无';
            break;
        default:
            result = val;
            break;
        }
        return result;
    }

    // @description: insert loaded ajax data into course cards
    // @param: [Template instance] {tmpl}
    // @param: [string] {url}
    function loadData(tmpl, url) {
        var query = {
            method: 'get',
            timestamp: true,
            pageNo: pageNo,
            psize: psize,
            type: courseType
        };
        $.ajax(url, query).done(function (xhr) {
            var res = JSON.parse(xhr.responseText),
                data = res.list;
            totalPage = res.totalPage;
            tmpl.putData(data, dataFilter);
        });
    }
    // filter the text of DOM elements
    function textFilter(text, val) {
        return (+text + +val);
    }
    // move the active indicator
    function move($indc, curIdx, step) {
        $indc.removeClass('active');
        cache[curIdx + step].addClass('active');
        cache.active = curIdx + step;
    }

    // @description: active the click event delegation on category tab and page picker
    // @param: [Template instance] {tmpl}
    // @param: [string] {url}
    function load(tmpl, url) {
        var $pgIndc = $('.pager--page'), // all the indicators
            $cate = $('.course--category'), // category picker
            $pager = $('.js-pager'), // the page picker
            len = cache.length;
        // category event delegation
        $cate.on('click', function (event) {
            event = $.ev.format(event);
            var target = event.target,
                className = target.className,
                $target = $(target);
            // ensure event target is a tab
            if (className.indexOf('js-tab') > -1) {
                // exclude click actions on the same button
                if (className.indexOf('active') > -1) return;
                // change the type of query option to get course data
                courseType = $target.data('type');
                $tabs.removeClass('active');
                $target.addClass('active');
                // throttle the request
                $.fn.throttle(loadData, 300, [tmpl, url]);
            }
        });
        // page picker event delegation
        $pager.on('click', function (event) {
            event = $.ev.format(event);
            var target = event.target,
                $target = $(target),
                className = target.className,
                clkIdx, // index of the clicked button in cache
                curIdx, // index of current active indicator in cache
                edgeL, // the mix edge value of page number
                edgeR, // the max edge value of page number
                step; // the difference between the clicked and current active button

            // get the index of current active indicator in cache
            cache.some(function (e, i) {
                if (e.get(0).className.indexOf('active') > -1)
                    return (curIdx = i) || true;
            });
            edgeL = +cache[0].text();
            edgeR = +cache[len - 1].text();
            // click the control buttons
            if (target == cache.prev) { // prev button
                if (curIdx > len / 2) {
                    // index of active at right part 
                    move($pgIndc, curIdx, -1);
                } else if (edgeL > 1) {
                    // the left edge value large than 1
                    $pgIndc.text(-1, textFilter, false);
                } else if (curIdx > 0) {
                    // index of active at left part
                    move($pgIndc, curIdx, -1);
                }
            } else if (target == cache.next) { // next button
                if (curIdx < len / 2) {
                    // index of active at left part
                    move($pgIndc, curIdx, +1);
                } else if (edgeR < totalPage) {
                    // the right edge value less than totalPage
                    $pgIndc.text(+1, textFilter, false);
                } else if (curIdx < len - 1) {
                    // index of active at right part
                    move($pgIndc, curIdx, +1);
                }
            } else if (className.indexOf('pager--page') > -1) { // indicators
                // get the clicked target index
                clkIdx = $pgIndc.source.indexOf(target);
                // the distance between the clicked target and current active
                step = clkIdx - curIdx;
                if (curIdx < len / 2) { // index of active at left part
                    if (curIdx + step >= 0 && curIdx + step < len / 2) {
                        // only move active
                        // if reached index still at left part,
                        // and not less than left min index
                        move($pgIndc, curIdx, step);
                    } else {
                        // otherwise move active and change all the text value
                        $pgIndc.text(curIdx + step - len / 2, textFilter, false);
                        move($pgIndc, curIdx, len / 2 - curIdx);
                    }
                } else if (curIdx > len / 2) { // index of active at right part
                    if (curIdx + step > len / 2 && curIdx + step <= len - 1) {
                        // only move active
                        // if reached index still at right part,
                        // and not larger than right max index
                        move($pgIndc, curIdx, step);
                    } else {
                        // otherwise move active and change all text value
                        $pgIndc.text(curIdx + step - len / 2, textFilter, false);
                        move($pgIndc, curIdx, len / 2 - curIdx);
                    }
                } else { // index of active at middle point
                    if (edgeL + step < 1) {
                        // if reached left edge value less than 1
                        // force the edge vlaue into 1
                        $pgIndc.text(1 - edgeL, textFilter, false);
                        move($pgIndc, curIdx, step + edgeL - 1);
                    } else if (edgeR + step > totalPage) {
                        // if reached right edge value larger than totalPage
                        // force the edge value into totalPage
                        $pgIndc.text(totalPage - edgeR, textFilter, false);
                        move($pgIndc, curIdx, step + edgeR - totalPage);
                    } else {
                        // otherwise only change all the text value
                        $pgIndc.text(step, textFilter, false);
                    }
                }
            }
            // ensure click the page picker controller
            if (className.indexOf('pager--') > -1) {
                // change the pageNo of query option to get course data
                pageNo = cache[cache.active].text();
                // throttle the request
                $.fn.throttle(loadData, 300, [tmpl, url]);
            }
        });
    }

    // initialize the tabs
    $($tabs.removeClass('active').get(0)).addClass('active');
    // initialize the page indicators
    $('[class*="pager--"]').removeClass('active')
        .source.forEach(function (itm, idx) {
            var className = itm.className,
                $itm = $(itm);

            if (className.indexOf('--prev') > -1) {
                cache.prev = itm;
            } else if (className.indexOf('--next') > -1) {
                cache.next = itm;
            } else {
                if (idx === 1) {
                    $itm.addClass('active');
                    cache.active = 0;
                }
                cache.push($itm);
                $itm.data('index', idx);
            }
        });

    // traverse the templates
    $.fn.chunk(tmpls, function (tmpl) {
        var $tmpl = $(tmpl),
            name = $tmpl.data('templateName'),
            // use innerHTML, otherwise innertext will return nothing in IE8
            tmplStr = tmpl.innerHTML,
            url = urls[name],
            query = optObjs[name];

        // the Template instance
        tmplObjs[name] = $.tmpl();
        // the container element to be inserted nodes, created as template
        destObjs[name] = $('.js-course--' + name).get(0);

        $.ajax(url, query).done(function (xhr) {
            var res = JSON.parse(xhr.responseText),
                data = $.fn.isArray(res) ? res : res.list;

            tmplObjs[name].putNodes(destObjs[name], tmplStr, data, dataFilter);

            if (name == 'card') {
                $.resize();
                totalPage = res.totalPage;
                // the page picker is disable,
                // until the initial course cards put completely
                load(tmplObjs[name], url);
            } else if (name == 'rank') {
                $.temp.roll();
            }
        });
    }, 100);
    // expose a function to get the min or max psize
    // when the window resized
    $.temp.getPageSize = function (num) {
        psize = num;
    };
}(uTools);

/*****************
    form login
usage: $.temp.login() // to open the login window
 ****************/
! function ($) {
    var $login, // the logon window
        $form, // the form
        $tip, // information tips
        $texts, // input box
        $submit, // submit button
        $close, // the close button
        fieldset, // form controls
        validate, // validate process functions
        inputText; // the correct user name and password

    function errShow(text) {
        $tip.text(text);
        $tip.css({ visibility: 'visible' });
    }
    // disable the submit button
    function ban(btn, disabled) {
        fieldset.forEach(function (elm) {
            elm.disabled = disabled;
        });
        btn[(disabled ? 'add' : 'remove') + 'Class']('disabled');
    }
    // focus or keypress
    function focus(event) {
        event = $.ev.format(event);

        var target = event.target,
            $target = $(target),
            t = true;
        $target.removeClass('danger');
        $texts.source.forEach(function (txt) {
            if (!validate[txt.type](txt.value)) t = false;
        })
        if (t) $tip.css({ visibility: 'hidden' });
    }
    // focus leave
    function blur(event) {
        event = $.ev.format(event);

        var target = event.target,
            $target = $(target),
            type = target.type,
            value = target.value,
            label = target.nextSibling,
            stopLimit = 5;
        // get the label text content
        while (label.nodeType !== 1 && --stopLimit > 0) {
            label = label.nextSibling;
        }

        $target.removeClass('danger');
        $target.removeClass('success');

        if (validate[type](value)) {
            $target.addClass('success');
            $tip.css({ visibility: 'hidden' });
        } else {
            $target.addClass('danger');
            errShow($(label).text() + ' wrong. please input: ' + inputText[type]);
        }
    }
    // submit form
    function submit(event) {
        event = $.ev.format(event);
        event.preventDefault();

        var target = event.target,
            url = target.action,
            usrInputs = [],
            t = true,
            query = {
                method: 'get',
                timestamp: true
            };

        // disable the submit button
        ban($submit, true);
        $texts.source.forEach(function (txt) {
            var $txt = $(txt),
                type = txt.type,
                name = txt.name,
                value = txt.value;

            usrInputs.push({ name: name, value: value });

            if (validate[type](value)) {
                $txt.removeClass('danger');
                $txt.addClass('success');
            } else {
                t = false;
                $txt.removeClass('success');
                $txt.addClass('danger');
                // release the submit button
                ban($submit, false);
            }
        });
        // when username and password is valid
        if (t) {
            // encrypt user inputs
            usrInputs.forEach(function (itm) {
                query[itm.name] = md5(itm.value);
            });
            // send ajax submit the form
            $.ajax(url, query).done(function (xhr) {
                if (xhr.responseText == 1) {
                    errShow('Login successfully.');
                    // release the submit button
                    ban($submit, false);
                    close();
                    $.temp.follow();
                } else {
                    errShow('username or password wrong.');
                    ban($submit, false);
                }
            }, function (xhr) {
                errShow(xhr.responseText);
                // release the submit button
                ban($submit, false);
            });
        }
        target = usrInputs = query = null;
    }
    // close the form window
    function close(event) {
        // [issue fixed]fix firefox not support event is undefined
        event = event && $.ev.format(event);

        $login.css({ display: 'none' });

        $texts.removeClass('danger');
        $texts.removeClass('success');
        $tip.css({ visibility: 'hidden' });

        $texts.off('focus', focus);
        $texts.off('keypress', focus);
        $texts.off('blur', blur);
        $form.off('submit', submit);
        $close.off('click', close);

        $form = $tip = $texts = $submit = $close = inputText = validate = null;

        $.carousel.resume();
        $.temp.roll.resume();
    }

    $.temp.login = function () {
        $.carousel.pause()
        $.temp.roll.pause();

        $login = $('.js-login');
        $form = $('.js-form');
        $tip = $('.js-form--tips');
        $texts = $('.js-form--text');
        $submit = $('.js-form--submit');
        $close = $('.js-form--close');
        fieldset = Array.prototype.slice.call($form.get(0).elements);

        inputText = {
            text: 'studyOnline',
            password: 'study.163.com'
        }

        validate = {
            text: function (text) {
                return /\S{10,12}/.test(text);
            },
            password: function (password) {
                return /\S{6,16}/.test(password);
            }
        }

        $texts.on('focus', focus);
        $texts.on('keypress', focus);
        $texts.on('blur', blur);
        $form.on('submit', submit);
        $close.on('click', close);

        $login.css({ display: 'block' });
    };
}(uTools);

/***************************
close top notification and click the follow buttons, controlled by cookie
usage: $.temp.follow() // success to follow
***************************/
! function ($) {
    var c$ = $.cookies, // $.cookies tools
        preSel = 'js-cookie--', // js-cookie-- pre-selector
        $btns = $('[class*="' + preSel + '"]'), // all the button operated using cookies
        $topBar = $('.top-bar'), // top notification
        $toFollow = $('.tofollow'), // follow button
        $followed = $('.followed'), // cancel follow button
        $txtCount = $('.js-text--count'), // fans counter
        hideNotify = c$.get('hideNotify'), // is hidden the notification
        followSuc = c$.get('followSuc'), // is follow successfully
        selSet = { // functions corresponding to the elements' selectors
            // close the top notification
            'js-cookie--close': function () {
                $topBar.css({ display: '' });
                c$.set('hideNotify', true);
            },
            // follow
            'js-cookie--follow': function () {
                var loginSuc = c$.get('loginSuc');
                if (loginSuc == 'true') {
                    $.temp.follow();
                } else {
                    $.temp.login();
                }
            },
            // cancel follow
            'js-cookie--unfollow': function () {
                switchState(false);
                c$.set('followSuc', false);
            }
        };

    // switch the follow button's state
    function switchState(isDone) {
        $toFollow.css({ display: (isDone ? 'none' : '') });
        $followed.css({ display: (isDone ? 'inline-block' : '') });
        // modify the fans counter
        $txtCount.text(+$txtCount.text() + (isDone ? +1 : -1));
    }

    // initialize the status of elements, controlled by cookie, when page loaded
    if (hideNotify != 'true') {
        $topBar.css({ display: 'block' });
    }
    switchState(followSuc == 'true');

    // bind event handler to buttons controlled by cookie
    $btns.on('click', function (event) {
        var sel, fn, target, isCurrent,
            stopLimit = 5; // restrict the times of loop
        event = $.ev.format(event);
        event.preventDefault();
        target = event.currentTarget;

        // [issue fixed]to fix the IE8 not support event.currentTarget
        // but at least, IE support event bubble,
        // so traversing the target's parent will find the DOM element bound with this handler
        if (!target) {
            isCurrent = false;
            target = event.target;
            do {
                if (target.className.indexOf(preSel) > -1) {
                    isCurrent = true;
                    break;
                }
                target = target.parentNode;
            } while (--stopLimit > 0);
            if (!isCurrent) {
                console.log('Error: click - event handler had been bound to a wrong DOM element.');
                return;
            }
        }
        for (sel in selSet) {
            if (selSet.hasOwnProperty(sel)) {
                if (target.className.indexOf(sel) > -1) {
                    fn = selSet[sel];
                    break;
                }
            }
        }
        fn ? fn() :
            console.log('Error: js-cookie - failed to find the process function failed.');
    });
    // expose the follow interface
    $.temp.follow = function () {
        // store the cookies among a day. GMT+0800
        c$.set('loginSuc', true, new Date(1970, 0, 2, 8).getTime());
        // request for follow
        $.ajax('http://study.163.com/webDev/attention.htm').done(function (xhr) {
            if (+xhr.responseText === 1) {
                c$.set('followSuc', true);
                switchState(true);
            }
        });
    };
}(uTools);

/*******************
drap the progress bar and volume bar
usage: $.temp.drag.enable();  // enable progress or volume drag
       $.temp.drag.disable(); // disable them
 *******************/
! function ($) {
    // delegation on the progress bar and sound
    // benefit: 1. event bubble, all childs can respond the event
    //          2. event valid range, restrict the progress and volume's ranges
    var drag = $.drag('.video .draggable', true),
        video = $('.video--primary').get(0),
        dragging,
        pgrs,
        vlm,
        offset;
    // drag the video progress and volume
    drag.add('dragstart', function (event) {
        var target = event.currentTarget,
            className = target.className,
            stopLimit = 10;

        dragging = target;
        if (dragging.className.indexOf('progress-bar') > -1) {
            pgrs = dragging.querySelector('.progress');
            $.temp.play();
        } else if (dragging.className.indexOf('sound-bar') > -1) {
            vlm = dragging.querySelector('.volume');
        }
        offset = $.dom.getOffset(dragging);
    });
    drag.add('drag', function (event) {
        var width, height, top;
        if (!!dragging) {
            if (pgrs) {
                width = event.clientX - offset.left;
                pgrs.style.width = width + 'px';
            } else if (vlm) {
                height = offset.top + offset.height - event.clientY;
                top = event.clientY - offset.top;
                // restrict the range
                vlm.style.height = (height < 0 ? 0 : (height > 100 ? 100 : height)) + 'px';
                vlm.style.top = (top < 0 ? 0 : (top > 100 ? 100 : top)) + 'px';
            }
        }
    });
    drag.add('dragend', function (event) {
        var width, height, top;
        if (!!dragging) {
            if (pgrs) {
                width = event.clientX - offset.left;
                pgrs.style.width = width + 'px';
                // seeked at the dragend point to change the video current time
                video.currentTime = width * video.duration / dragging.clientWidth;
                $.temp.play();
            } else if (vlm) {
                height = offset.top + offset.height - event.clientY;
                top = event.clientY - offset.top;
                // restrict the range
                height = height < 0 ? 0 : (height > 100 ? 100 : height);
                vlm.style.height = height + 'px';
                vlm.style.top = (top < 0 ? 0 : (top > 100 ? 100 : top)) + 'px';
                video.volume = height / 100;
                video.muted && (video.muted = false);
            }
            dragging = pgrs = vlm = null;
        }
    });
    $.temp.drag = drag;
}(uTools);
/*********************************
     video control
usage: $.temp.openVideo()
       $.temp.play()
*********************************/
! function ($) {
    var $videoModule,
        $video,
        $close,
        $controlBar,
        $progressBar,
        $cache, // cache stick
        $progress, // progress stick
        $win, // video viewport
        $play, // play buttons
        $full, // fullscreen button
        $curTime, // current time
        $playStatus, // playing status information
        $soundCtrl, // sound control component
        $soundIcon, // mutable sound icon
        video, // the video element
        firstLoad;

    // time normalization
    function normalizeTime(sec) {
        var s = ~~(sec % 60), // get the floor integer of number
            m = ~~(sec / 60),
            h = ~~(m / 60),
            time;
        time = (s < 10 ? '0' : '') + s;
        time = ((m < 10 ? '0' : '') + m) + ':' + time;
        h && (time = h + ':' + time);
        return time;
    }
    // hide or show the controls bar 
    function hide() {
        try { // may throw reference error when close the video viewport
            $controlBar.removeClass('hidden');
            clearTimeout(hide.intvId);
            hide.intvId = setTimeout(function () {
                $controlBar.addClass('hidden');
            }, 5000);
        } catch (e) {
            console.log(e);
        }
    }
    // hidden when mouse stop, show when mouse move
    function moveShowHandle(event) {
        $.fn.throttle(hide, 200);
    }
    // play control
    function playHandle() {
        $play[(video.paused ? 'remove' : 'add') + 'Class']('paused');
        video.paused || $playStatus.text('Paused');
        video[video.paused ? 'play' : 'pause']();
    }
    // mute control
    function muteHandle(event) {
        var className = event.target.className;
        video.muted = video.muted ? false : true;
    }
    // change play status when seeking to a new currentTime
    function canFull() {
        return document.fullscreenEnabled ||
            document.webkitFullscreenEnabled ||
            document.mozFullScreenEnabled ||
            document.msFullscreenEnabled;
    }

    function requestFull(domElm) {
        if (domElm.requestFullscreen) {
            domElm.requestFullscreen();
        } else if (domElm.webkitRequestFullscreen) {
            domElm.webkitRequestFullscreen();
        } else if (domElm.mozRequestFullScreen) {
            domElm.mozRequestFullScreen();
        } else if (domElm.msRequestFullscreen) {
            domElm.msRequestFullscreen();
        }
    }

    function fullElm() {
        return document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement;
    }

    function exitFull() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }

    // fullscreen control
    function fullHandle(event) {
        if (canFull()) {
            fullElm() ?
                exitFull() :
                requestFull(video);
        } else {
            $win.hasClass('screenfulled') ?
                $win.removeClass('screenfulled') :
                $win.addClass('screenfulled');
        }
    }
    // initialize 
    function loadStartHandle(event) {
        var target = event.target;
        // low sound by default
        target.volume = 0;
        $soundCtrl.removeClass('lowvoice');
        $soundCtrl.removeClass('loudvoice');
        $soundCtrl.addClass('muted');
        // play prompt
        $playStatus.text('Start loading');
    }

    function loadedmetadataHandle(event) {
        var $duration = $('.duration');
        $duration.text(normalizeTime(event.target.duration));
        $duration = null;
        // load the start time of video
        var startTime = +localStorage.getItem('videoStartTime');
        startTime && (video.currentTime = startTime);
    }
    // enable control operations
    function canPlayHandle(event) {
        var target = event.target;
        if (target.canPlayType('video/mp4')) {
            if (firstLoad-- > 0) {
                $playStatus.text('Can play');
                // bound event handler
                $play.on('click', playHandle);
                $soundIcon.on('click', muteHandle);
                $full.on('click', fullHandle);
                // enable the customized draggable element
                $.temp.drag.enable();
            }
        }
    }
    // video buffer update
    function progressHandle(event) {
        var target = event.target,
            pgrsBarWidth = $progressBar.get(0).clientWidth,
            factor = pgrsBarWidth / target.duration,
            curTime = target.currentTime,
            buffered = target.buffered,
            len = buffered.length,
            i = 0,
            cacheLeft, cacheWidth;
        if (!len) return;
        do {
            if (curTime >= buffered.start(i) && curTime <= buffered.end(i)) {
                cacheLeft = buffered.start(i) * factor;
                cacheWidth = (buffered.end(i) - buffered.start(i)) * factor;
                $cache.css({ left: cacheLeft + 'px' });
                $cache.css({ width: cacheWidth + 'px' });
                break;
            }
        } while (++i < len);
    }
    // playing update
    function timeupdateHandle(event) {
        var target = event.target,
            curTime = target.currentTime,
            pgrsBarWidth = $progressBar.get(0).clientWidth,
            pgrsWidth = curTime * pgrsBarWidth / target.duration;
        $progress.css({ width: pgrsWidth + 'px' });
        $curTime.text(normalizeTime(curTime));
    }

    function seekingHandle(event) {
        $playStatus.text('Loading');
    }

    function playingHandle(event) {
        $playStatus.text('Playing');
    }
    // change the sound icon when volume ajusted
    function volumechangeHandle(event) {
        var target = event.target,
            volume = target.volume;
        if (target.muted) {
            $soundCtrl.removeClass('lowvoice');
            $soundCtrl.removeClass('loudvoice');
            $soundCtrl.addClass('muted');
        } else {
            if (volume > .5) {
                $soundCtrl.removeClass('lowvoice');
                $soundCtrl.removeClass('muted');
                $soundCtrl.addClass('loudvoice');
            } else if (volume > 0) {
                $soundCtrl.removeClass('loudvoice');
                $soundCtrl.removeClass('muted');
                $soundCtrl.addClass('lowvoice');
            } else {
                $soundCtrl.removeClass('lowvoice');
                $soundCtrl.removeClass('loudvoice');
                $soundCtrl.addClass('muted');
            }
        }
    }

    function endedHandle(event) {
        $playStatus.text('Play ended');
    }

    function errorHandle(event) {
        var target = event.target,
            errCode = target.error.code;
        switch (errCode) {
        case 1:
            $playStatus.text('Play aborted');
            break;
        case 2:
            $playStatus.text('Ah, bad network');
            break;
        case 3:
            $playStatus.text('Failed to decode');
            break;
        case 4:
            $playStatus.text('Video source unsupported');
            break;
        default:
            $playStatus.text('Something wrong');
            break;
        }
    }

    // close the vide window
    function close() {
        $videoModule.css({ display: 'none' });
        $win.off('mousemove', moveShowHandle);
        clearTimeout(hide.intvId);

        video.muted = true;
        video.removeAttribute('src');
        video.removeAttribute('preload');
        // to avoid IE 8 block the I/O for not support video
        try {
            playHandle();
        } catch (e) {
            console.log(e);
        }
        // store the played time
        localStorage.setItem('videoStartTime', video.currentTime);

        $progress.css({ width: 0 });
        $cache.css({ width: 0 });
        $('.volume').css({ height: 0, top: 100 })
            .get(0).querySelector('.pointer').style.top = '0';

        $play.off('click', playHandle);
        $soundIcon.off('click', muteHandle);
        $full.off('click', fullHandle);
        $.temp.drag.disable();

        $video.off('loadstart', loadStartHandle);
        $video.off('loadedmetadata', loadedmetadataHandle);
        $video.off('canplay', canPlayHandle);
        $video.off('progress', progressHandle);
        $video.off('timeupdate', timeupdateHandle);
        $video.off('seeking', seekingHandle);
        $video.off('playing', playingHandle);
        $video.off('volumechange', volumechangeHandle);
        $video.off('ended', endedHandle);
        $video.off('error', errorHandle);

        $close.off('click', close);

        $videoModule = $video = $close = $controlBar =
            $progressBar = $cache = $progress = $win =
            $play = $full = $curTime = $playStatus =
            $soundCtrl = $soundIcon = video = null;

        $.carousel.resume();
        $.temp.roll.resume();
    }

    $.temp.play = function () {
        playHandle();
    }

    $.temp.openVideo = function () {
        $videoModule = $('.js-video');
        $videoModule.css({ display: 'block' });

        $.carousel.pause();
        $.temp.roll.pause();

        $video = $('.video--primary');
        $close = $('.video--close');
        $controlBar = $('.video--controls');
        $progressBar = $('.progress-bar');
        $cache = $('.progress-bar .cache');
        $progress = $('.progress-bar .progress');
        $win = $('.video--window');
        $play = $('.video .play');
        $full = $('.video .fullscreen');
        $curTime = $('.video .current');
        $playStatus = $('.video .play-status');
        $soundCtrl = $('.sound-control');
        $soundIcon = $('.sound-icon');
        video = $video.get(0);

        // load
        video.src = 'http://mov.bn.netease.com/open-movie/nos/mp4/2014/12/30/SADQ86F5S_shd.mp4';
        // video.load();
        video.preload = 'metadata';
        // video.start = +localStorage.getItem('videoStartTime');

        firstLoad = 1;

        $video.on('loadstart', loadStartHandle);
        $video.on('loadedmetadata', loadedmetadataHandle);
        $video.on('canplay', canPlayHandle);
        $video.on('progress', progressHandle);
        $video.on('timeupdate', timeupdateHandle);
        $video.on('seeking', seekingHandle);
        $video.on('playing', playingHandle);
        $video.on('volumechange', volumechangeHandle);
        $video.on('ended', endedHandle);
        $video.on('error', errorHandle);

        $close.on('click', close);

        // show when move, hide when static
        $win.on('mousemove', moveShowHandle);
    };
}(uTools);

! function ($) {
    var caro = $.carousel('.carousel', 5000, 500, 10);
    caro.enable();

    $('.js-video--open').on('click', function () {
        $.temp.openVideo();
    });
}(uTools);
