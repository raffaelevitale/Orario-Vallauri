import fastify from "fastify";

// import json schemas as normal
import QuerystringSchema from "@/schemas/querystring.json";
import HeadersSchema from "@/schemas/headers.json";

// import the generated interfaces
import { QuerystringSchema as QuerystringSchemaInterface } from "@/types/querystring";
import { HeadersSchema as HeadersSchemaInterface } from "@/types/headers";

const server = fastify();

server.get<{
  Querystring: QuerystringSchemaInterface;
  Headers: HeadersSchemaInterface;
}>(
  "/auth",
  {
    schema: {
      querystring: QuerystringSchema,
      headers: HeadersSchema,
    },
    preValidation: (request, reply, done) => {
      const { username, password } = request.query;
      done(username !== "admin" ? new Error("Must be admin") : undefined);
    },
    //  or if using async
    //  preValidation: async (request, reply) => {
    //    const { username, password } = request.query
    //    if (username !== "admin") throw new Error("Must be admin");
    //  }
  },
  async (request, reply) => {
    const customerHeader = request.headers["h-Custom"];
    // do something with request data
    return `logged in!`;
  },
);

server.route<{
  Querystring: QuerystringSchemaInterface;
  Headers: HeadersSchemaInterface;
}>({
  method: "GET",
  url: "/auth2",
  schema: {
    querystring: QuerystringSchema,
    headers: HeadersSchema,
  },
  preHandler: (request, reply, done) => {
    const { username, password } = request.query;
    const customerHeader = request.headers["h-Custom"];
    done();
  },
  handler: (request, reply) => {
    const { username, password } = request.query;
    const customerHeader = request.headers["h-Custom"];
    reply.status(200).send({ username });
  },
});

server.listen({ port: 8080 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(0);
  }
  console.log(`Server listening at ${address}`);
});
