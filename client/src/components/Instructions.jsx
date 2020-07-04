import React from 'react';

export const Instructions = () => (
  <section className="content box px-6">
    <h2>
      Instructions
        </h2>
    <p>
      Select a cell to edit its contents. Content can either be a number or a formula.
      A formula must start with a '=' sign and it can only contain references to cells in range and plus signs.
        </p>
    <p>
      Some valid formulas:
        </p>
    <ul>
      <li>'=A2'</li>
      <li>'=A2+B2+C2'</li>
      <li>'=A2+A2+A2'</li>
    </ul>
    <p>
      Some invalid formulas:
        </p>
    <ul>
      <li>'A2'</li>
      <li>'=K11'</li>
      <li>'=A2*A3'</li>
    </ul>
    <p>
      You can deselect a selected cell by clicking on the upper left corner of the table.
        </p>
    <p>
      Feel free to edit as you wish, all your changes are persisted. :)
        </p>
  </section>
);