/**
 * Calculates the least common multiple of a list of numbers.
 *
 * @param {Array.<number>} numbers The array of numbers.
 *
 * @returns {number} The result of the least common multiple calculation.
 */
function lcm(...numbers) {
  const gcd = (numbers) => {
    if (!numbers.length) return 0;
    else if (numbers.length === 1) return Math.abs(numbers[0]);
    else
      return numbers
        .slice(1)
        .reduce(
          (a, b) =>
            ((f, a, b) => f(f, a, b))(
              (f, a, b) => (!b ? a : f(f, b, a % b)),
              a,
              b
            ),
          Math.abs(numbers[0])
        );
  };

  if (!numbers.length) return 0;
  else if (numbers.length === 1) return Math.abs(numbers[0]);
  else return Math.abs(numbers.reduce((acc, n) => acc * n, 1)) / gcd(numbers);
}

export default lcm;
