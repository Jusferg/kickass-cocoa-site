console.log("netlifyIdentity exists?", !!window.netlifyIdentity);

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector('form[name="kac-register"]');
  if (!form || !window.netlifyIdentity) return;

  const emailEl = document.getElementById("regEmail");
  const passwordEl = document.getElementById("password");
  const confirmEl = document.getElementById("passwordConfirm");
  const firstNameEl = document.getElementById("firstName");
  const lastNameEl = document.getElementById("lastName");

  window.netlifyIdentity.init();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = emailEl?.value.trim();
    const password = passwordEl?.value || "";
    const confirm = confirmEl?.value || "";
    const firstName = firstNameEl?.value.trim() || "";
    const lastName = lastNameEl?.value.trim() || "";

    if (!email || !password || !confirm || !firstName || !lastName) {
      alert("Please complete all required fields.");
      return;
    }

    if (password !== confirm) {
      alert("Passwords do not match.");
      return;
    }

    try {
      await window.netlifyIdentity.signup(email, password, {
        full_name: `${firstName} ${lastName}`.trim(),
        first_name: firstName,
        last_name: lastName
      });

      localStorage.setItem("kac_prefill_email", email);
      alert("Account created. Please check your email to confirm your account.");
      window.location.href = "login.html";
    } catch (error) {
      alert(error.message || "Signup failed. Please try again.");
    }
  });
});