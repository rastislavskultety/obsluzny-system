/*
 * Pomocný súbor pre kopírovanie súborov v rámci build-u aplikácie
 */
import * as shell from "shelljs";

shell.cp("-R", "src/config", "dist/config"); // Skopíruj konfiguračné súbory
shell.cp("-R", "src/data", "dist/data"); // Skopíruj databázu

