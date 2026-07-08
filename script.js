const pillars = document.querySelectorAll(".pillar");

pillars.forEach((pillar) => {
  const button = pillar.querySelector(".pillar-toggle");
  if (!button) return;

  button.addEventListener("click", () => {
    pillars.forEach((otherPillar) => {
      if (otherPillar !== pillar) {
        otherPillar.classList.remove("open");
      }
    });

    pillar.classList.toggle("open");
  });
});
