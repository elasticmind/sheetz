import React, { useState, useEffect, useRef } from 'react';
import { ContentEditor } from './components/ContentEditor';
import { TableView } from './components/TableView';
import { Table } from './tableModel/tableModel';
import { Notifications } from './components/Notifications';

const serverBaseURL = 'http://127.0.0.1:5000';

export const App = () => {
  const contentEditorRef = useRef(null);
  const tableVeiwRef = useRef(null);
  const notificationsRef = useRef(null);
  const [contentEditorValue, setContentEditorValue] = useState('');
  const [selected, setSelected] = useState('');
  const [isFetching, setIsFetching] = useState(true);
  const [table, setTable] = useState(Table.of());

  useEffect(() => {
    const fetchTable = async () => {
      const savedTable = await (await fetch(`${serverBaseURL}/table/`)).json();
      setTable(Table.of(savedTable));
      setIsFetching(false);
    }
    fetchTable();
  }, []);

  const handleContentEditorChange = (event) => {
    setContentEditorValue(event.target.value);
  }

  const handleContentEditorSubmit = (newContent) => {
    if (!selected) {
      notificationsRef.current.add('Please select a cell to edit!');
      return;
    }

    setTable((oldTable) => {
      oldTable.updateNode(selected, newContent);
      return oldTable.clone();
    })

    const updateCell = async () => {
      const body = JSON.stringify({ position: selected, content: newContent });
      await fetch(`${serverBaseURL}/table/`, {
        method: 'POST',
        body,
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    updateCell();
    setContentEditorValue('');
    setSelected('');
    contentEditorRef.current.blur();
  }

  const handleSelectionChange = (position) => {
    setSelected(position);
    if (position) {
      setContentEditorValue(table.fields[position].content);
      contentEditorRef.current.focus();
    }
  }

  return (
    <div className="container is-widescreen">
      <header className="hero is-primary">
        <div className="hero-body">
          <div className="container">
            <h1 className="title">
              Sheetz
            </h1>
            <h2 className="subtitle">
              Simple, fast, persisted.
            </h2>
          </div>
        </div>
      </header>
      <main className="container is-widescreen box">
        {
          isFetching
            ? <progress className="progress is-small is-primary" max="100">15%</progress>
            : <>
              <ContentEditor ref={contentEditorRef} value={contentEditorValue} onChange={handleContentEditorChange} onSubmit={handleContentEditorSubmit} />
              <TableView ref={tableVeiwRef} table={table} selected={selected} onSelect={handleSelectionChange} />
              <Notifications ref={notificationsRef} />
            </>
        }
      </main>
      <section className="content px-6">
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
      <footer className="footer">
        <div className="content has-text-centered">
          <p>
            <strong>Sheetz</strong> by <a href="https://elasticmind.design">Tibor Zombory</a>, 2020.
          </p>
        </div>
      </footer>
    </div >
  );
}
