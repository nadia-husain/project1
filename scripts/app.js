const ALL_IMAGES = [
  { name: 'kkslider',   image: '../../images/kkslider.png' },
  { name: 'celeste',    image: '../../images/celeste.png' },
  { name: 'timmytommy', image: '../../images/timmy-tommy.png' },
  { name: 'reese',      image: '../../images/reese.png' },
  { name: 'gulliver',   image: '../../images/gulliver.png' },
  { name: 'mabel',      image: '../../images/mabel.png' },
  { name: 'isabelle',   image: '../../images/isabelle.png' },
  { name: 'tom_nook',   image: '../../images/rover.png' },
  { name: 'blathers',   image: '../../images/blathers.png' },
  { name: 'flick',      image: '../../images/wisp.png' },
  { name: 'cj',         image: '../../images/brewster.png' },
  { name: 'kicks',      image: '../../images/kicks.png' },
];

const DIFFICULTY = {
  easy:   { pairs: 6,  timeLimit: 30,  gridClass: 'grid-easy'},
  medium: { pairs: 8,  timeLimit: 60,  gridClass: 'grid-medium'},
  hard:   { pairs: 12, timeLimit: 90, gridClass: 'grid-hard'},
};

let interval = null;

function showModal(icon, title, message, onClose) {
  document.getElementById('modal-icon').textContent    = icon;
  document.getElementById('modal-title').textContent   = title;
  document.getElementById('modal-message').textContent = message;

  const overlay = document.getElementById('modal-overlay');
  const btn     = document.getElementById('modal-btn');

  overlay.classList.add('show');

  const close = () => {
    overlay.classList.remove('show');
    btn.removeEventListener('click', close);
    if (onClose) onClose();
  };

  btn.addEventListener('click', close);
}

function startGame(difficulty) {
  document.getElementById('difficulty-screen').style.display = 'none';
  document.getElementById('game-screen').style.display = 'block';

  init(difficulty);
}

function goToMenu() {
  clearInterval(interval);
  interval = null;

  document.getElementById('game-screen').style.display = 'none';
  document.getElementById('difficulty-screen').style.display = 'flex';
}

function init(difficulty) {
  const config    = DIFFICULTY[difficulty];
  const grid      = document.querySelector('.outer-grid');
  const frontBox      = document.querySelector('.front-box');
  const timeValue = document.getElementById('timer');

  clearInterval(interval);

  grid.className = 'outer-grid ' + config.gridClass;

  const baseImages = ALL_IMAGES.slice(0, config.pairs);
  let images = [...baseImages, ...baseImages];

  const shuffleArray = arr => arr.sort(() => Math.random() - 0.5);

  shuffleArray(images);

  function createCard(image) {
    const mainBox  = document.createElement('div');
    mainBox.classList.add('main-box', image.name);

    const backBox  = document.createElement('div');
    backBox.classList.add('back-box');
    backBox.innerHTML = `<img src="${image.image}" alt="${image.name}">`;

    const frontBox = document.createElement('div');
    frontBox.classList.add('front-box');

    mainBox.appendChild(backBox);
    mainBox.appendChild(frontBox);

    return mainBox;
  }

  function addCardsToGrid() {
    grid.innerHTML = '';
    images.forEach(image => grid.appendChild(createCard(image)));
  }

  let seconds = config.timeLimit;
  let s = seconds < 10 ? `0${seconds}` : seconds;

  timeValue.innerHTML = `<span>Timer:&nbsp;&nbsp;</span>${s}`;

  function timeGenerator() {
    seconds -= 1;
    if (seconds < 0) {
      clearInterval(interval);
      locked = true;
      showModal('😢', 'Time\'s Up!', 'Better luck next time!');
      return;
    }
    let s = seconds < 10 ? `0${seconds}` : seconds;
    timeValue.innerHTML = `<span>Timer:&nbsp;&nbsp;</span>${s}`;
  }

  interval = setInterval(timeGenerator, 1000);

  let firstSelection = '', secondSelection = '';
  let count = 0, winCounter = 0;
  let temp1 = '', temp2 = '';
  let locked = false;

  function flipCard(event) {
    const clickedCard = event.currentTarget;

    if (locked) return;
    if (clickedCard === temp1) return;
    if (clickedCard.classList.contains('flip')) return;

    count++;
    if (count < 3) {
      clickedCard.classList.add('flip');
      if (count === 1) {
        temp1 = clickedCard;
        firstSelection = clickedCard.classList[1];
      } else if (count === 2) {
        temp2 = clickedCard;
        secondSelection = clickedCard.classList[1];
        if (firstSelection !== secondSelection) {
          locked = true;

          setTimeout(() => {
            temp1.classList.add('shake');
            temp2.classList.add('shake');
            temp1.classList.remove('flip');
            temp2.classList.remove('flip');

            setTimeout(() => {
              temp1.classList.remove('shake');
              temp2.classList.remove('shake');
              count = 0;
              locked = false;
            }, 400);
          }, 500);
        } else {
          count = 0;
          winCounter++;
          if (winCounter === config.pairs) {
            clearInterval(interval);
            showModal('🎉', 'You Won!', `You finished in ${config.timeLimit - seconds} seconds!`);
          }
        }
      }
    }
  }

  function bindClickToCards() {
    document.querySelectorAll('.main-box').forEach(card => {
      card.addEventListener('click', flipCard);
    });
  }

  function resetGrid() {
    clearInterval(interval);
    grid.classList.remove('game-over'); 

    seconds = config.timeLimit; count = 0; winCounter = 0;
    firstSelection = ''; secondSelection = '';
    temp1 = ''; temp2 = '';
    locked = false;

    shuffleArray(images);
    addCardsToGrid();
    bindClickToCards();
    
    let rs = seconds < 10 ? `0${seconds}` : seconds;
    timeValue.innerHTML = `<span>Timer:&nbsp;&nbsp;</span>${rs}`;
    interval = setInterval(timeGenerator, 1000);
  }

  const resetBtn = document.querySelector('.reset');
  resetBtn.replaceWith(resetBtn.cloneNode(true));
  document.querySelector('.reset').addEventListener('click', resetGrid);

  addCardsToGrid();
  bindClickToCards();
}