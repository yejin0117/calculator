(function () {
  const resultEl = document.getElementById('result');
  const exprEl = document.getElementById('expression');
  const historyList = document.getElementById('historyList');
  const historyToggle = document.getElementById('historyToggle');
  const historyArrow = document.getElementById('historyArrow');

  const OP_SYMBOLS = { '+': '+', '-': '−', '*': '×', '/': '÷' };
  const MAX_HISTORY = 20;

  let current = '0'; // 현재 입력 중인 숫자 (문자열)
  let firstOperand = null; // 첫 번째 숫자
  let operator = null; // 선택된 연산자 ('+','-','*','/')
  let resultShown = false; // 방금 '='로 결과를 보여준 상태인지
  let history = [];

  // 표시 갱신
  function updateDisplay() {
    resultEl.textContent = current;
    if (operator && firstOperand !== null) {
      exprEl.textContent = `${formatNum(firstOperand)} ${OP_SYMBOLS[operator]}`;
    } else {
      exprEl.textContent = '';
    }
  }

  function formatNum(n) {
    if (!isFinite(n)) return 'Error';
    return Number.isInteger(n) ? String(n) : String(parseFloat(n.toFixed(6)));
  }

  // 숫자 입력
  function inputDigit(d) {
    if (resultShown) {
      current = d;
      resultShown = false;
      return;
    }
    if (current === '0' || current === "00") {
      current = d;
    } else {
      current += d;
    }
  }

  function inputDecimal() {
    if (resultShown) {
      current = '0.';
      resultShown = false;
      return;
    }
    if (!current.includes('.')) current += '.';
  }

  // 연산자 선택 (숫자 1개 + 연산자 1개만)
  function chooseOperator(op) {
    if (resultShown) {
      firstOperand = parseFloat(current);
      operator = op;
      current = '0';
      resultShown = false;
      updateDisplay();
      return;
    }

    if (operator !== null) {
      if (current === '0') {
        operator = op;
      }
      updateDisplay();
      return;
    }

    firstOperand = parseFloat(current);
    operator = op;
    current = '0';
    updateDisplay();
  }

  // 결과 계산 
  function calculate() {
    if (operator === null || firstOperand === null) return;

    const second = parseFloat(current);
    let result;

    switch (operator) {
      case '+':
        result = firstOperand + second;
        break;
      case '-':
        result = firstOperand - second;
        break;
      case '*':
        result = firstOperand * second;
        break;
      case '/':
        result = second === 0? Infinity : firstOperand / second;
        break;
    }

    const exprText = `${formatNum(firstOperand)} ${OP_SYMBOLS[operator]} ${formatNum(second)}`;

    if (!isFinite(result)) {
      exprEl.textContent = `${exprText} =`;
      resultEl.textContent = 'Error';
      current = '0';
      operator = null;
      firstOperand = null;
      resultShown = true;
      return;
    }

    result = Math.round(result * 1e8) / 1e8;
    current = formatNum(result);

    exprEl.textContent = `${exprText} =`;
    resultEl.textContent = current;

    addHistory(exprText, current);

    operator = null;
    firstOperand = null;
    resultShown = true;
  }

  // 초기화 
  function clearAll() {
    current = '0';
    operator = null;
    firstOperand = null;
    resultShown = false;
    updateDisplay();
  }

  function clearEntry() {
    current = '0';
    resultShown = false;
    updateDisplay();
  }

  // 마지막 입력 숫자 한 자리 지우기(백스페이스) 
  function backspace() {
    if (resultShown) return;

    if (current.length <= 1 || (current.length === 2 && current.startsWith('-'))) {
      current = '0';
    } else {
      current = current.slice(0, -1);
    }
    updateDisplay();
  }

  // 연산 기록 저장/조회 
  function addHistory(expr, result) {
    history.unshift({ expr, result });
    if (history.length > MAX_HISTORY) history.pop();
    renderHistory();
  }

  function renderHistory() {
    historyList.innerHTML = '';

    if (history.length === 0) {
      const li = document.createElement('li');
      li.className = 'calc__history-empty';
      li.textContent = '아직 계산 기록이 없어요';
      historyList.appendChild(li);
      return;
    }

    history.forEach((h) => {
      const li = document.createElement('li');
      li.className = 'calc__history-item';

      const exprSpan = document.createElement('span');
      exprSpan.className = 'calc__history-expr';
      exprSpan.textContent = h.expr;

      const resultSpan = document.createElement('span');
      resultSpan.className = 'calc__history-result';
      resultSpan.textContent = `= ${h.result}`;

      li.appendChild(exprSpan);
      li.appendChild(resultSpan);
      historyList.appendChild(li);
    });
  }

  // ---- 버튼 이벤트 바인딩 ----
  document.querySelectorAll('.key').forEach((btn) => {
    if (btn.classList.contains('key--inactive')) return; // 과제 범위 밖 버튼

    const digit = btn.dataset.digit;
    const op = btn.dataset.op;
    const action = btn.dataset.action;

    if (digit !== undefined) {
      btn.addEventListener('click', () => {
        inputDigit(digit);
        updateDisplay();
      });
    } else if (op !== undefined) {
      btn.addEventListener('click', () => chooseOperator(op));
    } else if (action === 'decimal') {
      btn.addEventListener('click', () => {
        inputDecimal();
        updateDisplay();
      });
    } else if (action === 'equals') {
      btn.addEventListener('click', calculate);
    } else if (action === 'clear') {
      btn.addEventListener('click', clearAll);
    } else if (action === 'clear-entry') {
      btn.addEventListener('click', clearEntry);
    } else if (action === 'backspace') {
      btn.addEventListener('click', backspace);
    }
  });

  historyToggle.addEventListener('click', () => {
    const isOpen = historyList.classList.toggle('is-open');
    historyArrow.textContent = isOpen ? '\u25B4' : '\u25BE';
  });

  updateDisplay();
  renderHistory();
})();