import { VERSION } from "../global";
import chalk from "chalk";

export const band =
    chalk.hex("#7799CC")("█") +
    chalk.hex("#335566")("█") +
    chalk.hex("#BB9955")("█") +
    chalk.hex("#AA4477")("█") +
    chalk.hex("#779977")("█");

export const info = chalk.hex("#7799CC")(
    `
${band + chalk.reset(chalk.bold(" Project Sakiko"), chalk.gray("v" + VERSION))}

${chalk.reset(`Sakiko is a scalable cross-platform chatbot framework, simple yet stupidly powerful.`)}
${chalk.gray(`- For more information or documents about the project, see https://togawa-dev.github.io/docs/`)}
${chalk.gray(`- @togawa-dev 2025 | MIT License`)}
    `
);
