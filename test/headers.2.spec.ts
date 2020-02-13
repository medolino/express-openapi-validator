import * as path from 'path';
import { expect } from 'chai';
import * as request from 'supertest';
import { createApp } from './common/app';
import * as packageJson from '../package.json';

describe(packageJson.name, () => {
  let app = null;

  before(async () => {
    const apiSpec = path.join('test', 'resources', 'headers.yaml');
    app = await createApp(
      { apiSpec },
      3005,
      app => {
        app.use(`${app.basePath}/headers_1`, (req, res) => {
          res.send('headers_1');
        });
        app.use((err, req, res, next) => {
          res.status(err.status ?? 500).json({
            message: err.message,
            code: err.status ?? 500,
          });
        });
      },
      false,
    );
  });

  after(() => {
    app.server.close();
  });

  it.only('should return 400 invalid header', async () => {
    return request(app)
      .get(`${app.basePath}/headers_1`)
      .expect(400)
      .then(r => {
        const e = r.body;
        expect(e.message).to.contain(
          'request.headers should have required property ',
        );
      });
  });

  it.only('should return 200 for valid headers', async () => {
    return request(app)
      .get(`${app.basePath}/headers_1`)
      .set('x-userid', 'some-id')
      .expect(200);
  });
});
