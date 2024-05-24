"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var InsertOpsConverter_1 = require("./InsertOpsConverter");
var OpToHtmlConverter_1 = require("./OpToHtmlConverter");
var Grouper_1 = require("./grouper/Grouper");
var group_types_1 = require("./grouper/group-types");
var ListNester_1 = require("./grouper/ListNester");
var funcs_html_1 = require("./funcs-html");
var obj = __importStar(require("./helpers/object"));
var value_types_1 = require("./value-types");
var TableGrouper_1 = require("./grouper/TableGrouper");
var QuillDeltaToHtmlConverter_1 = require("./QuillDeltaToHtmlConverter");
var QuillDeltaToHtmlAsyncConverter = (function () {
    function QuillDeltaToHtmlAsyncConverter(deltaOps, options) {
        this.rawDeltaOps = [];
        this.callbacks = {};
        this.options = obj.assign({
            paragraphTag: 'p',
            encodeHtml: true,
            classPrefix: 'ql',
            inlineStyles: false,
            multiLineBlockquote: true,
            multiLineHeader: true,
            multiLineCodeblock: true,
            multiLineParagraph: true,
            multiLineCustomBlock: true,
            allowBackgroundClasses: false,
            linkTarget: '_blank',
        }, options, {
            orderedListTag: 'ol',
            bulletListTag: 'ul',
            listItemTag: 'li',
        });
        var inlineStyles;
        if (!this.options.inlineStyles) {
            inlineStyles = undefined;
        }
        else if (typeof this.options.inlineStyles === 'object') {
            inlineStyles = this.options.inlineStyles;
        }
        else {
            inlineStyles = {};
        }
        this.converterOptions = {
            encodeHtml: this.options.encodeHtml,
            classPrefix: this.options.classPrefix,
            inlineStyles: inlineStyles,
            listItemTag: this.options.listItemTag,
            paragraphTag: this.options.paragraphTag,
            linkRel: this.options.linkRel,
            linkTarget: this.options.linkTarget,
            allowBackgroundClasses: this.options.allowBackgroundClasses,
            customTag: this.options.customTag,
            customTagAttributes: this.options.customTagAttributes,
            customCssClasses: this.options.customCssClasses,
            customCssStyles: this.options.customCssStyles,
        };
        this.rawDeltaOps = deltaOps;
    }
    QuillDeltaToHtmlAsyncConverter.prototype._getListTag = function (op) {
        return op.isOrderedList()
            ? this.options.orderedListTag + ''
            : op.isBulletList()
                ? this.options.bulletListTag + ''
                : op.isCheckedList()
                    ? this.options.bulletListTag + ''
                    : op.isUncheckedList()
                        ? this.options.bulletListTag + ''
                        : '';
    };
    QuillDeltaToHtmlAsyncConverter.prototype.getGroupedOps = function () {
        var deltaOps = InsertOpsConverter_1.InsertOpsConverter.convert(this.rawDeltaOps, this.options);
        var pairedOps = Grouper_1.Grouper.pairOpsWithTheirBlock(deltaOps);
        var groupedSameStyleBlocks = Grouper_1.Grouper.groupConsecutiveSameStyleBlocks(pairedOps, {
            blockquotes: !!this.options.multiLineBlockquote,
            header: !!this.options.multiLineHeader,
            codeBlocks: !!this.options.multiLineCodeblock,
            customBlocks: !!this.options.multiLineCustomBlock,
        });
        var groupedOps = Grouper_1.Grouper.reduceConsecutiveSameStyleBlocksToOne(groupedSameStyleBlocks);
        var tableGrouper = new TableGrouper_1.TableGrouper();
        groupedOps = tableGrouper.group(groupedOps);
        var listNester = new ListNester_1.ListNester();
        return listNester.nest(groupedOps);
    };
    QuillDeltaToHtmlAsyncConverter.prototype.convert = function () {
        var _this = this;
        var groups = this.getGroupedOps();
        return mapStringsAsync(groups, function (group) {
            if (group instanceof group_types_1.ListGroup) {
                return _this._renderWithCallbacks(value_types_1.GroupType.List, group, function () {
                    return _this._renderList(group);
                });
            }
            else if (group instanceof group_types_1.TableGroup) {
                return _this._renderWithCallbacks(value_types_1.GroupType.Table, group, function () {
                    return _this._renderTable(group);
                });
            }
            else if (group instanceof group_types_1.BlockGroup) {
                var g = group;
                return _this._renderWithCallbacks(value_types_1.GroupType.Block, group, function () {
                    return _this._renderBlock(g.op, g.ops);
                });
            }
            else if (group instanceof group_types_1.BlotBlock) {
                return _this._renderCustom(group.op, null);
            }
            else if (group instanceof group_types_1.VideoItem) {
                return _this._renderWithCallbacks(value_types_1.GroupType.Video, group, function () {
                    var g = group;
                    var converter = new OpToHtmlConverter_1.OpToHtmlConverter(g.op, _this.converterOptions);
                    return converter.getHtml();
                });
            }
            else {
                return _this._renderWithCallbacks(value_types_1.GroupType.InlineGroup, group, function () {
                    return _this._renderInlines(group.ops, true);
                });
            }
        });
    };
    QuillDeltaToHtmlAsyncConverter.prototype._renderWithCallbacks = function (groupType, group, myRenderFn) {
        return __awaiter(this, void 0, void 0, function () {
            var html, beforeCb, afterCb;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        html = '';
                        beforeCb = this.callbacks['beforeRender_cb'];
                        html =
                            typeof beforeCb === 'function'
                                ? beforeCb.apply(null, [groupType, group])
                                : '';
                        if (!!html) return [3, 2];
                        return [4, myRenderFn()];
                    case 1:
                        html = _a.sent();
                        _a.label = 2;
                    case 2:
                        afterCb = this.callbacks['afterRender_cb'];
                        html =
                            typeof afterCb === 'function'
                                ? afterCb.apply(null, [groupType, html])
                                : html;
                        return [2, html];
                }
            });
        });
    };
    QuillDeltaToHtmlAsyncConverter.prototype._renderList = function (list) {
        return __awaiter(this, void 0, void 0, function () {
            var firstItem, _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        firstItem = list.items[0];
                        _a = funcs_html_1.makeStartTag(this._getListTag(firstItem.item.op));
                        return [4, mapStringsAsync(list.items, function (li) { return _this._renderListItem(li); })];
                    case 1: return [2, (_a +
                            (_b.sent()) +
                            funcs_html_1.makeEndTag(this._getListTag(firstItem.item.op)))];
                }
            });
        });
    };
    QuillDeltaToHtmlAsyncConverter.prototype._renderListItem = function (li) {
        return __awaiter(this, void 0, void 0, function () {
            var converter, parts, liElementsHtml, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        li.item.op.attributes.indent = 0;
                        converter = new OpToHtmlConverter_1.OpToHtmlConverter(li.item.op, this.converterOptions);
                        parts = converter.getHtmlParts();
                        return [4, this._renderInlines(li.item.ops, false)];
                    case 1:
                        liElementsHtml = _c.sent();
                        _a = parts.openingTag +
                            liElementsHtml;
                        if (!li.innerList) return [3, 3];
                        return [4, this._renderList(li.innerList)];
                    case 2:
                        _b = _c.sent();
                        return [3, 4];
                    case 3:
                        _b = '';
                        _c.label = 4;
                    case 4: return [2, (_a +
                            (_b) +
                            parts.closingTag)];
                }
            });
        });
    };
    QuillDeltaToHtmlAsyncConverter.prototype._renderTable = function (table) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = funcs_html_1.makeStartTag('table') +
                            funcs_html_1.makeStartTag('tbody');
                        return [4, mapStringsAsync(table.rows, function (row) { return _this._renderTableRow(row); })];
                    case 1: return [2, (_a +
                            (_b.sent()) +
                            funcs_html_1.makeEndTag('tbody') +
                            funcs_html_1.makeEndTag('table'))];
                }
            });
        });
    };
    QuillDeltaToHtmlAsyncConverter.prototype._renderTableRow = function (row) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = funcs_html_1.makeStartTag('tr');
                        return [4, mapStringsAsync(row.cells, function (cell) {
                                return _this._renderTableCell(cell);
                            })];
                    case 1: return [2, (_a +
                            (_b.sent()) +
                            funcs_html_1.makeEndTag('tr'))];
                }
            });
        });
    };
    QuillDeltaToHtmlAsyncConverter.prototype._renderTableCell = function (cell) {
        return __awaiter(this, void 0, void 0, function () {
            var converter, parts, cellElementsHtml;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        converter = new OpToHtmlConverter_1.OpToHtmlConverter(cell.item.op, this.converterOptions);
                        parts = converter.getHtmlParts();
                        return [4, this._renderInlines(cell.item.ops, false)];
                    case 1:
                        cellElementsHtml = _a.sent();
                        return [2, (funcs_html_1.makeStartTag('td', {
                                key: 'data-row',
                                value: cell.item.op.attributes.table,
                            }) +
                                parts.openingTag +
                                cellElementsHtml +
                                parts.closingTag +
                                funcs_html_1.makeEndTag('td'))];
                }
            });
        });
    };
    QuillDeltaToHtmlAsyncConverter.prototype._renderBlock = function (bop, ops) {
        return __awaiter(this, void 0, void 0, function () {
            var converter, htmlParts, _a, _b, inlines;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        converter = new OpToHtmlConverter_1.OpToHtmlConverter(bop, this.converterOptions);
                        htmlParts = converter.getHtmlParts();
                        if (!bop.isCodeBlock()) return [3, 2];
                        _a = htmlParts.openingTag;
                        _b = funcs_html_1.encodeHtml;
                        return [4, mapStringsAsync(ops, function (iop) { return __awaiter(_this, void 0, void 0, function () {
                                var _a;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            if (!iop.isCustomEmbed()) return [3, 2];
                                            return [4, this._renderCustom(iop, bop)];
                                        case 1:
                                            _a = _b.sent();
                                            return [3, 3];
                                        case 2:
                                            _a = iop.insert.value;
                                            _b.label = 3;
                                        case 3: return [2, _a];
                                    }
                                });
                            }); })];
                    case 1: return [2, (_a +
                            _b.apply(void 0, [_c.sent()]) +
                            htmlParts.closingTag)];
                    case 2: return [4, mapStringsAsync(ops, function (op) {
                            return _this._renderInline(op, bop);
                        })];
                    case 3:
                        inlines = _c.sent();
                        return [2, htmlParts.openingTag + (inlines || QuillDeltaToHtmlConverter_1.BrTag) + htmlParts.closingTag];
                }
            });
        });
    };
    QuillDeltaToHtmlAsyncConverter.prototype._renderInlines = function (ops, isInlineGroup) {
        if (isInlineGroup === void 0) { isInlineGroup = true; }
        return __awaiter(this, void 0, void 0, function () {
            var opsLen, html, startParaTag, endParaTag;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        opsLen = ops.length - 1;
                        return [4, mapStringsAsync(ops, function (op, i) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (i > 0 && i === opsLen && op.isJustNewline()) {
                                                return [2, ''];
                                            }
                                            return [4, this._renderInline(op, null)];
                                        case 1: return [2, _a.sent()];
                                    }
                                });
                            }); })];
                    case 1:
                        html = _a.sent();
                        if (!isInlineGroup) {
                            return [2, html];
                        }
                        startParaTag = funcs_html_1.makeStartTag(this.options.paragraphTag);
                        endParaTag = funcs_html_1.makeEndTag(this.options.paragraphTag);
                        if (html === QuillDeltaToHtmlConverter_1.BrTag || this.options.multiLineParagraph) {
                            return [2, startParaTag + html + endParaTag];
                        }
                        return [2, (startParaTag +
                                html
                                    .split(QuillDeltaToHtmlConverter_1.BrTag)
                                    .map(function (v) {
                                    return v === '' ? QuillDeltaToHtmlConverter_1.BrTag : v;
                                })
                                    .join(endParaTag + startParaTag) +
                                endParaTag)];
                }
            });
        });
    };
    QuillDeltaToHtmlAsyncConverter.prototype._renderInline = function (op, contextOp) {
        return __awaiter(this, void 0, void 0, function () {
            var converter;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!op.isCustomEmbed()) return [3, 2];
                        return [4, this._renderCustom(op, contextOp)];
                    case 1: return [2, _a.sent()];
                    case 2:
                        converter = new OpToHtmlConverter_1.OpToHtmlConverter(op, this.converterOptions);
                        return [2, converter.getHtml().replace(/\n/g, QuillDeltaToHtmlConverter_1.BrTag)];
                }
            });
        });
    };
    QuillDeltaToHtmlAsyncConverter.prototype._renderCustom = function (op, contextOp) {
        return __awaiter(this, void 0, void 0, function () {
            var renderCb;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.callbacks['renderCustomOp_cb']];
                    case 1:
                        renderCb = _a.sent();
                        if (typeof renderCb === 'function') {
                            return [2, renderCb.apply(null, [op, contextOp])];
                        }
                        return [2, ''];
                }
            });
        });
    };
    QuillDeltaToHtmlAsyncConverter.prototype.beforeRender = function (cb) {
        if (typeof cb === 'function') {
            this.callbacks['beforeRender_cb'] = cb;
        }
    };
    QuillDeltaToHtmlAsyncConverter.prototype.afterRender = function (cb) {
        if (typeof cb === 'function') {
            this.callbacks['afterRender_cb'] = cb;
        }
    };
    QuillDeltaToHtmlAsyncConverter.prototype.renderCustomWith = function (cb) {
        this.callbacks['renderCustomOp_cb'] = cb;
    };
    return QuillDeltaToHtmlAsyncConverter;
}());
exports.QuillDeltaToHtmlAsyncConverter = QuillDeltaToHtmlAsyncConverter;
function mapStringsAsync(arr, cb) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4, mapAsync(arr, cb)];
                case 1:
                    result = _a.sent();
                    return [2, result.join('')];
            }
        });
    });
}
function mapAsync(arr, cb) {
    return __awaiter(this, void 0, void 0, function () {
        var result, index, _i, arr_1, item, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    result = [];
                    index = -1;
                    _i = 0, arr_1 = arr;
                    _c.label = 1;
                case 1:
                    if (!(_i < arr_1.length)) return [3, 4];
                    item = arr_1[_i];
                    _b = (_a = result).push;
                    return [4, cb(item, ++index)];
                case 2:
                    _b.apply(_a, [_c.sent()]);
                    _c.label = 3;
                case 3:
                    _i++;
                    return [3, 1];
                case 4: return [2, result];
            }
        });
    });
}
