/****************************************************
 * contact.js — Contact page only
 * - Shows success message (front-end simulation)
 ****************************************************/

document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.getElementById("contactForm");
  const formSuccess = document.getElementById("formSuccess");

  if (!contactForm || !formSuccess) return;

  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    contactForm.reset();
    formSuccess.classList.add("show");
  });
});