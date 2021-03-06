import React, { useState, useEffect, useRef } from 'react';
import { ContentEditor } from './components/ContentEditor';
import { TableView } from './components/TableView';
import { Table } from './tableModel/tableModel';
import { Notifications } from './components/Notifications';
import { Instructions } from './components/Instructions';
import { Footer } from './components/Footer';
import { Header } from './components/Header';

const serverBaseURL = process.env.REACT_APP_SERVER_URL;

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

  useEffect(() => {
    const keyDownListener = (event) => {
      if(event.key === "Escape") {
        setContentEditorValue('');
        setSelected('');
      }
    }

    document.addEventListener('keydown', keyDownListener);
    return () => document.removeEventListener('keydown', keyDownListener);
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

  const handleSelectionChange = async (position) => {
    setSelected(position);
    if (position) {
      await setContentEditorValue(table.fields[position].content);
      contentEditorRef.current.focus();
      contentEditorRef.current.setSelectionRange(0, contentEditorRef.current.value.length)
    } else {
      setContentEditorValue('');
    }
  }

  return (
    <div className="container is-widescreen">
      <Header />
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
      <Instructions />
      <Footer />
    </div >
  );
}
