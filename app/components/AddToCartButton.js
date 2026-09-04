'use client';

import { useState } from 'react';

export default function AddToCartButton({ productId }) {
  const [added, setAdded] = useState(false);

  function addToCart() {
    let cart = {};
    try { cart = JSON.parse(window.localStorage.getItem('deli-cart') || '{}'); } catch { cart = {}; }
    cart[productId] = (cart[productId] || 0) + 1;
    window.localStorage.setItem('deli-cart', JSON.stringify(cart));
    setAdded(true);
  }

  return <button className="button button-red" onClick={addToCart}>{added ? 'Kosárba téve ✓' : 'Kosárba'}</button>;
}
