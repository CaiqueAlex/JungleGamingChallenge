const { ClientProxyFactory, Transport } = require('@nestjs/microservices');
const { firstValueFrom } = require('rxjs');

async function runTest() {
  console.log('Initializing RabbitMQ client...');

  const client = ClientProxyFactory.create({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://admin:admin@localhost:5672'],
      queue: 'auth_queue',
      queueOptions: { durable: false },
    },
  });

  const userPayload = {
    email: 'teste.duplicado@jungle.com',
    username: 'testerduplicado',
    password: 'strongpassword123',
  };

  console.log('Sending "create_user" message with STATIC payload:', userPayload);

  try {
    const result = await firstValueFrom(
      client.send({ cmd: 'create_user' }, userPayload)
    );
    console.log('✅ Success! Response from auth-service:', result);
  } catch (error) {
    console.error('❌ Error! Response from auth-service:', error);
  } finally {
    await client.close();
    console.log('Client connection closed.');
  }
}

runTest();