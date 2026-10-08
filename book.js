

const prevBtn = document.getElementById("Prev-btn");
const nextBtn = document.getElementById("Next-btn");
const pg1 = document.getElementById("Button-1");
const pg2 = document.getElementById("Button-2");
const pg3 = document.getElementById("Button-3");
const pg4 = document.getElementById("Button-4");

const pages = [
    document.getElementById("p1"),
    document.getElementById("p2"),
    document.getElementById("p3"),
    document.getElementById("p4")
];

let currentPage = 0;
function openBook() {
book.classList.add("open");
book.classList.remove("end");
    
}
function closeBook() {
   book.classList.remove("open", "end");   
}
function closeBookAtEnd() {
  book.classList.remove("open");
  book.classList.add("end");
}

function updateButtons() {
  prevBtn.disabled = currentPage === 0;
  nextBtn.disabled = currentPage === pages.length;

  if (currentPage === 0) {
    closeBook();
  } else if (currentPage === pages.length) {
    closeBookAtEnd();
  } else {
    openBook();
  }
}

// Set initial page order
function setPageOrder() {
    pages.forEach((page, index) => {
        if (index < currentPage) {
            page.style.zIndex = index + 1;
        } else {
            page.style.zIndex = pages.length - index;
        }
    });
}

// Update buttons


// Next page
nextBtn.addEventListener("click", () => {
    if (currentPage < pages.length) {
        pages[currentPage].classList.add("flipped");
        currentPage++;

        setPageOrder();
        updateButtons();
    }
});

// Previous page
prevBtn.addEventListener("click", () => {
    if (currentPage > 0) {
        currentPage--;

        pages[currentPage].classList.remove("flipped");

        setPageOrder();
        updateButtons();
    }
});
pg1.addEventListener("click", () => {
    currentPage = 1;
    pages.forEach((page, index) => {
        if (index < currentPage) {
            page.classList.add("flipped");
        } else {
            page.classList.remove("flipped");
        }
    });
    setPageOrder();
    updateButtons();
});

pg2.addEventListener("click", () => {
    currentPage = 2;
    pages.forEach((page, index) => {
        if (index < currentPage) {
            page.classList.add("flipped");
        } else {
            page.classList.remove("flipped");
        }
    });
    setPageOrder();
    updateButtons();
});

pg3.addEventListener("click", () => {
    currentPage = 3;
    pages.forEach((page, index) => {
        if (index < currentPage) {
            page.classList.add("flipped");
        } else {
            page.classList.remove("flipped");
        }
    });
    setPageOrder();
    updateButtons();
});

pg4.addEventListener("click", () => {
    currentPage = 4;
    pages.forEach((page, index) => {
        if (index < currentPage) {
            page.classList.add("flipped");
        } else {
            page.classList.remove("flipped");
        }
    });
    setPageOrder();
    updateButtons();
});

// Initialize
setPageOrder();
updateButtons();
setTimeout(() => map.invalidateSize(), 850); // after the 0.8s transition