window.onload = function() {
  var h3 = document.getElementById('demo');
  demo.textContent = 'I changed a content with JS!';
};

function thankyou() {
  toastr.success('Thank you! *_*', 'Mikita Says:', {timeOut: 60000});
}
