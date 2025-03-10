require('dotenv').config();
const mongoose = require('mongoose');
const fastify = require("fastify")({ logger: true });
fastify.register(require('@fastify/jwt'), { secret: process.env.JWT_SECRET });
fastify.register(require('./middleware/auth'));

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log(`Connected !!`))
  .catch((error) => console.log('mongo.error',error.message));

fastify.get("/", async (request, reply) => {
    return { message: "Hello, Fastify!" };
});

fastify.register(require('./routes/auth'), { prefix: '/api/auth' });
fastify.register(require('./routes/post'), { prefix: '/api/post' });

fastify.listen({ port: 3000 }, (err, address) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    console.log(`Server is running on ${address}`);
});
