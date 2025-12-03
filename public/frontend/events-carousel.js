document.addEventListener("DOMContentLoaded", () => {
  const gallery = document.querySelector(".gallery");
  const previousBtn = document.getElementById("previous");
  const nextBtn = document.getElementById("next");

  let currentIndex = 0;
  const events = gallery.querySelectorAll(".event");
  const totalEvents = events.length;

  updateCarousel();

  previousBtn.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + totalEvents) % totalEvents;
    updateCarousel();
  });

  nextBtn.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % totalEvents;
    updateCarousel();
  });

  function updateCarousel() {
    events.forEach((event, index) => {
      event.classList.remove("active", "prev", "next", "hidden");

      let position = index - currentIndex;

      if (position < -Math.floor(totalEvents / 2)) {
        position += totalEvents;
      } else if (position > Math.floor(totalEvents / 2)) {
        position -= totalEvents;
      }

      if (position === 0) {
        event.classList.add("active");
      } else if (position === -1) {
        event.classList.add("prev");
      } else if (position === 1) {
        event.classList.add("next");
      } else {
        event.classList.add("hidden");
      }
    });
  }
});
