const Post = require("../models/Post");
const User = require("../models/auth");

async function postRoutes(fastify, options) {
  fastify.post(
    "/",
    { preValidation: [fastify.authenticate] },
    async (request, reply) => {
      const { content, image } = request.body;
      try {
        const newPost = new Post({
          user: request.user.id,
          content,
          image,
        });
        const savedPost = await newPost.save();
        return reply.code(201).send(savedPost);
      } catch (err) {
        fastify.log.error(err);
        return reply.code(500).send({ message: "Server error" });
      }
    }
  );

  fastify.get(
    "/",
    { preValidation: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const posts = await Post.find()
          .populate("user", "name email")
          .sort({ createdAt: -1 });
        return reply.send(posts);
      } catch (err) {
        fastify.log.error(err);
        return reply.code(500).send({ message: "Server error" });
      }
    }
  );

  fastify.get(
    "/:id",
    { preValidation: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const post = await Post.findById(request.params.id).populate(
          "user",
          "name email"
        );
        if (!post) {
          return reply.code(404).send({ message: "Post not found" });
        }
        return reply.send(post);
      } catch (err) {
        fastify.log.error(err);
        return reply.code(500).send({ message: "Server error" });
      }
    }
  );

  fastify.put(
    "/:id/like",
    { preValidation: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const post = await Post.findById(request.params.id);
        if (!post) {
          return reply.code(404).send({ message: "Post not found" });
        }

        if (post.likes.includes(request.user.id)) {
          post.likes = post.likes.filter(
            (id) => id.toString() !== request.user.id
          );
        } else {
          post.likes.push(request.user.id);
        }
        await post.save();
        return reply.send(post);
      } catch (err) {
        fastify.log.error(err);
        return reply.code(500).send({ message: "Server error" });
      }
    }
  );

  fastify.post(
    "/:id/comment",
    { preValidation: [fastify.authenticate] },
    async (request, reply) => {
      const { text } = request.body;
      try {
        const post = await Post.findById(request.params.id);
        if (!post) {
          return reply.code(404).send({ message: "Post not found" });
        }
        post.comments.push({ user: request.user.id, text, date: new Date() });
        await post.save();
        return reply.send(post);
      } catch (err) {
        fastify.log.error(err);
        return reply.code(500).send({ message: "Server error" });
      }
    }
  );

  fastify.delete(
    "/:id",
    { preValidation: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const post = await Post.findById(request.params.id);
        if (!post) {
          return reply.code(404).send({ message: "Post not found" });
        }
        if (post.user.toString() !== request.user.id) {
          return reply.code(403).send({ message: "Unauthorized action" });
        }
        await post.remove();
        return reply.send({ message: "Post deleted" });
      } catch (err) {
        fastify.log.error(err);
        return reply.code(500).send({ message: "Server error" });
      }
    }
  );
}
module.exports = postRoutes;
