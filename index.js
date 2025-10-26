import { Command } from 'commander';
import fs from 'fs/promises';
import http from 'http';
import { XMLBuilder } from 'fast-xml-parser';
import path from 'path';
import url from 'url';

const program = new Command();

program
  .requiredOption('-i, --input <path>')
  .requiredOption('-h, --host <address>')
  .requiredOption('-p, --port <number>', parseInt)
  .action(async ({ input, host, port }) => {
    const inputPath = path.resolve(process.cwd(), input);

    try {
      await fs.access(inputPath);
    } catch {
      console.error(`Input file not found`);
      process.exit(1);
    }

    const builder = new XMLBuilder({ format: true });

    const server = new http.Server(async (req, res) => {
      try {
        const data = await fs.readFile(inputPath, 'utf8');
        const json = JSON.parse(data);

        const { mfo, normal } = url.parse(req.url, true).query;

        let filtered = json;
        if (normal === 'true') {
          filtered = filtered.filter(b => b.COD_STATE?.toString() === '1');
        }

        const banksXml = filtered.map(b => {
          const bankObj = {
            mfo_code: b.MFO,
            name: b.SHORTNAME,
            state_code: b.COD_STATE
          };
          if (mfo === 'true') {
            bankObj.mfo_code = b.MFO;
          }
          return bankObj;
        });

        const xmlData = builder.build({ banks: { bank: banksXml } });

        res.writeHead(200, { 'Content-Type': 'application/xml; charset=utf-8' });
        res.end(xmlData);
      } catch (err) {
        console.error(err);
        res.writeHead(500);
        res.end('Internal Server Error');
      }
    });

    server.listen(port, host, () => {
      console.log(`Server running at http://${host}:${port}/`);
    });
  });

program.parse();
