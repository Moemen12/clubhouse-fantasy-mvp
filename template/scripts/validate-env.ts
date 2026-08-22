import { formatEnvValidationError, validateEnv } from "../src/shared/kernel";

try {
  validateEnv();
  console.log("Required environment configuration is valid.");
} catch (error) {
  console.error(`Invalid environment configuration:\n${formatEnvValidationError(error)}`);
  process.exit(1);
}
