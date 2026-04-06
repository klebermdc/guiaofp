import { useState } from 'react';

export default function Calculator() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const handleNumberClick = (num: string) => {
    if (waitingForOperand) {
      setDisplay(String(num));
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? String(num) : display + num);
    }
  };

  const handleDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const result = performCalculation(previousValue, inputValue, operation);
      setDisplay(String(result));
      setPreviousValue(result);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const performCalculation = (prev: number, current: number, op: string): number => {
    switch (op) {
      case '+':
        return prev + current;
      case '-':
        return prev - current;
      case '×':
        return prev * current;
      case '÷':
        return current !== 0 ? prev / current : 0;
      default:
        return current;
    }
  };

  const handleEquals = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const result = performCalculation(previousValue, inputValue, operation);
      setDisplay(String(result));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Calculadora</h1>
        
        {/* Display */}
        <div className="bg-gray-900 text-white rounded-lg p-4 mb-6 text-right">
          <div className="text-xs text-gray-400 mb-1 h-5">
            {previousValue !== null && operation ? `${previousValue} ${operation}` : ''}
          </div>
          <div className="text-4xl font-bold break-words">{display}</div>
        </div>

        {/* Button Grid */}
        <div className="grid grid-cols-4 gap-3">
          {/* First Row */}
          <button
            onClick={handleClear}
            className="col-span-2 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition"
          >
            AC
          </button>
          <button
            onClick={handleBackspace}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-4 rounded-lg transition"
          >
            ←
          </button>
          <button
            onClick={() => handleOperation('÷')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition"
          >
            ÷
          </button>

          {/* Numbers and Operations */}
          {[
            ['7', '8', '9', '×'],
            ['4', '5', '6', '-'],
            ['1', '2', '3', '+'],
            ['0', '.', '=', null],
          ].map((row, rowIdx) => (
            <div key={rowIdx} className="contents">
              {row.map((btn) => {
                if (btn === null) return null;
                if (btn === '0') {
                  return (
                    <button
                      key={btn}
                      onClick={() => handleNumberClick(btn)}
                      className="col-span-2 bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 px-4 rounded-lg transition"
                    >
                      {btn}
                    </button>
                  );
                }
                if (btn === '.') {
                  return (
                    <button
                      key={btn}
                      onClick={handleDecimal}
                      className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 px-4 rounded-lg transition"
                    >
                      {btn}
                    </button>
                  );
                }
                if (btn === '=') {
                  return (
                    <button
                      key={btn}
                      onClick={handleEquals}
                      className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition"
                    >
                      {btn}
                    </button>
                  );
                }
                if (['+', '-', '×', '÷'].includes(btn)) {
                  return (
                    <button
                      key={btn}
                      onClick={() => handleOperation(btn)}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition"
                    >
                      {btn}
                    </button>
                  );
                }
                return (
                  <button
                    key={btn}
                    onClick={() => handleNumberClick(btn)}
                    className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 px-4 rounded-lg transition"
                  >
                    {btn}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
