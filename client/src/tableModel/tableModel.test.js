import { Table } from './tableModel';

const expectTableValuesToBe = (table, expectedValues) => {
  const expectations = Object.fromEntries(expectedValues)
  for (const col of table.cols) {
    for (const row of table.rows) {
      const position = col + row;
      const value = table.fields[position].value
      if (position in expectations) {
        const expectedValue = expectations[position];
        if (value instanceof Error) {
          expect(value.message).toBe(expectedValue.message);
        } else {
          expect(value).toBe(expectedValue);
        }
      } else {
        expect(value).toBe(null);
      }
    }
  }
}

const ERROR_FORMULA = new Error('Incorrect formula!');
const ERROR_DEPENDENCY = new Error('Error among dependencies!');

describe('Table resolution', () => {
  test('errors for incorrect formula', () => {
    const table = Table.of([
      ['A1', 'B7'], ['B1', '2'],
      ['A2', '3'], ['B2', '4'],
    ]);

    expectTableValuesToBe(table, [
      ['A1', ERROR_FORMULA], ['B1', 2],
      ['A2', 3], ['B2', 4],
    ])
  });

  test('for simple values', () => {
    const table = Table.of([
      ['A1', '1'], ['B1', '2'],
      ['A2', '3'], ['B2', '4'],
    ]);

    expectTableValuesToBe(table, [
      ['A1', 1], ['B1', 2],
      ['A2', 3], ['B2', 4],
    ])
  });

  test('for 1-level 1-dependency formula', () => {
    const table = Table.of([
      ['A1', '1'], ['B1', '2'],
      ['A2', '3'], ['B2', '=A2'],
    ]);

    expectTableValuesToBe(table, [
      ['A1', 1], ['B1', 2],
      ['A2', 3], ['B2', 3],
    ])
  });

  test('for 2-level 1-dependency formula', () => {
    const table = Table.of([
      ['A1', '1'], ['B1', '2'],
      ['A2', '=A1'], ['B2', '=A2'],
    ]);

    expectTableValuesToBe(table, [
      ['A1', 1], ['B1', 2],
      ['A2', 1], ['B2', 1],
    ])
  });

  test('for circular 1-dependency formulas', () => {
    const table = Table.of([
      ['A1', '=A2'], ['B1', '=A1'],
      ['A2', '=B2'], ['B2', '=B1'],
    ]);

    expectTableValuesToBe(table, [
      ['A1', ERROR_DEPENDENCY], ['B1', ERROR_DEPENDENCY],
      ['A2', ERROR_DEPENDENCY], ['B2', ERROR_DEPENDENCY],
    ])
  });

  test('for 1-level 2-dependency formula', () => {
    const table = Table.of([
      ['A1', '1'], ['B1', '2'], ['C1', '=A1+B1'],
      ['A2', '4'], ['B2', '5'], ['C2', '=A2+B2'],
    ]);

    expectTableValuesToBe(table, [
      ['A1', 1], ['B1', 2], ['C1', 3],
      ['A2', 4], ['B2', 5], ['C2', 9],
    ])
  });

  test('for 2-level 2-dependency formula', () => {
    const table = Table.of([
      ['A1', '1'], ['B1', '=A1+A2'], ['C1', '=A2+B1'],
      ['A2', '4'], ['B2', '5'], ['C2', '=B1+C1'],
    ]);

    expectTableValuesToBe(table, [
      ['A1', 1], ['B1', 5], ['C1', 9],
      ['A2', 4], ['B2', 5], ['C2', 14],
    ])
  });

  test('for circular 2-dependency formulas', () => {
    const table = Table.of([
      ['A1', '1'], ['B1', '=A1+A2'], ['C1', '=A2+B1'],
      ['A2', '=C1'], ['B2', '5'], ['C2', '=B1+C1'],
    ]);

    expectTableValuesToBe(table, [
      ['A1', 1], ['B1', ERROR_DEPENDENCY], ['C1', ERROR_DEPENDENCY],
      ['A2', ERROR_DEPENDENCY], ['B2', 5], ['C2', ERROR_DEPENDENCY],
    ])
  });
})

describe('Node update', () => {
  test('errors for incorrect formula', () => {
    const table = Table.of([
      ['A1', '=B11'], ['B1', '2'],
      ['A2', '=B2'], ['B2', '4'],
    ]);

    expectTableValuesToBe(table, [
      ['A1', ERROR_FORMULA], ['B1', 2],
      ['A2', 4], ['B2', 4],
    ]);

    table.updateNode('A1', '=B1');
    table.updateNode('A2', '=A11');

    expectTableValuesToBe(table, [
      ['A1', 2], ['B1', 2],
      ['A2', ERROR_FORMULA], ['B2', 4],
    ]);
  });

  test('errors when retargeting to a node with error', () => {
    const table = Table.of([
      ['A1', '=A2'], ['B1', '2'],
      ['A2', '=A1'], ['B2', '4'],
    ]);

    expectTableValuesToBe(table, [
      ['A1', ERROR_DEPENDENCY], ['B1', 2],
      ['A2', ERROR_DEPENDENCY], ['B2', 4],
    ]);

    table.updateNode('B1', '=A1');

    expectTableValuesToBe(table, [
      ['A1', ERROR_DEPENDENCY], ['B1', ERROR_DEPENDENCY],
      ['A2', ERROR_DEPENDENCY], ['B2', 4],
    ]);
  });

  test('calculates value correctly in complex case', () => {
    const table = Table.of([
      ['A1', '1'], ['B1', '2'], ['C1', '=A1+B1'],
      ['A2', '4'], ['B2', '=A2+B1'], ['C2', '=A2+B2'],
      ['A3', '=A1+A2'], ['B3', '=B1+B2'], ['C3', '=A3+B3+C1+C2'],
    ]);

    expectTableValuesToBe(table, [
      ['A1', 1], ['B1', 2], ['C1', 3],
      ['A2', 4], ['B2', 6], ['C2', 10],
      ['A3', 5], ['B3', 8], ['C3', 26],
    ]);

    table.updateNode('C3', '=A3+B2+C1');

    expectTableValuesToBe(table, [
      ['A1', 1], ['B1', 2], ['C1', 3],
      ['A2', 4], ['B2', 6], ['C2', 10],
      ['A3', 5], ['B3', 8], ['C3', 14],
    ]);
  });

  test('propagates newly calculated value correctly in complex case', () => {
    const table = Table.of([
      ['A1', '1'], ['B1', '2'], ['C1', '=A1+B1'],
      ['A2', '4'], ['B2', '=A2+B1'], ['C2', '=A2+B2'],
      ['A3', '=A1+A2'], ['B3', '=B1+B2'], ['C3', '=A3+B3+C1+C2'],
    ]);

    expectTableValuesToBe(table, [
      ['A1', 1], ['B1', 2], ['C1', 3],
      ['A2', 4], ['B2', 6], ['C2', 10],
      ['A3', 5], ['B3', 8], ['C3', 26],
    ]);

    table.updateNode('A1', '11');

    expectTableValuesToBe(table, [
      ['A1', 11], ['B1', 2], ['C1', 13],
      ['A2', 4], ['B2', 6], ['C2', 10],
      ['A3', 15], ['B3', 8], ['C3', 46],
    ]);

    table.updateNode('B1', '22');

    expectTableValuesToBe(table, [
      ['A1', 11], ['B1', 22], ['C1', 33],
      ['A2', 4], ['B2', 26], ['C2', 30],
      ['A3', 15], ['B3', 48], ['C3', 126],
    ]);

    table.updateNode('C1', '33');

    expectTableValuesToBe(table, [
      ['A1', 11], ['B1', 22], ['C1', 33],
      ['A2', 4], ['B2', 26], ['C2', 30],
      ['A3', 15], ['B3', 48], ['C3', 126],
    ]);

    table.updateNode('B2', '44');

    expectTableValuesToBe(table, [
      ['A1', 11], ['B1', 22], ['C1', 33],
      ['A2', 4], ['B2', 44], ['C2', 48],
      ['A3', 15], ['B3', 66], ['C3', 162],
    ]);

    table.updateNode('A3', '=C3');
    table.updateNode('C1', '=C3');

    expectTableValuesToBe(table, [
      ['A1', 11], ['B1', 22], ['C1', ERROR_DEPENDENCY],
      ['A2', 4], ['B2', 44], ['C2', 48],
      ['A3', ERROR_DEPENDENCY], ['B3', 66], ['C3', ERROR_DEPENDENCY],
    ]);
  });
});
