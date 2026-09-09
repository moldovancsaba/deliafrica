'use client';

import { Button } from "@sovereignsquad/gds/client";
import { useState } from 'react';
export default function AddToCartButton({
  productId,
  label = '',
  addedLabel = ''
}) {
  const [added, setAdded] = useState(false);
  function addToCart() {
    let cart = {};
    try {
      cart = JSON.parse(window.localStorage.getItem('deli-cart') || '{}');
    } catch {
      cart = {};
    }
    cart[productId] = (cart[productId] || 0) + 1;
    window.localStorage.setItem('deli-cart', JSON.stringify(cart));
    setAdded(true);
  }
  return <Button onClick={addToCart} type="button">{added ? addedLabel : label}</Button>;
}
