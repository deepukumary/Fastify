const bcrypt = require("bcrypt");
const User = require("../models/auth");

async function authRoutes(fastify, options) {
  fastify.post("/login", async (request, reply) => {
    const { email, password } = request.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return reply.code(400).send({ message: "Invalid email or password" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return reply.code(400).send({ message: "Invalid email or password" });
      }

      const token = fastify.jwt.sign(
        { id: user._id },
        { sign: { expiresIn: "1h" } }
      );

      return reply.send({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ message: "Server error" });
    }
  });

  // Register Route
  fastify.post("/register", async (request, reply) => {
    const { name, email, password } = request.body;

    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return reply.code(400).send({ message: "Email is already in use" });
      }

      const newUser = new User({ name, email, password });
      await newUser.save();
      console.log('User registered successfully!')
      return reply.send({ message: "User registered successfully!" });
    } catch (err) {
      fastify.log.error(err);
      console.log('User wan not registered successfully!')

      return reply.code(500).send({ message: "Server error" });
    }
  });
}

module.exports = authRoutes;
