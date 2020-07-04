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
              Simple, persisted.
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
    </div >
  );
}
