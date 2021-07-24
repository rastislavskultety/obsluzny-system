import * as shell from "shelljs";

// Copy configuration files
shell.mkdir("-p", "dist");
shell.cp("-R", "src/config", "dist/config");

