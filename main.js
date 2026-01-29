class LottoMachine extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.ballContainer = this.shadowRoot.querySelector('.lotto-machine');
    this.resultsPanel = this.shadowRoot.querySelector('.results-panel');
    this.drawButton = this.shadowRoot.querySelector('button');

    this.prefillMachine();
    this.drawButton.addEventListener('click', () => this.draw());
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .lotto-machine {
          position: relative;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, #333 0%, #111 100%);
          border: 10px solid #444;
          box-shadow: inset 0 0 20px #000, 0 0 30px #000;
          overflow: hidden;
        }

        .ball {
          position: absolute;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 1.2em;
          font-weight: bold;
          color: #fff;
          box-shadow: inset -5px -5px 10px rgba(0,0,0,0.3);
          animation-play-state: paused;
          animation-duration: 3s;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
          opacity: 1;
          transition: opacity 2s ease-out;
        }
        
        .mixing .ball {
            animation-play-state: running;
        }

        .fading-out .ball {
            opacity: 0;
        }

        /* Ball Colors */
        .color-1 { background: radial-gradient(circle, #f8a, #c14); }
        .color-2 { background: radial-gradient(circle, #8fa, #1c4); }
        .color-3 { background: radial-gradient(circle, #8af, #14c); }
        .color-4 { background: radial-gradient(circle, #fa8, #c41); }
        .color-5 { background: radial-gradient(circle, #af8, #4c1); }

        .powerball {
            background: radial-gradient(circle, #ffcc00, #ff9900) !important;
            color: #000 !important;
            border: 2px solid #fff;
        }

        button {
          background-color: #4CAF50;
          border: none;
          color: white;
          padding: 15px 32px;
          text-align: center;
          font-size: 16px;
          cursor: pointer;
          border-radius: 8px;
          transition: background-color 0.3s, transform 0.1s;
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        }

        button:hover { background-color: #45a049; }
        button:active { transform: scale(0.98); }
        button:disabled { background-color: #555; cursor: not-allowed; }

        .results-panel {
          background-color: #222;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 10px 20px rgba(0,0,0,0.5);
          width: 90%;
          max-width: 450px;
          text-align: center;
          position: absolute;
          bottom: -200px; /* Start hidden */
          transition: bottom 0.5s ease-in-out;
          z-index: 100;
        }

        .results-panel.active {
          bottom: 20px;
        }

        .results-title {
            margin: 0 0 15px 0;
            font-size: 1.5em;
            color: #4CAF50;
        }
        
        .result-balls {
            display: flex;
            justify-content: center;
            gap: 10px;
        }

        @keyframes move1 { 0%, 100% { transform: translate(50px, 150px); } 25% { transform: translate(150px, 250px); } 50% { transform: translate(250px, 100px); } 75% { transform: translate(100px, 50px); } }
        @keyframes move2 { 0%, 100% { transform: translate(200px, 50px); } 25% { transform: translate(300px, 200px); } 50% { transform: translate(100px, 300px); } 75% { transform: translate(50px, 150px); } }
        @keyframes move3 { 0%, 100% { transform: translate(300px, 300px); } 25% { transform: translate(50px, 250px); } 50% { transform: translate(150px, 50px); } 75% { transform: translate(250px, 200px); } }
        @keyframes move4 { 0%, 100% { transform: translate(150px, 50px); } 25% { transform: translate(250px, 250px); } 50% { transform: translate(50px, 150px); } 75% { transform: translate(200px, 300px); } }

      </style>
      <div class="lotto-machine"></div>
      <button>Draw Numbers</button>
      <div class="results-panel">
         <h3 class="results-title">Winning Numbers</h3>
         <div class="result-balls"></div>
      </div>
    `;
  }
  
  prefillMachine() {
      const animations = ['move1', 'move2', 'move3', 'move4'];
      this.ballContainer.innerHTML = ''; 
      for (let i = 0; i < 70; i++) {
          const isPowerball = i > 60;
          const number = isPowerball ? Math.floor(Math.random() * 26) + 1 : Math.floor(Math.random() * 69) + 1;
          const ball = this.createBall(number, isPowerball ? 'powerball' : `color-${(i % 5) + 1}`);
          
          ball.style.animationName = animations[i % animations.length];
          ball.style.animationDelay = `${Math.random() * -3}s`;

          this.ballContainer.appendChild(ball);
      }
  }

  draw() {
    this.drawButton.disabled = true;
    this.resultsPanel.classList.remove('active');
    
    this.ballContainer.classList.remove('fading-out');

    this.ballContainer.classList.add('mixing');

    setTimeout(() => {
        this.ballContainer.classList.add('fading-out');
    }, 2000);

    setTimeout(() => {
      this.ballContainer.classList.remove('mixing');
      this.displayResults();
      this.drawButton.disabled = false;
    }, 4000);
  }

  displayResults() {
      const resultBallsContainer = this.shadowRoot.querySelector('.result-balls');
      resultBallsContainer.innerHTML = '';

      const whiteBalls = new Set();
      while (whiteBalls.size < 5) {
        whiteBalls.add(Math.floor(Math.random() * 69) + 1);
      }
      const powerball = Math.floor(Math.random() * 26) + 1;

      const sortedWhiteBalls = Array.from(whiteBalls).sort((a, b) => a - b);

      sortedWhiteBalls.forEach(number => {
          resultBallsContainer.appendChild(this.createResultBall(number, `color-${(number % 5) + 1}`));
      });

      resultBallsContainer.appendChild(this.createResultBall(powerball, 'powerball'));
      this.resultsPanel.classList.add('active');
  }

  createBall(number, colorClass) {
    const ballEl = document.createElement('div');
    ballEl.classList.add('ball', colorClass);
    ballEl.textContent = number;
    return ballEl;
  }

  createResultBall(number, colorClass) {
    const ball = this.createBall(number, colorClass);
    ball.style.position = 'relative';
    ball.style.animation = 'none';
    ball.style.opacity = 1;
    return ball;
  }
}

customElements.define('lotto-machine', LottoMachine);
