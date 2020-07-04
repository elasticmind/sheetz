import React from 'react';

export const TableCell = ({ value, content, selected, className, ...otherProps }) => {
  const isError = value instanceof Error;

  return (
    <td className={`${selected ? 'has-background-primary-light' : ''} ${isError ? 'has-text-danger' : ''} ${className}`} {...otherProps}>
      {selected
        ? content
        : isError
          ? 'ERROR'
          : value}
    </td>
  );
}