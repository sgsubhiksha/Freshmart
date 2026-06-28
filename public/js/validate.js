/* ── FreshCart validate.js — jQuery Validation rules ─────────────── */
$(function () {

  // ── Signup form ─────────────────────────────────────────────────
  $('#signup-form').validate({
    rules: {
      name: { required: true, minlength: 2 },
      email: { required: true, email: true },
      password: { required: true, minlength: 6 },
      confirmPassword: { required: true, equalTo: '#password' },
    },
    messages: {
      name: { required: 'Please enter your name.', minlength: 'Name must be at least 2 characters.' },
      email: { required: 'Please enter your email.', email: 'Enter a valid email address.' },
      password: { required: 'Please enter a password.', minlength: 'Password must be at least 6 characters.' },
      confirmPassword: { required: 'Please confirm your password.', equalTo: 'Passwords do not match.' },
    },
    errorClass: 'text-danger small',
    errorElement: 'span',
    highlight: el => $(el).addClass('is-invalid'),
    unhighlight: el => $(el).removeClass('is-invalid'),
  });

  // ── Login form ──────────────────────────────────────────────────
  $('#login-form').validate({
    rules: {
      email: { required: true, email: true },
      password: { required: true },
    },
    messages: {
      email: { required: 'Email is required.', email: 'Enter a valid email.' },
      password: { required: 'Password is required.' },
    },
    errorClass: 'text-danger small',
    errorElement: 'span',
    highlight: el => $(el).addClass('is-invalid'),
    unhighlight: el => $(el).removeClass('is-invalid'),
  });

  // ── Checkout form ───────────────────────────────────────────────
  $('#checkout-form').validate({
    rules: {
      street: { required: true, minlength: 5 },
      city: { required: true },
      pincode: { required: true, digits: true, minlength: 6, maxlength: 6 },
      phone: { required: true, digits: true, minlength: 10, maxlength: 10 },
    },
    messages: {
      street: { required: 'Street address is required.' },
      city: { required: 'City is required.' },
      pincode: { required: 'PIN code is required.', digits: 'Enter a 6-digit PIN code.', minlength: 'PIN must be 6 digits.', maxlength: 'PIN must be 6 digits.' },
      phone: { required: 'Phone number is required.', digits: 'Enter a valid 10-digit number.', minlength: 'Phone must be 10 digits.', maxlength: 'Phone must be 10 digits.' },
    },
    errorClass: 'text-danger small',
    errorElement: 'span',
    highlight: el => $(el).addClass('is-invalid'),
    unhighlight: el => $(el).removeClass('is-invalid'),
    submitHandler: () => {}, // handled by main.js AJAX
  });

  // ── Admin product form ──────────────────────────────────────────
  $('#admin-product-form').validate({
    rules: {
      name: { required: true },
      description: { required: true, minlength: 10 },
      price: { required: true, number: true, min: 0 },
      stock: { required: true, digits: true, min: 0 },
      category: { required: true },
    },
    errorClass: 'text-danger small',
    errorElement: 'span',
    highlight: el => $(el).addClass('is-invalid'),
    unhighlight: el => $(el).removeClass('is-invalid'),
  });

});