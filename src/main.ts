import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { useContainer } from 'class-validator';
import { AppModule } from './modules/main/app.module';
import { setupSwagger } from './swagger';
import {
  RpcClient,
  Encoding,
  NetworkType,
  UtxoContext,
  UtxoProcessor,
} from 'wasm/kaspa_wasm';

globalThis.WebSocket = require('websocket').w3cwebsocket;

async function testKaspa() {
  const rpc = new RpcClient(
    '157.90.239.78',
    Encoding.Borsh,
    NetworkType.Testnet,
  );
  await rpc.connect({});
  const processor = await new UtxoProcessor({
    rpc,
    networkId: 'testnet-10',
  });
  const context = await new UtxoContext({ processor });

  processor.events.registerListener((event) => {
    console.log('event:', event);
  });

  console.log('start');
  await context.trackAddresses(
    ['kaspatest:qzl0vj9ry9j7lew4rj8rh4kd5fj6hru7hrmvjp7fkzxgug4nj4h8gr8gd3sl9'],
    undefined,
  );

  // TODO: it stucks here
  console.log('done');
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  setupSwagger(app);
  app.enableCors();
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  await testKaspa();

  await app.listen(3000);
}
bootstrap();
