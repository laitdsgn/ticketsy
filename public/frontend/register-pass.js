document.addEventListener("DOMContentLoaded", function () {
  const pass = document.getElementById("password");
  const passRep = document.getElementById("confirm-password");

  passRep.addEventListener("input", () => {
    if (pass.value != passRep.value) {
      passRep.classList.add("is-invalid");
      passRep.classList.remove("is-valid");
    } else {
      passRep.classList.remove("is-invalid");
      passRep.classList.add("is-valid");
    }
  });
});
