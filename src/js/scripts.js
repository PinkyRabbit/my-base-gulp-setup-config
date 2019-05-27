'use strict';

window.onload = () => {
  var h3 = document.getElementById('demo');
  demo.textContent = 'I changed a content with JS!';
};

function thankyou() {
  toastr.success('Thank you! *_*', 'Mikita Says:', {timeOut: 60000});
}


function widthAndHeigth() {
  var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight|| e.clientHeight|| g.clientHeight;
  return { width: x, height: y };
}

document.addEventListener('DOMContentLoaded', () => {
  const { width, heigth } = widthAndHeigth();
});
