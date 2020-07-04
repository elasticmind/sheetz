import React, { forwardRef } from 'react';

export const ContentEditor = forwardRef(({ value, onChange, onSubmit }, ref) => {
  const handleSubmit = (event, value) => {
    event.preventDefault();
    onSubmit(value);
  }

  return (
    <form className="field has-addons mt-4">
      <div className="control is-expanded">
        <input ref={ref} type="text" className="input" placeholder="Content" id="content" value={value} onChange={onChange} />
      </div>
      <div className="control">
        <button type="submit" className="button is-primary has-text-white" onClick={(event) => handleSubmit(event, value)}>
          <i className="fas fa-check"></i>
          <span className="ml-2">Set</span>
        </button>
      </div>
    </form>
  );
});
