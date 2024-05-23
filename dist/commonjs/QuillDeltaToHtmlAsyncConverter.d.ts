import { DeltaInsertOp } from './DeltaInsertOp';
import {
  ListGroup,
  ListItem,
  TDataGroup,
  TableGroup,
  TableRow,
  TableCell,
} from './grouper/group-types';
import { GroupType } from './value-types';
import { IQuillDeltaToHtmlConverterOptions } from './QuillDeltaToHtmlConverter';
export declare class QuillDeltaToHtmlAsyncConverter {
  private options;
  private rawDeltaOps;
  private converterOptions;
  private callbacks;
  constructor(deltaOps: any[], options?: IQuillDeltaToHtmlConverterOptions);
  _getListTag(op: DeltaInsertOp): string;
  getGroupedOps(): TDataGroup[];
  convert(): Promise<string>;
  _renderWithCallbacks(
    groupType: GroupType,
    group: TDataGroup,
    myRenderFn: () => Promise<string> | string
  ): Promise<string>;
  _renderList(list: ListGroup): Promise<string>;
  _renderListItem(li: ListItem): Promise<string>;
  _renderTable(table: TableGroup): Promise<string>;
  _renderTableRow(row: TableRow): Promise<string>;
  _renderTableCell(cell: TableCell): Promise<string>;
  _renderBlock(bop: DeltaInsertOp, ops: DeltaInsertOp[]): Promise<string>;
  _renderInlines(
    ops: DeltaInsertOp[],
    isInlineGroup?: boolean
  ): Promise<string>;
  _renderInline(
    op: DeltaInsertOp,
    contextOp: DeltaInsertOp | null
  ): Promise<string>;
  _renderCustom(
    op: DeltaInsertOp,
    contextOp: DeltaInsertOp | null
  ): Promise<string>;
  beforeRender(cb: (group: GroupType, data: TDataGroup) => string): void;
  afterRender(cb: (group: GroupType, html: string) => string): void;
  renderCustomWith(
    cb: (
      op: DeltaInsertOp,
      contextOp: DeltaInsertOp
    ) => Promise<string> | string
  ): void;
}
