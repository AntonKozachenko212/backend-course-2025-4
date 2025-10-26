import { Command } from 'commander';
import fs from 'fs';
import http from 'http';

const program = new Command();

const requestListener = (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Working');
};

const server = new http.Server(requestListener);

program
  .name('lab4')
  .version('1.0')
  .requiredOption('-i, --input <file>')
  .requiredOption('-h, --host <ip>')
  .requiredOption('-p, --port <number>');

program.parse(process.argv);
const options = program.opts();

if (!fs.existsSync(options.input)) {
  console.error(`Input file not found at ${options.input}`);
  process.exit(1);
}

const host = options.host;
const port = parseInt(options.port, 10);

if (isNaN(port) || port <= 0) {
  console.error('Invalid port number provided.');
  process.exit(1);
}

server.listen(port, host, () => {
  console.log(`Server works at: http://${host}:${port}`);
});
