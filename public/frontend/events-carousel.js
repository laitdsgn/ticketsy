document.addEventListener("DOMContentLoaded", () => {
  const gallery = document.querySelector(".gallery");
  const previousBtn = document.getElementById("previous");
  const nextBtn = document.getElementById("next");
  const eventBtns = document.getElementsByClassName("event-btn");
  const buyForm = document.querySelector(".buy-form");
  const idValueForm = document.getElementById("id-v");
  const totalSeat = document.getElementById("totalSeats");
  const closeBuy = document.getElementById("close-buy");
  let currentIndex = 0;
  let events = [];

  async function FetchAllPosts() {
    const response = await fetch("/events/get-events");
    const data = await response.json();
    renderEvents(data);
    events = Array.from(gallery.querySelectorAll(".event"));
    updateCarousel();
  }

  function renderEvents(eventsData) {
    gallery.innerHTML = "";
    eventsData.forEach((ev) => {
      const eventDiv = document.createElement("div");
      eventDiv.className = "event";
      eventDiv.innerHTML = `
        <img class="event-img" src="${
          ev.thumbnail || "/demo.jpg"
        }" alt="Event thumbnail">
        <div class="event-content">
          <div class="event-header">
            <h2 class="event-title">${ev.title || ""}</h2>
            <span class="event-date">${
              ev.date ? new Date(ev.date).toLocaleDateString("pl-PL") : ""
            }</span>
          </div>
          <p class="event-description">${ev.description || ""}</p>
          <div class="event-footer">
            <span class="price-tag">${ev.price ? ev.price + " zł" : ""}</span>
            <div class="event-details">
              <span class="seats-count">${
                ev.totalSeats ? ev.totalSeats + " miejsc" : ""
              }</span>
              <button class="event-btn" data-event-id="${
                ev._id
              }" data-total-seats="${ev.totalSeats}">Kup bilet</button>
            </div>
          </div>
        </div>
      `;
      gallery.appendChild(eventDiv);
      for (let eventBtn of eventBtns) {
        eventBtn.addEventListener("click", (e) => {
          const eventId = eventBtn.getAttribute("data-event-id");
          const totalSeatsValue = eventBtn.getAttribute("data-total-seats");

          buyForm.style.display = "block";
          idValueForm.value = eventId;
          totalSeat.min = 1;
          totalSeats.max = totalSeatsValue;
        });
      }
    });
  }

  FetchAllPosts();

  function updateCarousel() {
    const totalEvents = events.length;
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

  previousBtn.addEventListener("click", () => {
    if (events.length === 0) return;
    currentIndex = (currentIndex - 1 + events.length) % events.length;
    updateCarousel();
  });

  nextBtn.addEventListener("click", () => {
    if (events.length === 0) return;
    currentIndex = (currentIndex + 1) % events.length;
    updateCarousel();
  });
  closeBuy.addEventListener("click", () => {
    buyForm.style.display = "none";
  });
});
