import { Parser } from "expr-eval";
const parser = new Parser();

export const expressionParser = (expression, variables) => {
  try {
    const expr = parser.parse(expression);
    return expr.evaluate(variables);
  } catch (error) {
    console.error("Error evaluating expression:", error);
    return false;
  }
};
