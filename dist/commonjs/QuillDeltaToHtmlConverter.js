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
exports.BrTag = '<br/>';
var QuillDeltaToHtmlConverter = (function () {
    function QuillDeltaToHtmlConverter(deltaOps, options) {
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
    QuillDeltaToHtmlConverter.prototype._getListTag = function (op) {
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
    QuillDeltaToHtmlConverter.prototype.getGroupedOps = function () {
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
    QuillDeltaToHtmlConverter.prototype.convert = function () {
        var _this = this;
        var groups = this.getGroupedOps();
        return groups
            .map(function (group) {
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
        })
            .join('');
    };
    QuillDeltaToHtmlConverter.prototype._renderWithCallbacks = function (groupType, group, myRenderFn) {
        var html = '';
        var beforeCb = this.callbacks['beforeRender_cb'];
        html =
            typeof beforeCb === 'function'
                ? beforeCb.apply(null, [groupType, group])
                : '';
        if (!html) {
            html = myRenderFn();
        }
        var afterCb = this.callbacks['afterRender_cb'];
        html =
            typeof afterCb === 'function'
                ? afterCb.apply(null, [groupType, html])
                : html;
        return html;
    };
    QuillDeltaToHtmlConverter.prototype._renderList = function (list) {
        var _this = this;
        var firstItem = list.items[0];
        return (funcs_html_1.makeStartTag(this._getListTag(firstItem.item.op)) +
            list.items.map(function (li) { return _this._renderListItem(li); }).join('') +
            funcs_html_1.makeEndTag(this._getListTag(firstItem.item.op)));
    };
    QuillDeltaToHtmlConverter.prototype._renderListItem = function (li) {
        li.item.op.attributes.indent = 0;
        var converter = new OpToHtmlConverter_1.OpToHtmlConverter(li.item.op, this.converterOptions);
        var parts = converter.getHtmlParts();
        var liElementsHtml = this._renderInlines(li.item.ops, false);
        return (parts.openingTag +
            liElementsHtml +
            (li.innerList ? this._renderList(li.innerList) : '') +
            parts.closingTag);
    };
    QuillDeltaToHtmlConverter.prototype._renderTable = function (table) {
        var _this = this;
        return (funcs_html_1.makeStartTag('table') +
            funcs_html_1.makeStartTag('tbody') +
            table.rows.map(function (row) { return _this._renderTableRow(row); }).join('') +
            funcs_html_1.makeEndTag('tbody') +
            funcs_html_1.makeEndTag('table'));
    };
    QuillDeltaToHtmlConverter.prototype._renderTableRow = function (row) {
        var _this = this;
        return (funcs_html_1.makeStartTag('tr') +
            row.cells.map(function (cell) { return _this._renderTableCell(cell); }).join('') +
            funcs_html_1.makeEndTag('tr'));
    };
    QuillDeltaToHtmlConverter.prototype._renderTableCell = function (cell) {
        var converter = new OpToHtmlConverter_1.OpToHtmlConverter(cell.item.op, this.converterOptions);
        var parts = converter.getHtmlParts();
        var cellElementsHtml = this._renderInlines(cell.item.ops, false);
        return (funcs_html_1.makeStartTag('td', {
            key: 'data-row',
            value: cell.item.op.attributes.table,
        }) +
            parts.openingTag +
            cellElementsHtml +
            parts.closingTag +
            funcs_html_1.makeEndTag('td'));
    };
    QuillDeltaToHtmlConverter.prototype._renderBlock = function (bop, ops) {
        var _this = this;
        var converter = new OpToHtmlConverter_1.OpToHtmlConverter(bop, this.converterOptions);
        var htmlParts = converter.getHtmlParts();
        if (bop.isCodeBlock()) {
            return (htmlParts.openingTag +
                funcs_html_1.encodeHtml(ops
                    .map(function (iop) {
                    return iop.isCustomEmbed()
                        ? _this._renderCustom(iop, bop)
                        : iop.insert.value;
                })
                    .join('')) +
                htmlParts.closingTag);
        }
        var inlines = ops.map(function (op) { return _this._renderInline(op, bop); }).join('');
        return htmlParts.openingTag + (inlines || exports.BrTag) + htmlParts.closingTag;
    };
    QuillDeltaToHtmlConverter.prototype._renderInlines = function (ops, isInlineGroup) {
        var _this = this;
        if (isInlineGroup === void 0) { isInlineGroup = true; }
        var opsLen = ops.length - 1;
        var html = ops
            .map(function (op, i) {
            if (i > 0 && i === opsLen && op.isJustNewline()) {
                return '';
            }
            return _this._renderInline(op, null);
        })
            .join('');
        if (!isInlineGroup) {
            return html;
        }
        var startParaTag = funcs_html_1.makeStartTag(this.options.paragraphTag);
        var endParaTag = funcs_html_1.makeEndTag(this.options.paragraphTag);
        if (html === exports.BrTag || this.options.multiLineParagraph) {
            return startParaTag + html + endParaTag;
        }
        return (startParaTag +
            html
                .split(exports.BrTag)
                .map(function (v) {
                return v === '' ? exports.BrTag : v;
            })
                .join(endParaTag + startParaTag) +
            endParaTag);
    };
    QuillDeltaToHtmlConverter.prototype._renderInline = function (op, contextOp) {
        if (op.isCustomEmbed()) {
            return this._renderCustom(op, contextOp);
        }
        var converter = new OpToHtmlConverter_1.OpToHtmlConverter(op, this.converterOptions);
        return converter.getHtml().replace(/\n/g, exports.BrTag);
    };
    QuillDeltaToHtmlConverter.prototype._renderCustom = function (op, contextOp) {
        var renderCb = this.callbacks['renderCustomOp_cb'];
        if (typeof renderCb === 'function') {
            return renderCb.apply(null, [op, contextOp]);
        }
        return '';
    };
    QuillDeltaToHtmlConverter.prototype._renderCustomAsync = function (op, contextOp) {
        return __awaiter(this, void 0, void 0, function () {
            var renderCb;
            return __generator(this, function (_a) {
                renderCb = this.callbacks['renderCustomAsyncOp_cb'];
                if (typeof renderCb === 'function') {
                    return [2, renderCb.apply(null, [op, contextOp])];
                }
                return [2, ''];
            });
        });
    };
    QuillDeltaToHtmlConverter.prototype.beforeRender = function (cb) {
        if (typeof cb === 'function') {
            this.callbacks['beforeRender_cb'] = cb;
        }
    };
    QuillDeltaToHtmlConverter.prototype.afterRender = function (cb) {
        if (typeof cb === 'function') {
            this.callbacks['afterRender_cb'] = cb;
        }
    };
    QuillDeltaToHtmlConverter.prototype.renderCustomWith = function (cb) {
        this.callbacks['renderCustomOp_cb'] = cb;
    };
    QuillDeltaToHtmlConverter.prototype.renderCustomWithAsync = function (cb) {
        this.callbacks['renderCustomAsyncOp_cb'] = cb;
    };
    return QuillDeltaToHtmlConverter;
}());
exports.QuillDeltaToHtmlConverter = QuillDeltaToHtmlConverter;
