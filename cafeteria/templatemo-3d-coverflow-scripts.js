/*

TemplateMo 595 3d coverflow

https://templatemo.com/tm-595-3d-coverflow

*/

// JavaScript Document

// ===============================
// 🍴 RD Cafeteria Coverflow Script
// ===============================

// Mobile menu toggle
const menuToggle = document.getElementById('menuToggle');
const mainMenu = document.getElementById('mainMenu');

menuToggle.addEventListener('click', () => {
  menuToggle.classList.toggle('active');
  mainMenu.classList.toggle('active');
});

// Close mobile menu when clicking a menu item
document.querySelectorAll('.menu-item:not(.external)').forEach(item => {
  item.addEventListener('click', () => {
    menuToggle.classList.remove('active');
    mainMenu.classList.remove('active');
  });
});

// ===============================
// 🎡 Coverflow Logic
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('.coverflow-container').forEach((container, sectionIndex) => {

    // References
    const items = container.querySelectorAll('.coverflow-item');
    const dotsContainer = container.querySelector('.dots-container');
    const playPauseBtn = container.querySelector('.play-pause-button');
    const playIcon = playPauseBtn.querySelector('.play-icon');
    const pauseIcon = playPauseBtn.querySelector('.pause-icon');
    const prevButton = container.querySelector('.nav-button.prev');
    const nextButton = container.querySelector('.nav-button.next');
    const section = container.closest('.section');
    const titleEl = section.querySelector('h2');
    const descEl = section.querySelector('p');

    // ✅ Constant Titles & Descriptions for each section
    const sectionInfo = [
      { title: "Veg Menu", description: "Delicious vegetarian dishes made with fresh and healthy ingredients." },
      { title: "Non-Veg Menu", description: "Savory non-vegetarian meals prepared with authentic flavors." },
      { title: "Snacks & Beverages", description: "Crunchy snacks and refreshing drinks for every mood." },
      { title: "Breakfast", description: "Start your day with our energizing and tasty breakfast options." },
      { title: "Lunch", description: "Wholesome and satisfying lunch meals that keep you full and happy." }
    ];

    // Apply constant title and description based on section order
    if (sectionInfo[sectionIndex]) {
      titleEl.textContent = sectionInfo[sectionIndex].title;
      descEl.textContent = sectionInfo[sectionIndex].description;
    }

    let currentIndex = 0;
    let isAnimating = false;
    let autoplayInterval = null;
    let isPlaying = true;

    // Create Dots
    dotsContainer.innerHTML = "";
    items.forEach((_, index) => {
      const dot = document.createElement("div");
      dot.className = "dot";
      dot.onclick = () => goToIndex(index);
      dotsContainer.appendChild(dot);
    });
    const dots = dotsContainer.querySelectorAll(".dot");

    // 🌀 Update Coverflow visuals
    function updateCoverflow() {
      if (isAnimating) return;
      isAnimating = true;

      items.forEach((item, index) => {
        let offset = index - currentIndex;
        if (offset > items.length / 2) offset -= items.length;
        else if (offset < -items.length / 2) offset += items.length;

        const absOffset = Math.abs(offset);
        const sign = Math.sign(offset);
        let translateX = offset * 220;
        let translateZ = -absOffset * 200;
        let rotateY = -sign * Math.min(absOffset * 60, 60);
        let opacity = 1 - absOffset * 0.2;
        let scale = 1 - absOffset * 0.1;

        // ✅ Mobile adjustment: show only one side image
        if (window.innerWidth <= 768) {
          if (absOffset > 1) {
            opacity = 0;
            translateX = sign * 600;
          }
        } else {
          if (absOffset > 3) {
            opacity = 0;
            translateX = sign * 800;
          }
        }

        item.style.transform = `
          translateX(${translateX}px)
          translateZ(${translateZ}px)
          rotateY(${rotateY}deg)
          scale(${scale})
        `;
        item.style.opacity = opacity;
        item.style.zIndex = 100 - absOffset;
        item.classList.toggle("active", index === currentIndex);
      });

      dots.forEach((dot, index) => {
        dot.classList.toggle("active", index === currentIndex);
      });

      setTimeout(() => (isAnimating = false), 600);
    }

    // Navigation
    function navigate(direction) {
      if (isAnimating) return;
      currentIndex = (currentIndex + direction + items.length) % items.length;
      updateCoverflow();
    }

    function goToIndex(index) {
      if (isAnimating || index === currentIndex) return;
      currentIndex = index;
      updateCoverflow();
    }

    // Autoplay
    function startAutoplay() {
      autoplayInterval = setInterval(() => navigate(1), 4000);
      isPlaying = true;
      playIcon.style.display = "none";
      pauseIcon.style.display = "block";
    }

    function stopAutoplay() {
      clearInterval(autoplayInterval);
      autoplayInterval = null;
      isPlaying = false;
      playIcon.style.display = "block";
      pauseIcon.style.display = "none";
    }

    function toggleAutoplay() {
      if (isPlaying) stopAutoplay();
      else startAutoplay();
    }

    // Button Events
    prevButton.addEventListener("click", () => { navigate(-1); stopAutoplay(); });
    nextButton.addEventListener("click", () => { navigate(1); stopAutoplay(); });
    dots.forEach(dot => dot.addEventListener("click", stopAutoplay));
    playPauseBtn.addEventListener("click", toggleAutoplay);

    // Swipe for mobile
    let touchStartX = 0;
    container.addEventListener("touchstart", (e) => {
      touchStartX = e.touches[0].clientX;
    });
    container.addEventListener("touchend", (e) => {
      const diffX = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(diffX) > 50) {
        diffX > 0 ? navigate(-1) : navigate(1);
        stopAutoplay();
      }
    });

    // Reflection
    items.forEach((item) => {
      const img = item.querySelector("img");
      const reflection = item.querySelector(".reflection");
      img.onload = () => {
        reflection.style.backgroundImage = `url(${img.src})`;
        reflection.style.backgroundSize = "cover";
        reflection.style.backgroundPosition = "center";
      };
    });

    // Initialize
    updateCoverflow();
    startAutoplay();
  });
});

// Handle class updates on resize
window.addEventListener("resize", updateCoverflowClasses);
updateCoverflowClasses();

function updateCoverflowClasses() {
  const items = document.querySelectorAll(".coverflow-item");
  const activeIndex = Array.from(items).findIndex(item => item.classList.contains("active"));

  // Remove old left/right
  items.forEach(item => item.classList.remove("left", "right"));

  // Assign neighbors
  if (activeIndex > 0) items[activeIndex - 1].classList.add("left");
  if (activeIndex < items.length - 1) items[activeIndex + 1].classList.add("right");

  // Keep left/right visible even on mobile
  items.forEach(item => {
    if (item.classList.contains("left") || item.classList.contains("right") || item.classList.contains("active")) {
      item.style.opacity = "1";
      item.style.pointerEvents = "auto";
    } else {
      item.style.opacity = "0";
      item.style.pointerEvents = "none";
    }
  });
}


