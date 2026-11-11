/**
 * Shared environment loader.
 *
 * ES module imports are evaluated before the body of the importing file runs,
 * so any module that reads `process.env` at the top level must load this file
 * first. Import it as a side effect (`import '../config/env.js';`) at the top
 * of such modules.
 *
 * Load order:
 *   1. server/.env  (backend-specific configuration)
 *   2. .env         (project root, mainly frontend/Vite variables)
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serverRoot = path.join(__dirname, '..');
const projectRoot = path.join(serverRoot, '..');

dotenv.config({ path: path.join(serverRoot, '.env') });
dotenv.config({ path: path.join(projectRoot, '.env') });
