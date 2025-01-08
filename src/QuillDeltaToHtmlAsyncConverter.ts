import { InsertOpsConverter } from './InsertOpsConverter';
import {
  OpToHtmlConverter,
  IOpToHtmlConverterOptions,
  IInlineStyles,
} from './OpToHtmlConverter';
import { DeltaInsertOp } from './DeltaInsertOp';
import { Grouper } from './grouper/Grouper';
import {
  VideoItem,
  InlineGroup,
  BlockGroup,
  ListGroup,
  ListItem,
  TDataGroup,
  BlotBlock,
  TableGroup,
  TableRow,
  TableCell,
} from './grouper/group-types';
import { ListNester } from './grouper/ListNester';
import { makeStartTag, makeEndTag, encodeHtml } from './funcs-html';
import * as obj from './helpers/object';
import { GroupType } from './value-types';
import { TableGrouper } from './grouper/TableGrouper';
import {
  BrTag,
  IQuillDeltaToHtmlConverterOptions,
} from './QuillDeltaToHtmlConverter';

export class QuillDeltaToHtmlAsyncConverter {
  private options: IQuillDeltaToHtmlConverterOptions;
  private rawDeltaOps: any[] = [];
  private converterOptions: IOpToHtmlConverterOptions;

  // render callbacks
  private callbacks: any = {};

  constructor(
    deltaOps: any[],
    options?: IQuillDeltaToHtmlConverterOptions & {
      linkTarget?: (url: string) => string | undefined;
    }
  ) {
    this.options = obj.assign(
      {
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
      },
      options,
      {
        orderedListTag: 'ol',
        bulletListTag: 'ul',
        listItemTag: 'li',
      }
    );

    var inlineStyles: IInlineStyles | undefined;
    if (!this.options.inlineStyles) {
      inlineStyles = undefined;
    } else if (typeof this.options.inlineStyles === 'object') {
      inlineStyles = this.options.inlineStyles;
    } else {
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

  _getListTag(op: DeltaInsertOp): string {
    return op.isOrderedList()
      ? this.options.orderedListTag + ''
      : op.isBulletList()
      ? this.options.bulletListTag + ''
      : op.isCheckedList()
      ? this.options.bulletListTag + ''
      : op.isUncheckedList()
      ? this.options.bulletListTag + ''
      : '';
  }

  getGroupedOps(): TDataGroup[] {
    var deltaOps = InsertOpsConverter.convert(this.rawDeltaOps, this.options);

    var pairedOps = Grouper.pairOpsWithTheirBlock(deltaOps);

    var groupedSameStyleBlocks = Grouper.groupConsecutiveSameStyleBlocks(
      pairedOps,
      {
        blockquotes: !!this.options.multiLineBlockquote,
        header: !!this.options.multiLineHeader,
        codeBlocks: !!this.options.multiLineCodeblock,
        customBlocks: !!this.options.multiLineCustomBlock,
      }
    );

    var groupedOps = Grouper.reduceConsecutiveSameStyleBlocksToOne(
      groupedSameStyleBlocks
    );

    var tableGrouper = new TableGrouper();
    groupedOps = tableGrouper.group(groupedOps);

    var listNester = new ListNester();
    return listNester.nest(groupedOps);
  }

  convert() {
    let groups = this.getGroupedOps();
    return mapStringsAsync(groups, (group) => {
      if (group instanceof ListGroup) {
        return this._renderWithCallbacks(GroupType.List, group, () =>
          this._renderList(<ListGroup>group)
        );
      } else if (group instanceof TableGroup) {
        return this._renderWithCallbacks(GroupType.Table, group, () =>
          this._renderTable(<TableGroup>group)
        );
      } else if (group instanceof BlockGroup) {
        var g = <BlockGroup>group;

        return this._renderWithCallbacks(GroupType.Block, group, () =>
          this._renderBlock(g.op, g.ops)
        );
      } else if (group instanceof BlotBlock) {
        return this._renderCustom(group.op, null);
      } else if (group instanceof VideoItem) {
        return this._renderWithCallbacks(GroupType.Video, group, () => {
          var g = <VideoItem>group;
          var converter = new OpToHtmlConverter(g.op, this.converterOptions);
          return converter.getHtml();
        });
      } else {
        // InlineGroup
        return this._renderWithCallbacks(GroupType.InlineGroup, group, () =>
          this._renderInlines((<InlineGroup>group).ops, true)
        );
      }
    });
  }

  async _renderWithCallbacks(
    groupType: GroupType,
    group: TDataGroup,
    myRenderFn: () => Promise<string> | string
  ) {
    var html = '';
    var beforeCb = this.callbacks['beforeRender_cb'];
    html =
      typeof beforeCb === 'function'
        ? beforeCb.apply(null, [groupType, group])
        : '';

    if (!html) {
      html = await myRenderFn();
    }

    var afterCb = this.callbacks['afterRender_cb'];
    html =
      typeof afterCb === 'function'
        ? afterCb.apply(null, [groupType, html])
        : html;

    return html;
  }

  async _renderList(list: ListGroup): Promise<string> {
    var firstItem = list.items[0];
    return (
      makeStartTag(this._getListTag(firstItem.item.op)) +
      (await mapStringsAsync(list.items, (li) => this._renderListItem(li))) +
      makeEndTag(this._getListTag(firstItem.item.op))
    );
  }

  async _renderListItem(li: ListItem): Promise<string> {
    //if (!isOuterMost) {
    li.item.op.attributes.indent = 0;
    //}
    var converter = new OpToHtmlConverter(li.item.op, this.converterOptions);
    var parts = converter.getHtmlParts();
    var liElementsHtml = await this._renderInlines(li.item.ops, false);
    return (
      parts.openingTag +
      liElementsHtml +
      (li.innerList ? await this._renderList(li.innerList) : '') +
      parts.closingTag
    );
  }

  async _renderTable(table: TableGroup): Promise<string> {
    return (
      makeStartTag('table') +
      makeStartTag('tbody') +
      (await mapStringsAsync(table.rows, (row) => this._renderTableRow(row))) +
      makeEndTag('tbody') +
      makeEndTag('table')
    );
  }

  async _renderTableRow(row: TableRow): Promise<string> {
    return (
      makeStartTag('tr') +
      (await mapStringsAsync(row.cells, (cell) =>
        this._renderTableCell(cell)
      )) +
      makeEndTag('tr')
    );
  }

  async _renderTableCell(cell: TableCell): Promise<string> {
    var converter = new OpToHtmlConverter(cell.item.op, this.converterOptions);
    var parts = converter.getHtmlParts();
    var cellElementsHtml = await this._renderInlines(cell.item.ops, false);
    return (
      makeStartTag('td', {
        key: 'data-row',
        value: cell.item.op.attributes.table,
      }) +
      parts.openingTag +
      cellElementsHtml +
      parts.closingTag +
      makeEndTag('td')
    );
  }

  async _renderBlock(bop: DeltaInsertOp, ops: DeltaInsertOp[]) {
    var converter = new OpToHtmlConverter(bop, this.converterOptions);
    var htmlParts = converter.getHtmlParts();

    if (bop.isCodeBlock()) {
      return (
        htmlParts.openingTag +
        encodeHtml(
          await mapStringsAsync(ops, async (iop) =>
            iop.isCustomEmbed()
              ? await this._renderCustom(iop, bop)
              : iop.insert.value
          )
        ) +
        htmlParts.closingTag
      );
    }

    var inlines = await mapStringsAsync(ops, (op) =>
      this._renderInline(op, bop)
    );

    return htmlParts.openingTag + (inlines || BrTag) + htmlParts.closingTag;
  }

  async _renderInlines(ops: DeltaInsertOp[], isInlineGroup = true) {
    var opsLen = ops.length - 1;
    var html = await mapStringsAsync(
      ops,
      async (op: DeltaInsertOp, i: number) => {
        if (i > 0 && i === opsLen && op.isJustNewline()) {
          return '';
        }
        return await this._renderInline(op, null);
      }
    );
    if (!isInlineGroup) {
      return html;
    }

    let startParaTag = makeStartTag(this.options.paragraphTag);
    let endParaTag = makeEndTag(this.options.paragraphTag);
    if (html === BrTag || this.options.multiLineParagraph) {
      return startParaTag + html + endParaTag;
    }
    return (
      startParaTag +
      html
        .split(BrTag)
        .map((v) => {
          return v === '' ? BrTag : v;
        })
        .join(endParaTag + startParaTag) +
      endParaTag
    );
  }

  async _renderInline(op: DeltaInsertOp, contextOp: DeltaInsertOp | null) {
    if (op.isCustomEmbed()) {
      return await this._renderCustom(op, contextOp);
    }
    var converter = new OpToHtmlConverter(op, this.converterOptions);
    return converter.getHtml().replace(/\n/g, BrTag);
  }

  async _renderCustom(
    op: DeltaInsertOp,
    contextOp: DeltaInsertOp | null
  ): Promise<string> {
    var renderCb = await this.callbacks['renderCustomOp_cb'];
    if (typeof renderCb === 'function') {
      return renderCb.apply(null, [op, contextOp]);
    }
    return '';
  }

  beforeRender(cb: (group: GroupType, data: TDataGroup) => string) {
    if (typeof cb === 'function') {
      this.callbacks['beforeRender_cb'] = cb;
    }
  }

  afterRender(cb: (group: GroupType, html: string) => string) {
    if (typeof cb === 'function') {
      this.callbacks['afterRender_cb'] = cb;
    }
  }

  renderCustomWith(
    cb: (
      op: DeltaInsertOp,
      contextOp: DeltaInsertOp
    ) => Promise<string> | string
  ) {
    this.callbacks['renderCustomOp_cb'] = cb;
  }
}

async function mapStringsAsync<T>(
  arr: T[],
  cb: (item: T, index: number) => Promise<string> | string
): Promise<string> {
  const result = await mapAsync(arr, cb);
  return result.join('');
}

async function mapAsync<T, R>(
  arr: T[],
  cb: (item: T, index: number) => Promise<R> | R
): Promise<R[]> {
  const result: R[] = [];
  let index = -1;
  for (const item of arr) {
    result.push(await cb(item, ++index));
  }
  return result;
}
