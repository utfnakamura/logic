function m(a, b, c, d, r) {
  const ret = [];
  const digits = [a, b, c, d];
  const operators = ['+', '-', '*', '/'];
  const permutations = permute(digits);

  permutations.forEach((perm) => {
    operators.forEach((o1) => {
      operators.forEach((o2) => {
        operators.forEach((o3) => {
          const expression = `${perm[0]} ${perm[1]} ${o1} ${perm[2]} ${o2} ${perm[3]} ${o3}`;
          try {
            const result = calculateRPN(expression);
            if (result === r) {
              ret.push([perm[0], perm[1], o1, perm[2], o2, perm[3], o3]);
            }
          } catch (e) {
            // 0での除算など、エラーをキャッチして無視する
          }
        });
      });
    });
  });

  return ret;
}

// 数字の全順列を生成する関数
function permute(nums) {
  let result = [];
  
  function backtrack(start = 0) {
    if (start === nums.length) result.push(nums.slice());
    for (let i = start; i < nums.length; i++) {
      [nums[start], nums[i]] = [nums[i], nums[start]];
      backtrack(start + 1);
      [nums[start], nums[i]] = [nums[i], nums[start]];
    }
  }
  
  backtrack();
  return result;
}

// RPN計算関数（前述の関数を再利用）
function calculateRPN(input) {
  const tokens = input.split(/\s+/);
  const stack = [];

  for (const token of tokens) {
    if (!isNaN(parseFloat(token))) {
      stack.push(parseFloat(token));
    } else {
      const b = stack.pop();
      const a = stack.pop();

      switch (token) {
        case '+':
          stack.push(a + b);
          break;
        case '-':
          stack.push(a - b);
          break;
        case '*':
          stack.push(a * b);
          break;
        case '/':
          if (b === 0) throw new Error('Division by zero.');
          stack.push(a / b);
          break;
        default:
          throw new Error('Invalid token.');
      }
    }
  }

  if (stack.length !== 1) throw new Error('Invalid expression.');
  return stack.pop();
}
function convertRPNToInfix(rpn) {
  const tokens = rpn;
  const stack = [];

  const precedence = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2
  };

  tokens.forEach(token => {
    if (!isNaN(parseFloat(token))) {
      stack.push({value: token, prec: 100}); // 数字はそのままで、優先順位は最高とする
    } else {
      const right = stack.pop();
      const left = stack.pop();

      let expr = '';
      if (left.prec < precedence[token]) {
        expr += `(${left.value})`;
      } else {
        expr += left.value;
      }
      expr += ` ${token} `;
      if (right.prec <= precedence[token]) { // 右辺も同じ優先順位の場合は括弧をつける
        expr += `(${right.value})`;
      } else {
        expr += right.value;
      }

      stack.push({value: expr, prec: precedence[token]});
    }
  });

  return stack.pop().value;
}