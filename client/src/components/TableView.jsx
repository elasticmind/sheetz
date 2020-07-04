import React from 'react';
import { TableCell } from './TableCell';
import { forwardRef } from 'react';

export const TableView = forwardRef(({ table, selected, onSelect }, ref) => {
  const headerCellClasses = "tile has-text-centered has-text-weight-bold px-1 py-1";
  const unselectedHeaderCellClasses = "has-background-grey-dark has-text-primary-light";
  const selectedHeaderCellClasses = "has-background-grey has-text-primary-light";

  return (
    <table className="table is-bordered is-striped is-fullwidth" ref={ref}>
      <tbody>
        <tr className="tile">
          <td className="tile is-2 px-1 py-1" onClick={() => onSelect('')} />
          {table.cols.map(col => (
            <td
              style={{ display: 'block' }}
              className={`${headerCellClasses} is-1 ${selected.startsWith(col) ? selectedHeaderCellClasses : unselectedHeaderCellClasses}`}
              key={col}>
              {col}
            </td>
          ))}
        </tr>
        {table.rows.map((row) => (
          <tr className="tile" key={row}>
            <td
              style={{ display: 'block' }}
              className={`${headerCellClasses} is-2 ${selected.endsWith(row) ? selectedHeaderCellClasses : unselectedHeaderCellClasses}`}>
              {row}
            </td>
            {table.cols.map((col) => {
              const position = col + row;
              const { content, value } = table.fields[position];

              return <TableCell className={`tile is-1 px-1 py-1`} key={col} value={value} content={content} selected={selected === position} onClick={() => onSelect(position)} />;
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
});
