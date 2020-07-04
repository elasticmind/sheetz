const UNRESOLVED = 'UNRESOLVED';
const RESOLVING = 'RESOLVING';
const RESOLVED = 'RESOLVED';

export const COL_KEYS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
export const ROW_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

function Node(content = '', value = null, dependencies = new Set(), state) {
  return {
    content,
    value,
    dependencies,
    state,
  };
}

export class Table {
  static of(array = []) {
    const table = new Table();
    table.cols = COL_KEYS;
    table.rows = ROW_KEYS;
    const defaults = Object.fromEntries(array)
    table.fields = {};
    for (const column of table.cols) {
      for (const row of table.rows) {
        const position = column + row;
        table.fields[position] = new Node(defaults[position] || '');
      }
    }

    table.resolveNodes();
    return table;
  }

  get size() {
    return [this.cols.length, this.rows.length];
  }

  get nodes() {
    return Object.values(this.fields);
  }

  clone() {
    const table = Object.create(Table.prototype);
    table.cols = [...this.cols];
    table.rows = [...this.rows];
    table.fields = Object.entries(this.fields).reduce((fields, [position, node]) => {
      fields[position] = new Node(...Object.values(node));
      return fields;
    }, {});

    return table;
  }

  toString() {
    const [cols, rows] = this.size;
    let string = '';
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const node = this.fields[COL_KEYS[c] + ROW_KEYS[r]]
        string += `[${COL_KEYS[c]}${ROW_KEYS[r]}] ${node.value}   content: ${node.content} dependencies: ${Array.from(node.dependencies).join(',')}\n`;
      }
    }

    return string;
  }

  resolveNode(node) {
    if (node.state === RESOLVED) {
      return node;
    }
    if (node.state === RESOLVING) {
      node.value = new Error('Error among dependencies!')
      node.state = RESOLVED;
      return node;
    }

    if (node.content === '') {
      node.value = null;
      node.dependencies = new Set();
      node.state = RESOLVED;
    } else if (node.content === String(Number(node.content))) {
      node.value = Number(node.content);
      node.dependencies = new Set();
      node.state = RESOLVED;
    } else {
      let isValidFormula = node.content[0] === '=';
      if (isValidFormula) {
        const dependencies = node.content.slice(1).split('+');
        const operandRegex = new RegExp(`^(${this.cols.join('|')})(${this.rows.join('|')})$`);
        isValidFormula = dependencies.every(operand => operandRegex.test(operand))
        if (isValidFormula) {
          node.dependencies = new Set(dependencies);
          node.state = RESOLVING;

          const resolvedDependencies = dependencies
            .map(dependency => this.resolveNode(this.fields[dependency]));

          const hasInvalidDependency = resolvedDependencies
            .some((resolvedDependency) => resolvedDependency.value === null || resolvedDependency.value instanceof Error);
          if (hasInvalidDependency) {
            node.value = new Error('Error among dependencies!');
            node.state = RESOLVED;
          } else {
            node.value = resolvedDependencies
              .map((resolvedDependency) => resolvedDependency.value)
              .reduce((sum, value) => sum + value, 0);
            node.state = RESOLVED;
          }
        }
      }

      if (!isValidFormula) {
        node.value = new Error('Incorrect formula!');
        node.dependencies = new Set();
        node.state = RESOLVED;
      }
    }

    return node;
  }

  resolveNodes(nodes = this.nodes) {
    nodes.forEach((node) => node.state = UNRESOLVED);
    nodes.forEach(this.resolveNode.bind(this));
  }

  updateNode(position, content) {
    const node = this.fields[position];
    node.content = content;

    const dependantPositions = new Set([position]);
    const newlyAddedDependantPositions = new Set([position]);
    while (newlyAddedDependantPositions.size > 0) {
      newlyAddedDependantPositions.clear();

      Object.entries(this.fields).forEach(([potentialDependantPosition, potentialDependantNode]) => {
        const isDependantNode = Array.from(dependantPositions)
          .some((dependantPosition) => potentialDependantNode.content.includes(dependantPosition))
        if (isDependantNode && !dependantPositions.has(potentialDependantPosition)) {
          newlyAddedDependantPositions.add(potentialDependantPosition);
        }
      });

      newlyAddedDependantPositions.forEach(newlyAddedPosition => dependantPositions.add(newlyAddedPosition))
    }
    this.resolveNodes(Array.from(dependantPositions).map(x => this.fields[x]));
  }
}
