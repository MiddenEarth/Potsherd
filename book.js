//********************************************************************************//
//Elements//
//*******************************************************************************//
// Button elements
const prevBtn = document.getElementById("Prev-btn");
const nextBtn = document.getElementById("Next-btn");
const pg1 = document.getElementById("Button-1");
const pg2 = document.getElementById("Button-2");
const pg3 = document.getElementById("Button-3");
const pg4 = document.getElementById("Button-4");

// page elements
const pages = [
    document.getElementById("p1"),
    document.getElementById("p2"),
    document.getElementById("p3"),
    document.getElementById("p4")
];
//********************************************************************************//
//login//
//*******************************************************************************//
const loginButton = document.getElementById('loginbutton');
const targetDiv = document.getElementById('login');
const username = document.getElementById('username');
const password = document.getElementById('password');
loginButton.addEventListener('click', () => {
    if (username.value === 'root' && password.value === 'root') {
        alert('Login successful!');
                targetDiv.classList.add('hidden');
                
    } else {
        alert('Invalid username or password');
    }

});
//********************************************************************************//
//coordinate input//
//*******************************************************************************//
const el = document.getElementById('import-input');

const NUM_PREFIX = /^\d+\.\s/;
const pairDone = /^-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?[ ;]$/;

// Give every line a "N. " prefix, keeping the caret where it was
function renumber() {
  const pos = el.selectionStart;
  const before = el.value.slice(0, pos);
  const lines = el.value.split('\n');
  const lineIdx = before.split('\n').length - 1;
  const colInLine = pos - (before.lastIndexOf('\n') + 1);
  const colFromEnd = lines[lineIdx].length - colInLine;

  const out = lines.map((l, i) => `${i + 1}. ${l.replace(NUM_PREFIX, '')}`);
  const next = out.join('\n');
  if (next === el.value) return;

  el.value = next;
  const newPos =
    out.slice(0, lineIdx).reduce((n, l) => n + l.length + 1, 0) +
    out[lineIdx].length - colFromEnd;
  el.setSelectionRange(newPos, newPos);
}

el.addEventListener('input', (e) => {
  // finished a coordinate pair -> jump to a new line
  if (e.inputType === 'insertText') {
    const pos = el.selectionStart;
    const lastLine = el.value.slice(0, pos).split('\n').pop().replace(NUM_PREFIX, '');
    if (pairDone.test(lastLine)) {
      el.setRangeText('\n', pos - 1, pos, 'end');
    }
  }
  renumber();
});

// Backspace at the start of a line's content removes the line break
// instead of chewing into the "N. " prefix
el.addEventListener('keydown', (e) => {
  if (e.key !== 'Backspace' || el.selectionStart !== el.selectionEnd) return;
  const pos = el.selectionStart;
  const lineStart = el.value.lastIndexOf('\n', pos - 1) + 1;
  const prefix = el.value.slice(lineStart).match(NUM_PREFIX);
  if (prefix && pos === lineStart + prefix[0].length && lineStart > 0) {
    e.preventDefault();
    el.setRangeText('', lineStart - 1, pos, 'end');
    renumber();
  }
});

// Use this when importing: returns [[lat, lng], ...]
function getCoordinates() {
  return el.value
    .split('\n')
    .map(l => l.replace(NUM_PREFIX, '').trim())
    .filter(Boolean)
    .map(l => l.split(/\s*,\s*/).map(Number));
}
//********************************************************************************//
//Page state//
//*******************************************************************************//


//establish open book
let currentPage = 0;
function openBook() {
    book.classList.add("open");
    book.classList.remove("end");

}
// establish closed book
function closeBook() {
    book.classList.remove("open", "end");
}
//establish closed book at end
function closeBookAtEnd() {
    book.classList.remove("open");
    book.classList.add("end");
}
// Update button states based on current page
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

//********************************************************************************//
//Page buttons//
//*******************************************************************************//



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
// Page 1 buttons
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
// Page 2 buttons
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
//  Page 3 buttons
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
// Page 4 buttons
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
