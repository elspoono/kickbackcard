/*
 Name:    Highcharts
 Version: 1.1.3 (2010-02-03)
 Author:  Vevstein Web
 Support: www.highcharts.com/support
 License: www.highcharts.com/license
*/
 (function() {
    function Kb(a) {
        return a && a.constructor == Array
    }
    function hb(a, b, c) {
        var d,
        e = "",
        f = c ? "print": "",
        h = function(g) {
            return W("style", {
                type: "text/css",
                media: g ? "print": ""
            },
            null, la.getElementsByTagName("HEAD")[0])
        };
        zb || (zb = h());
        for (d in b) e += kb(d) + ":" + b[d] + ";";
        if (ya) {
            b = la.styleSheets;
            c && h(true);
            for (c = b.length - 1; c >= 0 && b[c].media != f;) c--;
            f = b[c];
            f.addRule(a, e)
        } else zb.appendChild(la.createTextNode(a + " {" + e + "}\n"))
    }
    function K(a, b) {
        a || (a = {});
        for (var c in b) a[c] = b[c];
        return a
    }
    function Zb(a) {
        return Ja = R(Ja,
        a)
    }
    function Wa(a, b) {
        var c = function() {};
        c.prototype = new a;
        K(c.prototype, b);
        return c
    }
    function Ab(a) {
        for (var b = [], c = a.length - 1; c >= 0; c--) b.push(a[c]);
        return b
    }
    function Lb(a, b) {
        if (typeof a == "string") return a;
        else if (a.linearGradient) {
            var c = b.createLinearGradient.apply(b, a.linearGradient);
            s(a.stops,
            function(d) {
                c.addColorStop(d[0], d[1])
            });
            return c
        }
    }
    function W(a, b, c, d, e) {
        a = la.createElement(a);
        b && K(a, b);
        e && ua(a, {
            padding: 0,
            border: "none",
            margin: 0
        });
        c && ua(a, c);
        d && d.appendChild(a);
        return a
    }
    function ua(a, b) {
        if (ya) if (b.opacity !==
        ha) b.filter = "alpha(opacity=" + b.opacity * 100 + ")";
        K(a.style, b)
    }
    function $b(a, b, c, d) {
        a = a;
        var e = isNaN(b = va(b)) ? 2: b;
        b = c === ha ? ".": c;
        d = d === ha ? ",": d;
        c = a < 0 ? "-": "";
        var f = parseInt(a = va( + a || 0).toFixed(e)) + "",
        h = (h = f.length) > 3 ? h % 3: 0;
        return c + (h ? f.substr(0, h) + d: "") + f.substr(h).replace(/(\d{3})(?=\d)/g, "$1" + d) + (e ? b + va(a - f).toFixed(e).slice(2) : "")
    }
    function Mb(a, b, c) {
        function d(y) {
            return y.toString().replace(/^([0-9])$/, "0$1")
        }
        b = new Date(b * za);
        var e = b.getUTCHours(),
        f = b.getUTCDay(),
        h = b.getUTCDate(),
        g = b.getUTCMonth(),
        i = b.getUTCFullYear(),
        k = Ja.lang,
        r = k.weekdays;
        k = k.months;
        b = {
            a: r[f].substr(0, 3),
            A: r[f],
            d: d(h),
            e: h,
            b: k[g].substr(0, 3),
            B: k[g],
            m: d(g + 1),
            y: i.toString().substr(2, 2),
            Y: i,
            H: d(e),
            I: d(e % 12 || 12),
            l: e % 12 || 12,
            M: d(b.getUTCMinutes()),
            p: e < 12 ? "AM": "PM",
            P: e < 12 ? "am": "pm",
            S: d(b.getUTCSeconds())
        };
        for (var l in b) a = a.replace("%" + l, b[l]);
        return c ? a.substr(0, 1).toUpperCase() + a.substr(1) : a
    }
    function Nb(a) {
        for (var b = {
            x: a.offsetLeft,
            y: a.offsetTop
        }; a.offsetParent;) {
            a = a.offsetParent;
            b.x += a.offsetLeft;
            b.y += a.offsetTop;
            if (a != la.body &&
            a != la.documentElement) {
                b.x -= a.scrollLeft;
                b.y -= a.scrollTop
            }
        }
        return b
    }
    function ac(a) {
        function b() {
            var p = {
                line: Ca,
                spline: Ob,
                area: bc,
                areaspline: cc,
                column: Bb,
                bar: dc,
                pie: ec,
                scatter: fc
            },
            j,
            v;
            s(a.series,
            function(M) {
                j = p[M.type || n.defaultSeriesType];
                v = new j;
                v.init(w, M);
                if (v.inverted) Qa = true;
                Xa.push(v)
            })
        }
        function c() {
            var p = a.xAxis || {},
            j = a.yAxis || {};
            Kb(p) || (p = [p]);
            s(p,
            function(v, M) {
                v.index = M;
                v.isX = true
            });
            Kb(j) || (j = [j]);
            s(j,
            function(v, M) {
                v.index = M
            });
            Ka = p.concat(j);
            Ka = Ra(Ka,
            function(v) {
                return new i(w, v)
            });
            s(Ka,
            function(v) {
                v.adjustTickAmount()
            })
        }
        function d() {
            var p = true;
            for (var j in w.resources) w.resources[j] || (p = false);
            p && h()
        }
        function e(p) {
            w.toolbar.add("zoom", "Reset zoom", "Reset zoom level 1:1",
            function() {
                Fa(w, "selection", {
                    resetSelection: true
                },
                e);
                w.toolbar.remove("zoom")
            });
            db = null;
            if (p.resetSelection) s(Ka,
            function(j) {
                j.reset()
            });
            else {
                w.tracker.zoomX && s(p.xAxis,
                function(j) {
                    j.axis.setExtremes(j.min, j.max)
                });
                w.tracker.zoomY && s(p.yAxis,
                function(j) {
                    j.axis.setExtremes(j.min, j.max)
                })
            }
            s(Ka,
            function(j) {
                j.adjustTickAmount()
            });
            ib.hide();
            s(w.series,
            function(j) {
                s(j.areas,
                function(v) {
                    v.parentNode && v.parentNode.removeChild(v)
                });
                j.translate();
                j.createArea();
                j.clear();
                j.type == "spline" && j.getSplineData()
            });
            lb && s(Ka,
            function(j) {
                j.render()
            });
            s(Xa,
            function(j) {
                j.render()
            })
        }
        function f() {
            if (!w.titleLayer) {
                var p = new ka("title-layer", Y, null, {
                    zIndex: 5
                });
                a.title && W("h2", {
                    className: "highcharts-title",
                    innerHTML: a.title.text
                },
                a.title.style, p.div);
                a.subtitle && W("h3", {
                    className: "highcharts-subtitle",
                    innerHTML: a.subtitle.text
                },
                a.subtitle.style,
                p.div);
                w.titleLayer = p
            }
        }
        function h() {
            c();
            s(Xa,
            function(p) {
                p.translate();
                a.tooltip.enabled && p.options.enableMouseTracking !== false && p.createArea()
            });
            w.render = g;
            setTimeout(function() {
                g();
                Fa(w, "load")
            },
            0)
        }
        function g() {
            var p,
            j = a.labels,
            v = a.credits;
            p = 2 * (n.borderWidth || 0) + (n.shadow ? 8: 0);
            Pb.drawRect(p / 2, p / 2, L - p, ma - p, n.borderColor, n.borderWidth, n.borderRadius, n.backgroundColor, n.shadow);
            Pb.drawRect(T, G, pa, ia, n.plotBorderColor, n.plotBorderWidth, null, n.plotBackgroundColor, n.plotShadow, mb);
            ya && hb(".highcharts-image-map",
            {
                display: "none"
            },
            "print");
            lb && s(Ka,
            function(M) {
                M.render()
            });
            f();
            j.items && s(j.items,
            function() {
                var M = K({
                    className: "highcharts-label"
                },
                this.attributes);
                Cb.drawHtml(this.html, M, K(j.style, this.style))
            });
            for (p = 0; p < Xa.length; p++) Xa[p].render();
            w.legend = new y(w);
            if (!w.toolbar) w.toolbar = k(w);
            if (v.enabled && !w.credits) w.credits = W("a", {
                href: v.href,
                innerHTML: v.text
            },
            K(v.style, {
                zIndex: 8
            }), Y)
        }
        function i(p, j) {
            function v() {
                j = R(ja ? nb: Db, U ? sa ? gc: Qb: sa ? hc: ic, j)
            }
            function M() {
                var o = [],
                u;
                s(Xa,
                function(A) {
                    u = false;
                    s(["xAxis",
                    "yAxis"],
                    function(B) {
                        if ((B == "xAxis" && ja || B == "yAxis" && !ja) && (A.options[B] == j.index || A.options[B] === ha && j.index == 0)) {
                            A[B] = eb;
                            u = true
                        }
                    });
                    if (u) {
                        var x;
                        if (!ja) {
                            x = A.options.stacking;
                            ob = x == "percent";
                            if (x) {
                                var D = o[A.type] || [];
                                o[A.type] = D
                            }
                            if (ob) {
                                Ga = 0;
                                Ya = 99
                            }
                        }
                        if (A.isCartesian) {
                            lb = true;
                            s(A.data,
                            function(B, Z) {
                                if (Ga === ha) {
                                    Ga = Ya = B[pb];
                                    if (!ja && /(area|column|bar)/.test(A.type)) {
                                        Ga = 0;
                                        Rb = true
                                    }
                                }
                                if (ja) if (B.x > Ya) Ya = B.x;
                                else {
                                    if (B.x < Ga) Ga = B.x
                                } else {
                                    if (x) D[Z] = D[Z] ? D[Z] + B.y: B.y;
                                    Z = D ? D[Z] : B.y;
                                    if (!ob) if (Z > Ya) Ya = Z;
                                    else if (Z < Ga) Ga =
                                    Z;
                                    if (x) Sa[A.type][B.x] = {
                                        total: Z,
                                        cum: Z
                                    }
                                }
                            })
                        }
                    }
                })
            }
            function aa(o, u, A) {
                var x = 1,
                D = 0;
                if (A) {
                    x *= -1;
                    D = qb
                }
                if (fb) {
                    x *= -1;
                    D -= x * qb
                }
                if (u) return (o - 0) / Za + ba;
                return x * (o - ba) * Za + D
            }
            function C(o, u, A) {
                if (A) {
                    var x,
                    D,
                    B;
                    x = aa(o);
                    o = D = x + rb;
                    x = B = ma - x - rb;
                    if (U) {
                        x = G;
                        B = ma - wa
                    } else {
                        o = T;
                        D = L - qa
                    }
                    Sb.drawLine(o, x, D, B, u, A)
                }
            }
            function N(o, u, A) {
                o = Eb(o, ba);
                u = Math.min(u, ca);
                var x = (u - o) * Za;
                C(o + (u - o) / 2, A, x)
            }
            function O(o, u, A, x, D, B, Z) {
                var z,
                na,
                V,
                E = j.labels;
                if (u == "inside") D = -D;
                if (sa) D = -D;
                u = na = aa(o + $a) + rb;
                z = V = ma - aa(o + $a) - rb;
                if (U) {
                    z = ma - wa - (sa ? ia: 0) + Ta;
                    V = z + D
                } else {
                    u = T + (sa ? pa: 0) + Ta;
                    na = u - D
                }
                x && gb.drawLine(u, z, na, V, A, x);
                if (B && E.enabled) if ((o = sb.call({
                    index: Z,
                    isFirst: o == ea[0],
                    isLast: o == ea[ea.length - 1],
                    value: xa && xa[o] ? xa[o] : o
                })) || o === 0) gb.addText(o, u + E.x - ($a && U ? $a * Za * (fb ? -1: 1) : 0), z + E.y - ($a && !U ? $a * Za * (fb ? 1: -1) : 0), E.style, E.rotation, E.align)
            }
            function P(o, u) {
                var A;
                jb = u ? 1: oa.pow(10, Da(oa.log(o) / oa.LN10));
                A = o / jb;
                u || (u = [1, 2, 2.5, 5, 10]);
                for (var x = 0; x < u.length; x++) {
                    o = u[x];
                    if (A <= (u[x] + (u[x + 1] || u[x])) / 2) break
                }
                o *= jb;
                return o
            }
            function I() {
                ea = [];
                for (var o = 1E3 / za, u =
                6E4 / za, A = 36E5 / za, x = 864E5 / za, D = 6048E5 / za, B = 2592E6 / za, Z = 31556952E3 / za, z = [["second", o, [1, 2, 5, 10, 15, 30]], ["minute", u, [1, 2, 5, 10, 15, 30]], ["hour", A, [1, 2, 3, 4, 6, 8, 12]], ["day", x, [1, 2]], ["week", D, [1, 2]], ["month", B, [1, 2, 3, 4, 6]], ["year", Z, null]], na = z[6], V = na[1], E = na[2], Ha = 0; Ha < z.length; Ha++) {
                    na = z[Ha];
                    V = na[1];
                    E = na[2];
                    if (z[Ha + 1]) {
                        var jc = (V * E[E.length - 1] + z[Ha + 1][1]) / 2;
                        if (ra <= jc) break
                    }
                }
                if (V == Z && ra < 5 * V) E = [1, 2, 5];
                z = P(ra / V, E);
                var ab;
                E = new Date(ba * za);
                E.setUTCMilliseconds(0);
                if (V >= o) E.setUTCSeconds(V >= u ? 0: z * Da(E.getUTCSeconds() /
                z));
                if (V >= u) E.setUTCMinutes(V >= A ? 0: z * Da(E.getUTCMinutes() / z));
                if (V >= A) E.setUTCHours(V >= x ? 0: z * Da(E.getUTCHours() / z));
                if (V >= x) E.setUTCDate(V >= B ? 1: z * Da(E.getUTCDate() / z));
                if (V >= B) {
                    E.setUTCMonth(V >= Z ? 0: z * Da(E.getUTCMonth() / z));
                    ab = E.getUTCFullYear()
                }
                if (V >= Z) {
                    ab -= ab % z;
                    E.setUTCFullYear(ab)
                }
                V == D && E.setUTCDate(E.getUTCDate() - E.getUTCDay() + j.startOfWeek);
                Ha = 1;
                o = E.getTime() / za;
                ab = E.getUTCFullYear();
                u = E.getUTCMonth();
                for (ba = o; o < ca && Ha < 100;) {
                    ea.push(o);
                    if (V == Z) o = Date.UTC(ab + Ha * z, 0) / za;
                    else if (V == B) o = Date.UTC(ab,
                    u + Ha * z) / za;
                    else o += V * z;
                    Ha++
                }
                ca = o;
                j.labels.formatter || (sb = function() {
                    return Mb(j.dateTimeLabelFormats[na[0]], this.value, 1)
                })
            }
            function q() {
                ea = [];
                ba = Da(ba / ra) * ra;
                ca = oa.ceil(ca / ra) * ra;
                for (var o = (jb < 1 ? 1 / jb: 1) * 10, u = ba; u <= ca; u += ra) ea.push(J(u * o) / o);
                if (xa) {
                    ba -= 0.5;
                    ca += 0.5
                }
                sb || (sb = function() {
                    return this.value
                })
            }
            function H() {
                if (!bb && !xa) {
                    var o = ea.length,
                    u = db[pb];
                    if (o < u) {
                        for (; ea.length < u;) ea.push(ea[ea.length - 1] + ra);
                        Za *= (o - 1) / (u - 1)
                    }
                }
            }
            function m() {
                var o,
                u = j.min === null,
                A = j.max === null;
                if (ba === null) ba = u ? Ga: j.min;
                if (ca === null) ca = A ? Ya: j.max;
                if (!xa && !ob) {
                    o = ca - ba || 1;
                    if (u && Tb && (Ga < 0 || !Rb)) ba -= o * Tb;
                    if (A && Ub) ca += o * Ub
                }
                ra = xa || ba == ca ? 1: j.tickInterval == "auto" ? (ca - ba) * j.tickPixelInterval / qb: j.tickInterval;
                bb || (ra = P(ra));
                tb = j.minorTickInterval == "auto" && ra ? ra / 5: j.minorTickInterval;
                bb ? I() : q();
                Za = qb / (ca - ba || 1);
                db || (db = {
                    x: 0,
                    y: 0
                });
                if (!bb && ea.length > db[pb]) db[pb] = ea.length;
                if (!ja) for (var x in Sa) s(Sa[x],
                function(D, B) {
                    D = D.total;
                    Sa[x][B] = {
                        total: D,
                        cum: D
                    }
                })
            }
            function S(o, u) {
                var A;
                if (xa) {
                    if (o < 0) o = 0;
                    if (u > xa.length - 1) u = xa.length - 1
                }
                if (u -
                o > j.maxZoom) {
                    ba = o;
                    ca = u
                } else {
                    A = (j.maxZoom - u + o) / 2;
                    ba = o - A;
                    ca = u + A
                }
                m()
            }
            function fa() {
                ba = ca = ra = tb = ea = null;
                m()
            }
            function Aa() {
                var o = j.title,
                u = j.alternateGridColor,
                A = j.plotBands,
                x = j.plotLines,
                D = j.minorTickWidth,
                B = j.lineWidth,
                Z;
                gb.clear();
                Sb.clear();
                u && s(ea,
                function(z, na) {
                    if (na % 2 == 0 && z < ca) N(z, ea[na + 1] !== ha ? ea[na + 1] : ca, u)
                });
                A && s(A,
                function(z) {
                    N(z.from, z.to, z.color)
                });
                if (tb && !xa) for (A = ba; A <= ca; A += tb) {
                    C(A, j.minorGridLineColor, j.minorGridLineWidth);
                    D && O(A, j.minorTickPosition, j.minorTickColor, D, j.minorTickLength)
                }
                s(ea,
                function(z, na) {
                    Z = z + $a;
                    C(Z, j.gridLineColor, j.gridLineWidth);
                    O(z, j.tickPosition, j.tickColor, j.tickWidth, j.tickLength, !(z == ba && !j.showFirstLabel || z == ca && !j.showLastLabel), na)
                });
                x && s(x,
                function(z) {
                    C(z.value, z.color, z.width)
                });
                if (B) {
                    x = T + (sa ? pa: 0) + Ta;
                    D = ma - wa - (sa ? ia: 0) + Ta;
                    gb.drawLine(U ? T: x, U ? D: G, U ? L - qa: x, U ? D: ma - wa, j.lineColor, B)
                }
                if (o && o.enabled && o.text) {
                    B = U ? T: G;
                    x = U ? pa: ia;
                    B = {
                        low: B + (U ? 0: x),
                        middle: B + x / 2,
                        high: B + (U ? x: 0)
                    } [o.align];
                    x = (U ? G + ia: T) + (U ? 1: -1) * (sa ? -1: 1) * o.margin - (ya ? parseInt(o.style.fontSize || o.style.font.replace(/^[a-z ]+/,
                    "")) / 3: 0);
                    gb.addText(o.text, U ? B: x + (sa ? pa: 0) + Ta, U ? x - (sa ? ia: 0) + Ta: B, o.style, o.rotation || 0, {
                        low: "left",
                        middle: "center",
                        high: "right"
                    } [o.align])
                }
                gb.strokeText()
            }
            var ja = j.isX,
            sa = j.opposite,
            U = Qa ? !ja: ja,
            Sa = {
                bar: {},
                column: {},
                area: {},
                areaspline: {}
            };
            v();
            var eb = this,
            bb = j.type == "datetime",
            Ta = j.offset || 0,
            pb = ja ? "x": "y",
            qb = U ? pa: ia,
            Za,
            rb = U ? T: wa,
            gb = new ka("axis-layer", Y, null, {
                zIndex: 7
            }),
            Sb = new ka("grid-layer", Y, null, {
                zIndex: 1
            }),
            Ga,
            Ya,
            ca = null,
            ba = null,
            Tb = j.minPadding,
            Rb,
            ob,
            Ub = j.maxPadding,
            ra,
            tb,
            jb,
            ea,
            sb = j.labels.formatter,
            xa = j.categories || ja && p.columnCount,
            fb = j.reversed,
            $a = xa && j.tickmarkPlacement == "between" ? 0.5: 0;
            if (Qa && ja && fb === ha) fb = true;
            sa || (Ta *= -1);
            if (U) Ta *= -1;
            K(eb, {
                addPlotLine: C,
                adjustTickAmount: H,
                categories: xa,
                isXAxis: ja,
                render: Aa,
                translate: aa,
                setExtremes: S,
                reset: fa,
                reversed: fb,
                stacks: Sa
            });
            M();
            m()
        }
        function k() {
            function p(aa, C, N, O) {
                if (!M[aa]) {
                    C = W(La, {
                        innerHTML: C,
                        title: N,
                        onclick: O
                    },
                    K(a.toolbar.itemStyle, {
                        zIndex: 1003
                    }), v.div);
                    M[aa] = C
                }
            }
            function j(aa) {
                M[aa].parentNode.removeChild(M[aa]);
                M[aa] = null
            }
            var v,
            M = {};
            v = new ka("toolbar",
            Y, null, {
                zIndex: 1004,
                width: "auto",
                height: "auto"
            });
            return {
                add: p,
                remove: j
            }
        }
        function r(p, j) {
            function v(m) {
                m = m || Ma.event;
                if (!m.target) m.target = m.srcElement;
                if (!m.pageX) m.pageX = m.clientX + (la.documentElement.scrollLeft || la.body.scrollLeft);
                if (!m.pageY) m.pageY = m.clientY + (la.documentElement.scrollTop || la.body.scrollTop);
                return m
            }
            function M() {
                Ea.onmousemove = function(m) {
                    m = v(m);
                    m.returnValue = false;
                    if (ub) {
                        if (q) {
                            var S = m.pageX - O - Na.x - T;
                            ua(I, {
                                width: va(S) + F,
                                left: (S > 0 ? O: O + S) + F
                            })
                        }
                        if (H) {
                            m = m.pageY - P - Na.y - G;
                            ua(I, {
                                height: va(m) +
                                F,
                                top: (m > 0 ? P: P + m) + F
                            })
                        }
                    } else aa(m);
                    return false
                };
                Ea.onmousedown = function(m) {
                    m = v(m);
                    if (lb && (q || H)) {
                        m.preventDefault && m.preventDefault();
                        ub = true;
                        O = m.pageX - Na.x - T;
                        P = m.pageY - Na.y - G;
                        I || (I = W(La, null, {
                            position: ta,
                            border: "none",
                            background: "#4572A7",
                            opacity: 0.25,
                            width: q ? 0: pa + F,
                            height: H ? 0: ia + F
                        }));
                        Cb.div.appendChild(I)
                    }
                };
                Ea.onmouseup = function() {
                    var m;
                    if (I) {
                        var S = {
                            xAxis: [],
                            yAxis: []
                        },
                        fa = I.offsetLeft,
                        Aa = I.offsetTop,
                        ja = I.offsetWidth,
                        sa = I.offsetHeight;
                        ub = false;
                        if (ja > 10 && sa > 10) {
                            s(Ka,
                            function(U) {
                                var Sa = U.translate,
                                eb = U.isXAxis,
                                bb = Qa ? !eb: eb;
                                S[eb ? "xAxis": "yAxis"].push({
                                    axis: U,
                                    min: Sa(bb ? fa: ia - Aa - sa, true),
                                    max: Sa(bb ? fa + ja: ia - Aa, true)
                                })
                            });
                            Fa(p, "selection", S, e);
                            m = true
                        }
                        I.parentNode.removeChild(I);
                        I = null
                    }
                };
                Ea.onmouseout = function(m) {
                    m = m || Ma.event;
                    if ((m = m.relatedTarget || m.toElement) && m != Ba && m.tagName != "AREA") {
                        ib.hide();
                        if (p.hoverSeries) {
                            p.hoverSeries.setState();
                            N = p.hoverSeries = null
                        }
                    }
                };
                Ea.onclick = function(m) {
                    m = v(m);
                    m.cancelBubble = true;
                    if (N && m.target.tagName == "AREA") {
                        var S = N.plotX,
                        fa = N.plotY;
                        K(N, {
                            pageX: Na.x + T + (Qa ? pa - fa:
                            S),
                            pageY: Na.y + G + (Qa ? ia - S: fa)
                        });
                        Fa(p.hoverSeries, "click", K(m, {
                            point: N
                        }));
                        N.firePointEvent("click", m)
                    }
                }
            }
            function aa(m) {
                var S = p.hoverPoint,
                fa = p.hoverSeries;
                if (fa) {
                    S || (S = fa.tooltipPoints[Qa ? m.pageY - Na.y - G: m.pageX - Na.x - T]);
                    if (S != N) {
                        N && N.firePointEvent("mouseOut");
                        S.firePointEvent("mouseOver");
                        ib.refresh(S, fa);
                        N = S
                    }
                }
            }
            function C() {
                var m = "highchartsMap" + kc++;
                p.imagemap = Ea = W("map", {
                    name: m,
                    id: m,
                    className: "highcharts-image-map"
                },
                null, Y);
                Ba = W("img", {
                    useMap: "#" + m
                },
                {
                    width: pa + F,
                    height: ia + F,
                    left: T + F,
                    top: G + F,
                    opacity: 0,
                    border: "none",
                    position: ta,
                    clip: "rect(1px," + pa + "px," + ia + "px,1px)",
                    zIndex: 9
                },
                Ea);
                if (!ya) Ba.src = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="
            }
            if (j.enabled) {
                var N,
                O,
                P,
                I,
                q = /x/.test(p.options.chart.zoomType),
                H = /y/.test(p.options.chart.zoomType);
                C();
                p.tooltip = ib = l(j);
                this.zoomX = q;
                this.zoomY = H;
                M();
                setInterval(function() {
                    Fb && Fb()
                },
                32)
            }
        }
        function l(p) {
            function j(P, I) {
                var q = P.tooltipPos,
                H = p.borderColor || P.color || I.color || "#606060",
                m = w.inverted,
                S,
                fa,
                Aa,
                ja = C.offsetHeight;
                Aa = P.tooltipText;
                aa = I;
                S = q ? q[0] : m ? pa - P.plotY: P.plotX;
                q = q ? q[1] : m ? ia - P.plotX: P.plotY;
                if (S >= 0 && S <= pa && q >= 0 && q <= ia) fa = true;
                if (Aa === false || !fa) M();
                else {
                    C.innerHTML = Aa;
                    fa = C.offsetWidth - N;
                    Aa = C.offsetHeight - N;
                    if (fa > (O.w || 0) + 20 || fa < (O.w || 0) - 20 || Aa > O.h || O.c != H || ja != C.offsetHeight) {
                        O.clear();
                        O.drawRect(N / 2, N / 2, fa + 20, Aa, H, N, p.borderRadius, p.backgroundColor, p.shadow);
                        K(O, {
                            w: fa,
                            h: Aa,
                            c: H
                        })
                    }
                    H = S - O.w + T - 35;
                    q = q - O.h + 10 + G;
                    if ((m || H < 5) && S + T + O.w < L - 100) H = S + T + 15;
                    if (H < 5) {
                        H = 5;
                        q -= 20
                    }
                    if (q < 5) q = 5;
                    else if (q + O.h > ma) q = ma - O.h - 5;
                    v(J(H),
                    J(q));
                    I.drawPointState(P, "hover");
                    Ia.style.visibility = Gb
                }
            }
            function v(P, I) {
                var q = Ia.style.visibility == Oa,
                H = q ? P: (Ia.offsetLeft + P) / 2;
                q = q ? I: (Ia.offsetTop + I) / 2;
                ua(Ia, {
                    left: H + F,
                    top: q + F
                });
                Fb = va(P - H) > 1 || va(I - q) > 1 ?
                function() {
                    v(P, I)
                }: null
            }
            function M() {
                if (Ia) Ia.style.visibility = Oa;
                aa && aa.drawPointState()
            }
            var aa,
            C,
            N = p.borderWidth,
            O;
            Ia = W(La, null, {
                position: ta,
                visibility: Oa,
                overflow: Oa,
                padding: "0 50px 5px 0",
                zIndex: 8
            },
            Y);
            O = new ka("tooltip-box", Ia, null, {
                width: pa + F,
                height: ia + F
            });
            C = W(La, {
                className: "highcharts-tooltip"
            },
            K(p.style, {
                position: Vb,
                zIndex: 2
            }), Ia);
            return {
                refresh: j,
                hide: M
            }
        }
        var y = function(p) {
            if (!p.legend) {
                var j,
                v = p.options.legend,
                M = v.layout,
                aa = v.symbolWidth,
                C,
                N = "#" + Y.id + " .highcharts-legend li",
                O = [],
                P = new ka("legend", Y, null, {
                    zIndex: 7
                });
                if (v.enabled) {
                    this.dom = C = W(La, {
                        className: "highcharts-legend highcharts-legend-" + M,
                        innerHTML: '<ul style="margin:0;padding:0"></ul>'
                    },
                    K({
                        position: ta,
                        zIndex: 7
                    },
                    v.style), Y);
                    hb(N, K(v.itemStyle, {
                        paddingLeft: aa + v.symbolPadding + F,
                        cssFloat: M == "horizontal" ? "left": "none"
                    }));
                    hb(N + ":hover",
                    v.itemHoverStyle);
                    hb(N + ".highcharts-hidden", v.itemHiddenStyle);
                    hb(".highcharts-legend-horizontal li", {
                        "float": "left"
                    });
                    s(p.series,
                    function(q) {
                        if (q.options.showInLegend) {
                            var H = q.options.legendType == "point" ? q.data: [q];
                            s(H,
                            function(m) {
                                m.simpleSymbol = /(bar|pie|area|column)/.test(q.type);
                                m.legendItem = j = W("li", {
                                    innerHTML: v.labelFormatter.call(m),
                                    className: m.visible ? "": "highcharts-hidden"
                                },
                                null, C.firstChild);
                                Pa(j, "mouseover",
                                function() {
                                    m.setState("hover")
                                });
                                Pa(j, "mouseout",
                                function() {
                                    m.setState()
                                });
                                Pa(j,
                                "click",
                                function() {
                                    Fa(m, "legendItemClick", null,
                                    function() {
                                        m.setVisible()
                                    })
                                });
                                O.push(m)
                            })
                        }
                    });
                    if (v.borderWidth || v.backgroundColor) P.drawRect(C.offsetLeft, C.offsetTop, C.offsetWidth, C.offsetHeight, v.borderColor, v.borderWidth, v.borderRadius, v.backgroundColor, v.shadow);
                    s(O,
                    function(q) {
                        var H = q.legendItem,
                        m = C.offsetLeft + H.offsetLeft;
                        H = C.offsetTop + H.offsetTop + H.offsetHeight / 2; ! q.simpleSymbol && q.options && q.options.lineWidth && P.drawLine(m, H, m + aa, H, q.color, q.options.lineWidth);
                        if (q.simpleSymbol) P.drawRect(m,
                        H - 6, 16, 12, null, 0, 2, q.color);
                        else q.options && q.options.marker && q.options.marker.enabled && q.drawMarker(P, m + aa / 2, H, q.options.marker)
                    });
                    if (Ea) {
                        var I = W("area", {
                            shape: "rect",
                            coords: [C.offsetLeft - T, C.offsetTop - G, C.offsetLeft + C.offsetWidth - T, C.offsetTop + C.offsetHeight - G].join(",")
                        },
                        null, Ea);
                        Ea.insertBefore(I, Ea.childNodes[0]);
                        I.onmouseover = function(q) {
                            q = q || Ma.event;
                            q = q.relatedTarget || q.fromElement;
                            if (q != C && !ub) {
                                ib.hide();
                                ua(C, {
                                    zIndex: 10
                                })
                            }
                        };
                        C.onmouseout = I.onmouseout = function(q) {
                            q = q || Ma.event;
                            if ((q = q.relatedTarget ||
                            q.toElement) && (q == Ba || q.tagName == "AREA" && q != I)) ua(C, {
                                zIndex: 7
                            })
                        }
                    }
                }
            }
        };
        nb = R(nb, Ja.xAxis);
        Db = R(Db, Ja.yAxis);
        Ja.xAxis = Ja.yAxis = null;
        a = R(Ja, a);
        var n = a.chart,
        t = n.margin;
        if (typeof t == "number") t = [t, t, t, t];
        var Q = n.renderTo,
        da = "highcharts-" + Hb++;
        if (typeof Q == "string") Q = la.getElementById(Q);
        Q.innerHTML = "";
        var L = n.width || Q.offsetWidth || 400,
        ma = n.height || Q.offsetHeight || 300,
        Y = W(La, {
            className: "highcharts-container",
            id: da
        },
        K({
            position: Vb,
            overflow: Oa,
            width: L + F,
            height: ma + F,
            textAlign: "left"
        },
        n.style), Q);
        if (n.className) Y.className +=
        " " + n.className;
        var w = this,
        Ba;
        Q = n.events;
        var ga,
        G = t[0],
        qa = t[1],
        wa = t[2],
        T = t[3],
        Ea,
        ib,
        ub,
        Pb = new ka("chart-background", Y),
        Cb,
        ia,
        pa,
        Na = Nb(Y),
        lb,
        Ka = [],
        db,
        Xa = [],
        mb,
        Qa,
        Fb,
        Ia;
        vb = cb = 0;
        Pa(Ma, "resize",
        function() {
            var p = la.getElementById(da);
            if (p) Na = Nb(p)
        });
        if (Q) for (ga in Q) Pa(w, ga, Q[ga]);
        w.addLoading = function(p) {
            w.resources[p] = false
        };
        w.clearLoading = function(p) {
            w.resources[p] = true;
            d()
        };
        w.options = a;
        w.series = Xa;
        w.resources = {};
        w.inverted = Qa = a.chart.inverted;
        w.chartWidth = L;
        w.chartHeight = ma;
        w.plotWidth = pa = L - T - qa;
        w.plotHeight =
        ia = ma - G - wa;
        w.plotLeft = T;
        w.plotTop = G;
        w.plotLayer = Cb = new ka("plot", Y, null, {
            position: ta,
            width: pa + F,
            height: ia + F,
            left: T + F,
            top: G + F,
            overflow: Oa,
            zIndex: 6
        });
        this.tracker = new r(w, a.tooltip);
        if (n.plotBackgroundImage) {
            w.addLoading("plotBack");
            mb = W("img");
            mb.onload = function() {
                w.clearLoading("plotBack")
            };
            mb.src = n.plotBackgroundImage
        }
        b();
        d()
    }
    function Wb(a) {
        for (var b = [], c = [], d = 0; d < a.length; d++) {
            b[d] = a[d].plotX;
            c[d] = a[d].plotY
        }
        this.xdata = b;
        this.ydata = c;
        a = [];
        this.y2 = [];
        var e = c.length;
        this.n = e;
        this.y2[0] = 0;
        this.y2[e -
        1] = 0;
        a[0] = 0;
        for (d = 1; d < e - 1; d++) {
            var f = b[d + 1] - b[d - 1];
            f = (b[d] - b[d - 1]) / f;
            var h = f * this.y2[d - 1] + 2;
            this.y2[d] = (f - 1) / h;
            a[d] = (c[d + 1] - c[d]) / (b[d + 1] - b[d]) - (c[d] - c[d - 1]) / (b[d] - b[d - 1]);
            a[d] = (6 * a[d] / (b[d + 1] - b[d - 1]) - f * a[d - 1]) / h
        }
        for (b = e - 2; b >= 0; b--) this.y2[b] = this.y2[b] * this.y2[b + 1] + a[b]
    }
    var ha,
    la = document,
    Ma = window,
    oa = Math,
    J = oa.round,
    Da = oa.floor,
    Eb = oa.max,
    va = oa.abs,
    wb = oa.cos,
    xb = oa.sin,
    X = navigator.userAgent,
    ya = /msie/i.test(X) && !Ma.opera,
    lc = /AppleWebKit/.test(X),
    zb,
    kc = 0,
    cb,
    vb,
    Xb = {},
    Hb = 0,
    za = 1,
    La = "div",
    ta = "absolute",
    Vb = "relative",
    Oa = "hidden",
    Gb = "visible",
    F = "px",
    s,
    Ra,
    R,
    kb,
    Pa,
    Fa,
    yb,
    Ib;
    if (Ma.jQuery) {
        var Ua = jQuery;
        s = function(a, b) {
            for (var c = 0, d = a.length; c < d; c++) if (b.call(a[c], a[c], c, a) === false) return c
        };
        Ra = function(a, b) {
            for (var c = [], d = 0, e = a.length; d < e; d++) c[d] = b.call(a[d], a[d], d, a);
            return c
        };
        R = function() {
            var a = arguments;
            return Ua.extend(true, null, a[0], a[1], a[2], a[3])
        };
        kb = function(a) {
            return a.replace(/([A-Z])/g,
            function(b, c) {
                return "-" + c.toLowerCase()
            })
        };
        Pa = function(a, b, c) {
            Ua(a).bind(b, c)
        };
        Fa = function(a, b, c, d) {
            b = Ua.Event(b);
            K(b, c);
            Ua(a).trigger(b);
            d && !b.isDefaultPrevented() && d(b)
        };
        yb = function(a, b, c) {
            Ua(a).animate(b, c)
        };
        Ib = function(a, b) {
            Ua.get(a, null, b)
        };
        Ua.extend(Ua.easing, {
            easeOutQuad: function(a, b, c, d, e) {
                return - d * (b /= e) * (b - 2) + c
            }
        })
    } else if (Ma.MooTools) {
        s = $each;
        Ra = function(a, b) {
            return a.map(b)
        };
        R = $merge;
        kb = function(a) {
            return a.hyphenate()
        };
        Pa = function(a, b, c) {
            if (!a.addEvent) if (a.nodeName) a = $(a);
            else K(a, new Events);
            a.addEvent(b, c)
        };
        Fa = function(a, b, c, d) {
            b = new Event({
                type: b,
                target: a
            });
            b = K(b, c);
            b.preventDefault = function() {
                d =
                null
            };
            a.fireEvent && a.fireEvent(b.type, b);
            d && d(b)
        };
        yb = function(a, b, c) {
            a = new Fx.Morph($(a), K(c, {
                transition: Fx.Transitions.Quad.easeInOut
            }));
            a.start(b)
        };
        Ib = function(a, b) { (new Request({
                url: a,
                method: "get",
                onSuccess: b
            })).send()
        }
    }
    X = 'normal 12px "Lucida Grande", "Lucida Sans Unicode", Verdana, Arial, Helvetica, sans-serif';
    var Va = {
        enabled: true,
        align: "center",
        x: 0,
        y: 15,
        style: {
            color: "#666",
            font: X.replace("12px", "11px")
        }
    },
    Ja = {
        colors: ["#4572A7", "#AA4643", "#89A54E", "#80699B", "#3D96AE", "#DB843D", "#92A8CD", "#A47D7C",
        "#B5CA92"],
        symbols: ["circle", "diamond", "square", "triangle", "triangle-down"],
        lang: {
            months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            weekdays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        },
        chart: {
            margin: [50, 50, 60, 80],
            borderColor: "#4572A7",
            borderRadius: 5,
            defaultSeriesType: "line",
            plotBorderColor: "#C0C0C0"
        },
        title: {
            text: "Chart title",
            style: {
                textAlign: "center",
                color: "#3E576F",
                font: X.replace("12px", "16px"),
                margin: "10px 0 0 0"
            }
        },
        subtitle: {
            text: "",
            style: {
                textAlign: "center",
                color: "#6D869F",
                font: X,
                margin: 0
            }
        },
        plotOptions: {
            line: {
                animation: true,
                events: {},
                lineWidth: 2,
                shadow: true,
                marker: {
                    enabled: true,
                    symbol: "auto",
                    lineWidth: 0,
                    radius: 4,
                    lineColor: "#FFFFFF",
                    fillColor: "auto",
                    states: {
                        hover: {}
                    }
                },
                point: {
                    events: {}
                },
                dataLabels: R(Va, {
                    enabled: false,
                    y: -6,
                    formatter: function() {
                        return this.y
                    }
                }),
                showInLegend: true,
                states: {
                    hover: {
                        lineWidth: 3,
                        marker: {}
                    }
                }
            }
        },
        labels: {
            style: {
                position: ta,
                color: "#3E576F",
                font: X
            }
        },
        legend: {
            enabled: true,
            layout: "horizontal",
            labelFormatter: function() {
                return this.name
            },
            borderColor: "#909090",
            borderRadius: 5,
            shadow: true,
            style: {
                bottom: "10px",
                left: "80px",
                padding: "5px"
            },
            itemStyle: {
                listStyle: "none",
                margin: "0 1em 0 0",
                padding: 0,
                font: X,
                cursor: "pointer",
                color: "#3E576F"
            },
            itemHoverStyle: {
                color: "#000"
            },
            itemHiddenStyle: {
                color: "#CCC"
            },
            symbolWidth: 16,
            symbolPadding: 5
        },
        tooltip: {
            enabled: true,
            formatter: function() {
                return "<b>" + (this.point.name || this.series.name) + "</b><br/>X value: " + this.x + "<br/>Y value: " + this.y
            },
            backgroundColor: "rgba(255, 255, 255, .85)",
            borderWidth: 2,
            borderRadius: 5,
            shadow: true,
            style: {
                color: "#333333",
                font: X,
                fontSize: "9pt",
                padding: "5px",
                whiteSpace: "nowrap"
            }
        },
        toolbar: {
            itemStyle: {
                color: "#4572A7",
                cursor: "pointer",
                margin: "20px",
                font: X
            }
        },
        credits: {
            enabled: true,
            text: "Highcharts.com",
            href: "http://www.highcharts.com",
            style: {
                position: ta,
                right: "50px",
                bottom: "5px",
                color: "#999",
                textDecoration: "none",
                font: X.replace("12px", "10px")
            }
        }
    },
    nb = {
        dateTimeLabelFormats: {
            second: "%H:%M:%S",
            minute: "%H:%M",
            hour: "%H:%M",
            day: "%e. %b",
            week: "%e. %b",
            month: "%b '%y",
            year: "%Y"
        },
        gridLineColor: "#C0C0C0",
        labels: Va,
        lineColor: "#C0D0E0",
        lineWidth: 1,
        max: null,
        min: null,
        maxZoom: 1,
        minorGridLineColor: "#E0E0E0",
        minorGridLineWidth: 1,
        minorTickColor: "#A0A0A0",
        minorTickLength: 2,
        minorTickPosition: "outside",
        minorTickWidth: 1,
        showFirstLabel: true,
        showLastLabel: false,
        startOfWeek: 1,
        tickColor: "#C0D0E0",
        tickInterval: "auto",
        tickLength: 5,
        tickmarkPlacement: "between",
        tickPixelInterval: 100,
        tickPosition: "outside",
        tickWidth: 1,
        title: {
            enabled: false,
            text: "X-values",
            align: "middle",
            margin: 35,
            style: {
                color: "#6D869F",
                font: X.replace("normal", "bold")
            }
        },
        type: "linear"
    },
    Db = R(nb, {
        gridLineWidth: 1,
        tickPixelInterval: 72,
        showLastLabel: true,
        labels: {
            align: "right",
            x: -8,
            y: 3
        },
        lineWidth: 0,
        maxPadding: 0.05,
        minPadding: 0.05,
        tickWidth: 0,
        title: {
            enabled: true,
            margin: 40,
            rotation: 270,
            text: "Y-values"
        }
    }),
    ic = {
        labels: {
            align: "right",
            x: -8,
            y: 3
        },
        title: {
            rotation: 270
        }
    },
    hc = {
        labels: {
            align: "left",
            x: 8,
            y: 3
        },
        title: {
            rotation: 90
        }
    },
    Qb = {
        labels: {
            align: "center",
            x: 0,
            y: 14
        },
        title: {
            rotation: 0
        }
    },
    gc = R(Qb, {
        labels: {
            y: -5
        }
    });
    X = Ja.plotOptions;
    Va = X.line;
    X.spline = R(Va);
    X.scatter = R(Va, {
        lineWidth: 0,
        states: {
            hover: {
                lineWidth: 0
            }
        }
    });
    X.area = R(Va, {
        fillColor: "auto"
    });
    X.areaspline = R(X.area);
    X.column = R(Va, {
        borderColor: "#FFFFFF",
        borderWidth: 1,
        borderRadius: 0,
        groupPadding: 0.2,
        pointPadding: 0.1,
        states: {
            hover: {
                brightness: 0.1,
                shadow: false
            }
        }
    });
    X.bar = R(X.column, {
        dataLabels: {
            align: "left",
            x: 5,
            y: 0
        }
    });
    X.pie = R(Va, {
        center: ["50%", "50%"],
        legendType: "point",
        size: "90%",
        slicedOffset: 10,
        states: {
            hover: {
                brightness: 0.1,
                shadow: false
            }
        }
    });
    var Jb = function(a) {
        function b(g) {
            if (h = /rgba\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]+(?:\.[0-9]+)?)\s*\)/.exec(g)) f =
            [parseInt(h[1]), parseInt(h[2]), parseInt(h[3]), parseFloat(h[4])];
            else if (h = /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(g)) f = [parseInt(h[1], 16), parseInt(h[2], 16), parseInt(h[3], 16), 1]
        }
        function c() {
            return f ? "rgba(" + f.join(",") + ")": a
        }
        function d(g) {
            if (typeof g == "number" && g != 0) for (var i = 0; i < 3; i++) {
                f[i] += parseInt(g * 255);
                if (f[i] < 0) f[i] = 0;
                if (f[i] > 255) f[i] = 255
            }
            return this
        }
        function e(g) {
            f[3] = g;
            return this
        }
        var f = [],
        h;
        b(a);
        return {
            get: c,
            brighten: d,
            setOpacity: e
        }
    },
    ka = function(a, b, c, d) {
        var e = this,
        f = b.style;
        c = K({
            className: "highcharts-" + a
        },
        c);
        d = K({
            width: f.width,
            height: f.height,
            position: ta,
            top: 0,
            left: 0,
            margin: 0,
            padding: 0,
            border: "none"
        },
        d);
        a = W(La, c, d, b);
        K(e, {
            div: a,
            width: parseInt(d.width),
            height: parseInt(d.height)
        });
        e.svg = ya ? "": '<?xml version="1.0" encoding="utf-8"?><svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="' + e.width + 'px" height="' + e.height + '">';
        e.basicSvg = e.svg
    };
    ka.prototype = {
        getCtx: function() {
            if (!this.ctx) {
                var a = W("canvas", {
                    id: "highcharts-canvas-" +
                    Hb++,
                    width: this.width,
                    height: this.height
                },
                {
                    position: ta
                },
                this.div);
                if (ya) {
                    G_vmlCanvasManager.initElement(a);
                    a = la.getElementById(a.id)
                }
                this.ctx = a.getContext("2d")
            }
            return this.ctx
        },
        getSvg: function() {
            if (!this.svgObject) {
                var a = this,
                b = a.div,
                c = a.width;
                a = a.height;
                if (ya) {
                    if (!la.namespaces.g_vml_) {
                        la.namespaces.add("g_vml_", "urn:schemas-microsoft-com:vml");
                        la.createStyleSheet().cssText = "g_vml_\\:*{behavior:url(#default#VML)}"
                    }
                    this.svgObject = W(La, null, {
                        width: c + F,
                        height: a + F,
                        position: ta
                    },
                    b)
                } else this.svgObject =
                W("object", {
                    width: c,
                    height: a,
                    type: "image/svg+xml"
                },
                {
                    position: ta,
                    left: 0,
                    top: 0
                },
                b)
            }
            return this.svgObject
        },
        drawLine: function(a, b, c, d, e, f) {
            var h = this.getCtx();
            if (a == c) a = c = J(a) + f % 2 / 2;
            if (b == d) b = d = J(b) + f % 2 / 2;
            h.lineWidth = f;
            h.lineCap = "round";
            h.beginPath();
            h.moveTo(a, b);
            h.strokeStyle = e;
            h.lineTo(c, d);
            h.closePath();
            h.stroke()
        },
        drawPolyLine: function(a, b, c, d, e) {
            var f = this.getCtx(),
            h = [];
            if (d && c) {
                s(a,
                function(g) {
                    h.push(g === ha ? g: g + 1)
                });
                for (d = 1; d <= 3; d++) this.drawPolyLine(h, "rgba(0, 0, 0, " + 0.05 * d + ")", 6 - 2 * d)
            }
            f.beginPath();
            for (d = 0; d < a.length; d += 2) f[d == 0 ? "moveTo": "lineTo"](a[d], a[d + 1]);
            K(f, {
                lineWidth: c,
                lineJoin: "round"
            });
            if (b && c) {
                f.strokeStyle = b;
                f.stroke()
            }
            if (e) {
                f.fillStyle = Lb(e, f);
                f.fill()
            }
        },
        drawRect: function(a, b, c, d, e, f, h, g, i, k) {
            function r() {
                l.beginPath();
                if (h) {
                    l.moveTo(a, b + h);
                    l.lineTo(a, b + d - h);
                    l.quadraticCurveTo(a, b + d, a + h, b + d);
                    l.lineTo(a + c - h, b + d);
                    l.quadraticCurveTo(a + c, b + d, a + c, b + d - h);
                    l.lineTo(a + c, b + h);
                    l.quadraticCurveTo(a + c, b, a + c - h, b);
                    l.lineTo(a + h, b);
                    l.quadraticCurveTo(a, b, a, b + h)
                } else l.rect(a, b, c, d);
                l.closePath()
            }
            var l = this.getCtx(),
            y = (f || 0) % 2 / 2;
            a = J(a) + y;
            b = J(b) + y;
            c = J(c);
            d = J(d);
            if (i) for (i = 1; i <= 3; i++) this.drawRect(a + 1, b + 1, c, d, "rgba(0, 0, 0, " + 0.05 * i + ")", 6 - 2 * i, h);
            k && l.drawImage(k, a, b, c, d);
            r();
            if (g) {
                l.fillStyle = Lb(g, l);
                l.fill();
                Ma.G_vmlCanvasManager && r()
            }
            if (f) {
                l.strokeStyle = e;
                l.lineWidth = f;
                l.stroke()
            }
        },
        drawSymbol: function(a, b, c, d, e, f, h) {
            var g = this.getCtx(),
            i = /^url\((.*?)\)$/;
            g.beginPath();
            if (a == "square") {
                a = 0.707 * d;
                g.moveTo(b - a, c - a);
                g.lineTo(b + a, c - a);
                g.lineTo(b + a, c + a);
                g.lineTo(b - a, c + a);
                g.lineTo(b - a, c - a)
            } else if (a ==
            "triangle") {
                c++;
                g.moveTo(b, c - 1.33 * d);
                g.lineTo(b + d, c + 0.67 * d);
                g.lineTo(b - d, c + 0.67 * d);
                g.lineTo(b, c - 1.33 * d)
            } else if (a == "triangle-down") {
                c--;
                g.moveTo(b, c + 1.33 * d);
                g.lineTo(b - d, c - 0.67 * d);
                g.lineTo(b + d, c - 0.67 * d);
                g.lineTo(b, c + 1.33 * d)
            } else if (a == "diamond") {
                g.moveTo(b, c - d);
                g.lineTo(b + d, c);
                g.lineTo(b, c + d);
                g.lineTo(b - d, c);
                g.lineTo(b, c - d)
            } else i.test(a) ? W("img", {
                onload: function() {
                    var k = this,
                    r = Xb[k.src] || [k.width, k.height];
                    ua(k, {
                        left: J(b - r[0] / 2) + F,
                        top: J(c - r[1] / 2) + F,
                        visibility: Gb
                    });
                    Xb[k.src] = r
                },
                src: a.match(i)[1]
            },
            {
                position: ta,
                visibility: ya ? Gb: Oa
            },
            this.div) : g.arc(b, c, d, 0, 2 * oa.PI, true);
            if (h) {
                g.fillStyle = h;
                g.fill()
            }
            if (f && e) {
                g.strokeStyle = f || "rgb(100, 100, 255)";
                g.lineWidth = e || 2;
                g.stroke()
            }
        },
        drawHtml: function(a, b, c) {
            W(La, K(b, {
                innerHTML: a
            }), K(c, {
                position: ta
            }), this.div)
        },
        drawText: function() {
            this.addText.apply(this, arguments);
            this.strokeText()
        },
        addText: function(a, b, c, d, e, f) {
            if (a || a === 0) {
                var h = this,
                g,
                i = h.div,
                k,
                r = "";
                d = d || {};
                var l = d.color || "#000000";
                f = f || "left";
                var y = parseInt(d.fontSize || d.font.replace(/^[a-z ]+/, ""));
                for (var n in d) r += kb(n) + ":" + d[n] + ";";
                s(["MozTransform", "WebkitTransform", "transform"],
                function(L) {
                    if (L in i.style) k = L
                });
                if (!e || k) {
                    a = W("span", {
                        innerHTML: a
                    },
                    K(d, {
                        position: ta,
                        left: b + F,
                        whiteSpace: "nowrap",
                        bottom: J(h.height - c - y * 0.25) + F,
                        color: l
                    }), i);
                    r = a.offsetWidth;
                    if (f == "right") ua(a, {
                        left: b - r + F
                    });
                    else f == "center" && ua(a, {
                        left: J(b - r / 2) + F
                    });
                    if (e) {
                        f = {
                            left: 0,
                            center: 50,
                            right: 100
                        } [f];
                        a.style[k] = "rotate(" + e + "deg)";
                        a.style[k + "Origin"] = f + "% 100%"
                    }
                } else if (ya) {
                    g = true;
                    d = (e || 0) * oa.PI * 2 / 360;
                    e = wb(d);
                    d = xb(d);
                    n = h.width;
                    y = y / 3 || 3;
                    var t = f == "left",
                    Q = f == "right",
                    da = t ? b: b - n * e;
                    b = Q ? b: b + n * e;
                    t = t ? c: c - n * d;
                    c = Q ? c: c + n * d;
                    da += y * d;
                    b += y * d;
                    t -= y * e;
                    c -= y * e;
                    if (va(da - b) < 0.1) da += 0.1;
                    if (va(t - c) < 0.1) t += 0.1;
                    h.svg += '<g_vml_:line from="' + da + ", " + t + '" to="' + b + ", " + c + '" stroked="false"><g_vml_:fill on="true" color="' + l + '"/><g_vml_:path textpathok="true"/><g_vml_:textpath on="true" string="' + a + '" style="v-text-align:' + f + ";" + r + '"/></g_vml_:line>'
                } else {
                    g = true;
                    h.svg += '<g><text transform="translate(' + b + "," + c + ") rotate(" + (e || 0) + ')" style="fill:' + l + ";text-anchor:" +
                    {
                        left: "start",
                        center: "middle",
                        right: "end"
                    } [f] + ";" + r.replace(/"/g, "'") + '">' + a + "</text></g>"
                }
                h.hasObject = g
            }
        },
        strokeText: function() {
            if (this.hasObject) {
                var a = this.getSvg(),
                b = this.svg;
                if (ya) a.innerHTML = b;
                else {
                    a.data = "data:image/svg+xml," + b + "</svg>";
                    lc && this.div.appendChild(a)
                }
            }
        },
        clear: function() {
            var a = this,
            b = a.div,
            c = b.childNodes;
            a.ctx && a.ctx.clearRect(0, 0, a.width, a.height);
            if (a.svgObject) {
                b.removeChild(a.svgObject);
                a.svgObject = null;
                a.svg = a.basicSvg
            }
            for (var d = c.length - 1; d >= 0; d--) {
                a = c[d];
                a.tagName == "SPAN" &&
                b.removeChild(a)
            }
        },
        hide: function() {
            ua(this.div, {
                display: "none"
            })
        },
        show: function() {
            ua(this.div, {
                display: ""
            })
        }
    };
    var Yb = function(a, b, c) {
        this.series = a;
        var d;
        if (typeof b == "number" || b === null) {
            this.x = c;
            this.y = b
        } else if (typeof b == "object" && typeof b.length != "number") {
            for (d in b) this[d] = b[d];
            this.x = b.x === ha ? c: b.x;
            this.y = b.y;
            this.options = b
        } else if (typeof b[0] == "string") {
            this.name = b[0];
            this.x = c;
            this.y = b[1]
        } else if (typeof b[0] == "number") {
            this.x = b[0];
            this.y = b[1]
        }
        return this
    };
    Yb.prototype = {
        firePointEvent: function(a,
        b) {
            var c = this;
            if (c.series.options.point.events[a] || c.options && c.options.events && c.options.events[a]) this.importEvents();
            Fa(this, a, b)
        },
        importEvents: function() {
            if (!this.hasImportedEvents) {
                var a = this,
                b = R(a.series.options.point, a.options);
                b = b.events;
                var c;
                a.events = b;
                for (c in b) Pa(a, c, b[c]);
                this.hasImportedEvents = true
            }
        }
    };
    var Ca = function() {
        this.isCartesian = true;
        this.type = "line"
    };
    Ca.prototype = {
        init: function(a, b) {
            var c = this,
            d,
            e = a.series.length;
            c.chart = a;
            b = c.setOptions(b);
            K(c, {
                index: e,
                options: b,
                name: b.name ||
                "Series " + (e + 1),
                state: "",
                visible: b.visible !== false
            });
            a = b.events;
            for (d in a) Pa(c, d, a[d]);
            c.getColor();
            c.getSymbol();
            c.getData(b)
        },
        getData: function(a) {
            var b = this,
            c = b.chart,
            d = "series" + Hb++;
            if (!a.data && a.dataURL) {
                c.addLoading(d);
                Ib(a.dataURL,
                function(e) {
                    b.dataLoaded(e);
                    c.clearLoading(d)
                })
            } else b.dataLoaded(a.data)
        },
        dataLoaded: function(a) {
            var b = this,
            c = b.chart,
            d = b.options,
            e = d.dataParser,
            f = {},
            h,
            g;
            if (d.dataURL && !e) e = function(r) {
                return eval(r)
            };
            if (e) a = e.call(b, a);
            this.layerGroup = h = new ka("series-group", c.plotLayer.div,
            null, {
                zIndex: 2
            });
            s(["", "hover"],
            function(r) {
                f[r] = new ka("state-" + r, h.div)
            });
            this.stateLayers = f;
            g = d.pointStart || 0;
            a = Ra(a,
            function(r) {
                r = new Yb(b, r, g);
                g += d.pointInterval || 1;
                return r
            });
            b.data = a;
            var i = -1,
            k = [];
            s(a,
            function(r, l) {
                if (r.y === null) {
                    l > i + 1 && k.push(a.slice(i + 1, l));
                    i = l
                } else l == a.length - 1 && k.push(a.slice(i + 1, l + 1))
            });
            this.segments = k
        },
        setOptions: function(a) {
            return R(this.chart.options.plotOptions[this.type], a)
        },
        getColor: function() {
            var a = this.chart.options.colors;
            this.color = this.options.color || a[cb++] ||
            "#0000ff";
            if (cb >= a.length) cb = 0
        },
        getSymbol: function() {
            var a = this.chart.options.symbols,
            b = this.options.marker.symbol || "auto";
            if (b == "auto") b = a[vb++];
            this.symbol = b;
            if (vb >= a.length) vb = 0
        },
        translate: function() {
            var a = this.chart,
            b = this,
            c = b.options.stacking,
            d = b.xAxis.categories,
            e = b.yAxis,
            f = e.stacks[b.type];
            s(this.data,
            function(h) {
                var g = h.x,
                i = h.y,
                k;
                h.plotX = b.xAxis.translate(h.x);
                if (c) {
                    k = f[g];
                    g = k.total;
                    k.cum = k = k.cum - i;
                    i = k + i;
                    if (c == "percent") {
                        k = g ? k * 100 / g: 0;
                        i = g ? i * 100 / g: 0
                    }
                    h.percentage = g ? h.y * 100 / g: 0;
                    h.yBottom = e.translate(k,
                    0, 1)
                }
                if (i !== null) h.plotY = e.translate(i, 0, 1);
                h.clientX = a.inverted ? a.plotHeight - h.plotX + a.plotTop: h.plotX + a.plotLeft;
                h.category = d && d[h.x] !== ha ? d[h.x] : h.x
            });
            this.setTooltipPoints()
        },
        setTooltipPoints: function() {
            var a = this,
            b = a.chart,
            c = b.inverted,
            d = [],
            e = c ? b.plotHeight: b.plotWidth,
            f,
            h,
            g = [];
            s(a.segments,
            function(i) {
                d = d.concat(i)
            });
            if (a.xAxis.reversed) d = Ab(d);
            s(d,
            function(i, k) {
                if (!a.tooltipPoints) i.tooltipText = b.options.tooltip.formatter.call({
                    series: a,
                    point: i,
                    x: i.category,
                    y: i.y,
                    percentage: i.percentage
                });
                f = d[k - 1] ? d[k - 1].high + 1: 0;
                for (h = i.high = d[k + 1] ? Da((i.plotX + (d[k + 1] ? d[k + 1].plotX: e)) / 2) : e; f <= h;) g[c ? e - f++:f++] = i
            });
            a.tooltipPoints = g
        },
        drawLine: function(a) {
            var b = this,
            c = b.options,
            d = b.chart,
            e = c.animation && b.animate,
            f = b.stateLayers[a],
            h = c.lineColor || b.color,
            g = c.fillColor == "auto" ? Jb(b.color).setOpacity(c.fillOpacity || 0.75).get() : c.fillColor,
            i = d.inverted,
            k = (i ? 0: d.plotHeight) - b.yAxis.translate(0);
            if (a) c = R(c, c.states[a]);
            e && b.animate(true);
            s(b.segments,
            function(r) {
                var l = [],
                y = [];
                s(r,
                function(t) {
                    l.push(i ? d.plotWidth -
                    t.plotY: t.plotX, i ? d.plotHeight - t.plotX: t.plotY)
                });
                if (/area/.test(b.type)) {
                    for (var n = 0; n < l.length; n++) y.push(l[n]);
                    if (c.stacking && b.type != "areaspline") for (n = r.length - 1; n >= 0; n--) y.push(r[n].plotX, r[n].yBottom);
                    else y.push(i ? k: r[r.length - 1].plotX, i ? r[0].plotX: k, i ? k: r[0].plotX, i ? r[r.length - 1].plotX: k);
                    f.drawPolyLine(y, null, null, c.shadow, g)
                }
                c.lineWidth && f.drawPolyLine(l, h, c.lineWidth, c.shadow)
            });
            e && b.animate()
        },
        animate: function(a) {
            var b = this,
            c = b.chart,
            d = c.inverted,
            e = b.layerGroup.div;
            if (b.visible) if (a) ua(e,
            K({
                overflow: Oa
            },
            d ? {
                height: 0
            }: {
                width: 0
            }));
            else {
                yb(e, d ? {
                    height: c.plotHeight + F
                }: {
                    width: c.plotWidth + F
                },
                {
                    duration: 1E3
                });
                this.animate = null
            }
        },
        drawPoints: function(a) {
            var b = this,
            c = b.stateLayers[a],
            d = b.options,
            e = d.marker,
            f = b.data,
            h = b.chart,
            g = h.inverted;
            if (a) {
                a = d.states[a].marker;
                if (a.lineWidth === ha) a.lineWidth = e.lineWidth + 1;
                if (a.radius === ha) a.radius = e.radius + 1;
                e = R(e, a)
            }
            e.enabled && s(f,
            function(i) {
                if (i.plotY !== ha) b.drawMarker(c, g ? h.plotWidth - i.plotY: i.plotX, g ? h.plotHeight - i.plotX: i.plotY, R(e, i.marker))
            })
        },
        drawMarker: function(a,
        b, c, d) {
            if (d.lineColor == "auto") d.lineColor = this.color;
            if (d.fillColor == "auto") d.fillColor = this.color;
            if (d.symbol == "auto") d.symbol = this.symbol;
            a.drawSymbol(d.symbol, b, c, d.radius, d.lineWidth, d.lineColor, d.fillColor)
        },
        drawDataLabels: function() {
            if (this.options.dataLabels.enabled && !this.hasDrawnDataLabels) {
                var a = this,
                b,
                c,
                d = a.data,
                e = a.options.dataLabels,
                f,
                h,
                g = a.chart,
                i = g.inverted,
                k = a.type,
                r = k == "pie",
                l = e.x,
                y = e.y,
                n = e.align;
                a.dataLabelsLayer = h = new ka("data-labels", a.layerGroup.div, null, {
                    zIndex: 1
                });
                e.style.color =
                e.color == "auto" ? a.color: e.color;
                s(d,
                function(t) {
                    var Q = t.plotX,
                    da = t.plotY,
                    L = t.tooltipPos;
                    f = e.formatter.call({
                        x: t.x,
                        y: t.y,
                        series: a,
                        point: t
                    });
                    b = (i ? g.plotWidth - da: Q) + l;
                    c = (i ? g.plotHeight - Q: da) + y;
                    if (L) {
                        b = L[0] + l;
                        c = L[1] + y
                    }
                    if (r) h = new ka("data-labels", t.layer.div, null, {
                        zIndex: 3
                    });
                    if (k == "column") b += {
                        center: t.w / 2,
                        right: t.w
                    } [n] || 0;
                    if (f) h[r ? "drawText": "addText"](f, b, c, e.style, e.rotation, n)
                });
                r || h.strokeText();
                a.hasDrawnDataLabels = true
            }
        },
        drawPointState: function(a, b) {
            var c = this.chart,
            d = c.inverted,
            e = c.singlePointLayer,
            f = this.options;
            if (!e) e = c.singlePointLayer = new ka("single-point", c.plotLayer.div, null, {
                zIndex: 3
            });
            e.clear();
            if (b) {
                var h = f.states[b].marker;
                b = f.marker.states[b];
                if (b.radius === ha) b.radius = h.radius + 2;
                if ((f = R(f.marker, a.marker, h, b)) && f.enabled) this.drawMarker(e, d ? c.plotWidth - a.plotY: a.plotX, d ? c.plotHeight - a.plotX: a.plotY, f)
            }
        },
        render: function() {
            var a = this;
            a.drawDataLabels();
            for (var b in a.stateLayers) {
                a.drawLine(b);
                a.drawPoints(b);
                b && a.stateLayers[b].hide()
            }
            a.visible || a.setVisible(false)
        },
        clear: function() {
            var a =
            this.stateLayers;
            for (var b in a) {
                a[b].clear();
                a[b].cleared = true
            }
            if (this.dataLabelsLayer) {
                this.dataLabelsLayer.clear();
                this.hasDrawnDataLabels = false
            }
        },
        setState: function(a) {
            a = a || "";
            if (this.state != a) {
                var b = this,
                c = b.stateLayers,
                d = c[a];
                c = c[b.state];
                var e = b.singlePointLayer || b.chart.singlePointLayer;
                if (b.state = a) d.show();
                else {
                    c.hide();
                    e && e.clear()
                }
            }
        },
        setVisible: function(a) {
            var b = this,
            c = b.chart.imagemap,
            d = b.layerGroup,
            e = b.legendItem,
            f = b.areas; (b.visible = a = a === ha ? !b.visible: a) ? d.show() : d.hide();
            if (e) e.className =
            a ? "": "highcharts-hidden";
            f && s(f,
            function(h) {
                a ? c.insertBefore(h, c.childNodes[1]) : c.removeChild(h)
            })
        },
        getAreaCoords: function() {
            var a = this,
            b = this.chart,
            c = b.inverted,
            d = b.plotWidth,
            e = b.plotHeight,
            f = 10,
            h = [];
            s(a.splinedata || a.segments,
            function(g, i) {
                if (g.length > 1 && g[0].x > g[1].x) g = Ab(g);
                var k = [],
                r = [],
                l = [];
                s([r, l],
                function(y) {
                    for (var n = 0, t = 0, Q, da, L = [g[0]], ma = y == r ? 1: -1, Y, w, Ba, ga, G, qa, wa; g[t];) {
                        if (g[t].plotX > g[n].plotX + f || t == g.length - 1) {
                            Q = g[t];
                            da = g.slice(n, t - 1);
                            s(da,
                            function(T) {
                                if (ma * T.plotY < ma * Q.plotY) Q = T
                            });
                            if (J(g[n].plotX) < J(Q.plotX) || g[t].plotX > g[n].plotX + f) L.push(Q);
                            n = t
                        }
                        t++
                    }
                    L[L.length - 1] != g[g.length - 1] && L.push(g[g.length - 1]);
                    for (t = 0; t < L.length; t++) if (t > 0) {
                        w = L[t].plotX;
                        Y = L[t].plotY;
                        n = L[t - 1].plotX;
                        da = L[t - 1].plotY;
                        ga = w - L[t - 1].plotX;
                        qa = G = Y - L[t - 1].plotY;
                        Ba = -ga;
                        wa = oa.sqrt(oa.pow(qa, 2) + oa.pow(Ba, 2));
                        if (t == 1) {
                            n -= f / wa * ga;
                            da -= f / wa * G
                        } else if (t == L.length - 1) {
                            w += f / wa * ga;
                            Y += f / wa * G
                        }
                        ga = ma * f / wa;
                        n = J(n + ga * qa);
                        da = J(da + ga * Ba);
                        w = J(w + ga * qa);
                        Ba = J(Y + ga * Ba);
                        if (y[y.length - 1] && y[y.length - 1][0] > n) for (Y = false; ! Y;) {
                            G = y.pop();
                            qa =
                            y[y.length - 1];
                            if (!qa) break;
                            ga = (da - Ba) / (n - w);
                            G = (qa[1] - G[1]) / (qa[0] - G[0]);
                            G = ( - G * qa[0] + qa[1] + ga * n - da) / (ga - G);
                            ga = ga * (G - n) + da;
                            if (G > qa[0]) {
                                y.push([J(G), J(ga), 1]);
                                Y = true
                            }
                        } else isNaN(n) || y.push([n, da]);
                        y[y.length - 1] && y[y.length - 1][0] < w && y.push([w, Ba])
                    }
                });
                for (i = 0; i < r.length; i++) k.push(c ? d - r[i][1] : r[i][0], c ? e - r[i][0] : r[i][1]);
                for (i = l.length - 1; i >= 0; i--) k.push(c ? d - l[i][1] : l[i][0], c ? e - l[i][0] : l[i][1]); ! k.length && g[0] && k.push(J(g[0].plotX), J(g[0].plotY));
                h.push([k.join(",")])
            });
            return h
        },
        createArea: function() {
            var a,
            b = this,
            c = b.chart,
            d = b.getAreaCoords(),
            e = c.imagemap,
            f = e.firstChild,
            h = [],
            g;
            s(d,
            function(i) {
                g = /^[0-9]+,[0-9]+$/.test(i[0]);
                a = W("area", {
                    shape: g ? "circle": "poly",
                    chart: c,
                    coords: i[0] + (g ? ",10": ""),
                    onmouseover: function() {
                        if (b.visible) {
                            var k = c.hoverSeries;
                            c.hoverPoint = i[1];
                            b.options.events.mouseOver && Fa(b, "mouseOver", {
                                point: c.hoverPoint
                            });
                            k && k != b && k.setState(); ! /(column|bar|pie)/.test(b.type) && e.childNodes[1] && e.insertBefore(this, e.childNodes[1]);
                            b.setState("hover");
                            c.hoverSeries = b
                        }
                    },
                    onmouseout: function() {
                        var k =
                        c.hoverSeries;
                        k && k.options.events.mouseOut && Fa(k, "mouseOut")
                    }
                });
                if (b.options.cursor == "pointer") a.href = "javascript:;";
                f ? e.insertBefore(a, f) : e.appendChild(a);
                h.push(a)
            });
            b.areas = h
        }
    };
    var bc = Wa(Ca, {
        type: "area"
    }),
    Ob = Wa(Ca, {
        type: "spline",
        translate: function() {
            var a = this;
            Ca.prototype.translate.apply(a, arguments);
            a.splinedata = a.getSplineData()
        },
        drawLine: function() {
            var a = this,
            b = a.segments;
            a.segments = a.splinedata;
            Ca.prototype.drawLine.apply(a, arguments);
            a.segments = b
        },
        getSplineData: function() {
            var a = this,
            b = a.chart,
            c = [],
            d;
            s(a.segments,
            function(e) {
                if (a.xAxis.reversed) e = Ab(e);
                var f = [],
                h,
                g;
                s(e,
                function(i, k) {
                    h = e[k + 2] || e[k + 1] || i;
                    g = e[k - 2] || e[k - 1] || i;
                    h.plotX > 0 && g.plotY < b.plotWidth && f.push(i)
                });
                if (f.length > 1) d = J(Eb(b.plotWidth, f[f.length - 1].clientX - f[0].clientX) / 3);
                c.push(e.length > 1 ? d ? (new Wb(f)).get(d) : [] : e)
            });
            return a.splinedata = c
        }
    });
    Wb.prototype = {
        get: function(a) {
            a || (a = 50);
            var b = this.n;
            b = (this.xdata[b - 1] - this.xdata[0]) / (a - 1);
            var c = [],
            d = [];
            c[0] = this.xdata[0];
            d[0] = this.ydata[0];
            for (var e = [{
                plotX: c[0],
                plotY: d[0]
            }], f =
            1; f < a; f++) {
                c[f] = c[0] + f * b;
                d[f] = this.interpolate(c[f]);
                e[f] = {
                    plotX: c[f],
                    plotY: d[f]
                }
            }
            return e
        },
        interpolate: function(a) {
            for (var b = this.n - 1, c = 0; b - c > 1;) {
                var d = (b + c) / 2;
                if (this.xdata[Da(d)] > a) b = d;
                else c = d
            }
            b = Da(b);
            c = Da(c);
            d = this.xdata[b] - this.xdata[c];
            var e = (this.xdata[b] - a) / d;
            a = (a - this.xdata[c]) / d;
            return e * this.ydata[c] + a * this.ydata[b] + ((e * e * e - e) * this.y2[c] + (a * a * a - a) * this.y2[b]) * d * d / 6
        }
    };
    var cc = Wa(Ob, {
        type: "areaspline"
    }),
    Bb = Wa(Ca, {
        type: "column",
        init: function() {
            Ca.prototype.init.apply(this, arguments);
            var a =
            this.chart;
            if (a.columnCount && !this.options.stacking) a.columnCount++;
            else a.columnCount = 1;
            this.columnNumber = a.columnCount
        },
        translate: function() {
            Ca.prototype.translate.apply(this);
            var a = this,
            b = a.options,
            c = a.data,
            d = a.chart,
            e = d.inverted,
            f = d.plotWidth,
            h = d.plotHeight,
            g = va(c[1] ? c[1].plotX - c[0].plotX: e ? h: f),
            i = g * b.groupPadding,
            k = g - 2 * i;
            k = k / d.columnCount;
            b = k * b.pointPadding;
            var r = k - 2 * b;
            d = d.options.xAxis.reversed ? d.columnCount - a.columnNumber: a.columnNumber - 1;
            var l = -(g / 2) + i + d * k + b,
            y = a.yAxis.translate(0);
            s(c,
            function(n) {
                n.plotX +=
                l;
                n.w = r;
                n.y0 = (e ? f: h) - y;
                n.h = (n.yBottom || n.y0) - n.plotY
            })
        },
        drawLine: function() {},
        getSymbol: function() {},
        drawPoints: function(a) {
            var b = this,
            c = b.options,
            d = b.chart,
            e = c.animation && b.animate,
            f = d.inverted,
            h = b.data,
            g = b.stateLayers[a],
            i;
            e && this.animate(true);
            s(h,
            function(k) {
                i = k.h;
                if (k.plotY !== ha) g.drawRect(f ? d.plotWidth - k.plotY - k.h: k.plotX, f ? d.plotHeight - k.plotX - k.w: k.h >= 0 ? k.plotY: k.plotY + k.h, f ? k.h: k.w, f ? k.w: va(k.h), c.borderColor, c.borderWidth, c.borderRadius, k.color || b.color, c.shadow)
            });
            e && b.animate()
        },
        drawPointState: function(a,
        b) {
            var c = this,
            d = c.chart,
            e = c.options,
            f = a ? a.options: null,
            h = d.inverted,
            g = c.singlePointLayer;
            if (!g) g = c.singlePointLayer = new ka("single-point-layer", c.layerGroup.div);
            g.clear();
            if (b && e.states[b]) {
                b = R(e, e.states[b], f);
                g.drawRect(h ? d.plotWidth - a.plotY - a.h: a.plotX, h ? d.plotHeight - a.plotX - a.w: a.plotY, h ? a.h: a.w, h ? a.w: a.h, b.borderColor, b.borderWidth, b.borderRadius, Jb(b.color || this.color).brighten(b.brightness).get(), b.shadow)
            }
        },
        getAreaCoords: function() {
            var a = [],
            b = this.chart,
            c = b.inverted;
            s(this.data,
            function(d) {
                var e =
                Eb(va(d.h), 3) * d.h / va(d.h),
                f = c ? b.plotWidth - d.plotY - e: d.plotX,
                h = c ? b.plotHeight - d.plotX - d.w: d.plotY,
                g = h + (c ? d.w: e);
                e = f + (c ? e: d.w);
                a.push([Ra([f, g, f, h, e, h, e, g], J).join(","), d])
            });
            return a
        },
        animate: function(a) {
            var b = this,
            c = b.chart,
            d = c.inverted,
            e = b.layerGroup.div;
            if (a) e.style[d ? "left": "top"] = (d ? -c.plotWidth: c.plotHeight) + F;
            else {
                yb(e, c.inverted ? {
                    left: 0
                }: {
                    top: 0
                });
                b.animate = null
            }
        }
    }),
    dc = Wa(Bb, {
        type: "bar",
        init: function(a) {
            a.inverted = this.inverted = true;
            Bb.prototype.init.apply(this, arguments)
        }
    }),
    fc = Wa(Ca, {
        type: "scatter",
        getAreaCoords: function() {
            var a = this.data,
            b = [];
            s(a,
            function(c) {
                b.push([[J(c.plotX), J(c.plotY)].join(","), c])
            });
            return b
        }
    }),
    ec = Wa(Ca, {
        type: "pie",
        isCartesian: false,
        getColor: function() {},
        translate: function() {
            var a = 0,
            b = this,
            c = -0.25,
            d = b.options,
            e = d.slicedOffset,
            f = d.center,
            h = b.chart,
            g = b.data,
            i = 2 * oa.PI,
            k,
            r = h.options.colors;
            f.push(d.size);
            f = Ra(f,
            function(l, y) {
                return /%$/.test(l) ? h["plot" + (y ? "Height": "Width")] * parseInt(l) / 100: l
            });
            s(g,
            function(l) {
                a += l.y
            });
            s(g,
            function(l) {
                k = a ? l.y / a: 0;
                l.start = c * i;
                c += k;
                l.end = c *
                i;
                l.percentage = k * 100;
                l.center = [f[0], f[1]];
                l.size = f[2];
                var y = (l.end + l.start) / 2;
                l.centerSliced = Ra([wb(y) * e + f[0], xb(y) * e + f[1]], J);
                if (!l.color) l.color = r[cb++];
                if (cb >= r.length) cb = 0;
                if (l.visible === ha) l.visible = 1;
                if (!l.layer) l.layer = new ka("pie", b.layerGroup.div);
                l.setState = function(n) {
                    b.drawPointState(l, n)
                };
                l.setVisible = function(n) {
                    var t = (l.visible = n = n === ha ? !l.visible: n) ? "show": "hide",
                    Q = l.legendItem;
                    l.layer[t]();
                    if (Q) Q.className = n ? "": Oa
                }
            });
            this.setTooltipPoints()
        },
        render: function() {
            this.pointsDrawn || this.drawPoints();
            this.drawDataLabels()
        },
        drawPoints: function() {
            var a = this;
            s(this.data,
            function(b) {
                a.drawPoint(b, b.layer.getCtx(), b.color)
            });
            a.pointsDrawn = true
        },
        getSymbol: function() {},
        drawPointState: function(a, b) {
            var c = this,
            d = c.options,
            e;
            if (a) {
                e = a.stateLayer;
                if (!e) e = a.stateLayer = new ka("state-layer", a.layer.div);
                e.clear();
                if (b && c.options.states[b]) {
                    b = R(d, d.states[b]);
                    this.drawPoint(a, e.getCtx(), b.color || a.color, b.brightness)
                }
            }
            c.hoverPoint && c.hoverPoint.stateLayer.clear();
            c.hoverPoint = a
        },
        drawPoint: function(a, b, c, d) {
            var e =
            a.sliced ? a.centerSliced: a.center,
            f = e[0];
            e = e[1];
            var h = a.size,
            g = ya && a.percentage == 100 ? a.start: a.end;
            if (a.y > 0) {
                b.fillStyle = Jb(c).brighten(d).get(b);
                b.beginPath();
                b.moveTo(f, e);
                b.arc(f, e, h / 2, a.start, g, false);
                b.lineTo(f, e);
                b.closePath();
                b.fill()
            }
        },
        getAreaCoords: function() {
            var a = [];
            s(this.data,
            function(b) {
                for (var c = b.center[0], d = b.center[1], e = b.size / 2, f = b.start, h = b.end, g = [], i = f; i; i += 0.25) {
                    if (i >= h) i = h;
                    g = g.concat([c + wb(i) * e, d + xb(i) * e]);
                    if (i >= h) break
                }
                g = g.concat([c, d]);
                b.tooltipPos = [c + 2 * wb((f + h) / 2) * e / 3, d + 2 *
                xb((f + h) / 2) * e / 3];
                a.push([Ra(g, J).join(","), b])
            });
            return a
        }
    });
    Highcharts = {
        numberFormat: $b,
        dateFormat: Mb,
        setOptions: Zb,
        Chart: ac
    }
})();