/* global E */

Object.defineProperty(String.prototype, 'E', {get() {return E(this)}});
