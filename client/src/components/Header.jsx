import React from 'react';
import './Header.css'

export const Header = () => (
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
      <figure className="image is-128x128 decoration__sum-image">
        <img src="/favicon.png" alt="decor" />
      </figure>
      <figure className="image is-96x96 decoration__sum-image">
        <img src="/favicon.png" alt="decor" />
      </figure>
      <figure className="image is-64x64 decoration__sum-image">
        <img src="/favicon.png" alt="decor" />
      </figure>
    </div>
  </header>
);