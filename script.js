const pillars = document.querySelectorAll(".pillar");

pillars.forEach((pillar) => {
  const button = pillar.querySelector(".pillar-toggle");

  button.addEventListener("click", () => {
    pillars.forEach((otherPillar) => {
      if (otherPillar !== pillar) {
        otherPillar.classList.remove("open");
      }
    });

    pillar.classList.toggle("open");
  });
});

document.addEventListener("click", (event) => {
  const clickedInsidePillar = event.target.closest(".pillar");

  if (!clickedInsidePillar) {
    pillars.forEach((pillar) => pillar.classList.remove("open"));
  }
});