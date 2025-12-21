document.addEventListener("DOMContentLoaded", () => {
  const pass = document.getElementById("password");
  const email = document.getElementById("email");
  const form = document.querySelector("form");

  function validateEmail() {
    const value = email.value;
    const errorEl = document.getElementById("email-error");

    if (!value.includes("@") || !value.includes(".")) {
      email.classList.add("is-invalid");
      email.classList.remove("is-valid");
      errorEl.textContent = "Email musi zawierać @ i .";
      errorEl.style.display = "block";
      return false;
    } else {
      email.classList.remove("is-invalid");
      email.classList.add("is-valid");
      errorEl.style.display = "none";
      return true;
    }
  }

  function validatePassword() {
    const value = pass.value;
    const errorEl = document.getElementById("password-error");
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

    if (!value.match(regex)) {
      pass.classList.add("is-invalid");
      pass.classList.remove("is-valid");
      errorEl.textContent =
        "Hasło musi mieć min. 8 znaków, wielką literę, cyfrę i znak specjalny";
      errorEl.style.display = "block";
      return false;
    } else {
      pass.classList.remove("is-invalid");
      pass.classList.add("is-valid");
      errorEl.style.display = "none";
      return true;
    }
  }

  email.addEventListener("input", validateEmail);
  pass.addEventListener("input", validatePassword);

  form.addEventListener("submit", (e) => {
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    const isConfirmValid = validateConfirmPassword();

    if (!isEmailValid || !isPasswordValid || !isConfirmValid) {
      e.preventDefault();
    }
  });
});
