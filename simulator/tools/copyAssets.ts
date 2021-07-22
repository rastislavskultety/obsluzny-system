import * as shell from "shelljs";

// Copy configuration files
shell.cp("-R", "src/config", "dist/config");

