const fp = require('fastify-plugin');

async function authMiddleware(fastify, options) {
    fastify.decorate("authenticate", async (request, reply) => {
        try {
            await request.jwtVerify();
        } catch (err) {
            reply.code(401).send({ message: "Unauthorized" });
        }
    });
}

module.exports = fp(authMiddleware);
