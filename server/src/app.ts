import Fastify from "fastify";
import fs from "node:fs";
import { Orario, OrarioParams, OrarioQuery } from "./../types/orario"

const port = Number(process.env.PORT) || 3000;
const fastify = Fastify({
  logger: process.env.NODE_ENV === "development",
});

const days = ["monday", "tuesday", "wednesday", "thursday", "friday"];

const orarioSchema = {
  params: {
    type: "object",
    properties: {
      class: { type: "string" },
    },
  },
  querystring: {
    type: "object",
    properties: {
      day: { type: "number" },
    },
  },
};

const orarioHandler = (request, reply) => {
  const { str } = request.params;
  const { day } = request.query;

  const orario: Orario = JSON.parse(
    fs.readFileSync("./orario/" + str + ".json", "utf-8"),
  );

  return { [days[day - 1]]: orario.schedule[days[day - 1]] };
};

fastify.get<{ Params: OrarioParams; Querystring: OrarioQuery }>(
  "/orario_classe/:str",
  {
    schema: orarioSchema,
    preValidation: (request, reply, done) => {
      if (!request.params.str)
        done(new Error("The class is required. (ex: /1ainf)"));
      else if (!request.query.day)
        done(new Error("The lesson's day is required. (ex: day = 1)"));
      else if (request.query.day <= 0 || request.query.day >= 6)
        done(new Error("The lesson's day have to be between 1 and 5."));
      else done(undefined);
    },
  },
  orarioHandler,
);

fastify.get<{ Params: OrarioParams; Querystring: OrarioQuery }>(
  "/orario_docente/:str",
  {
    schema: orarioSchema,
    preValidation: (request, reply, done) => {
      if (!request.params.str)
        done(new Error("The teacher is required. (ex: /rossi)"));
      else if (!request.query.day)
        done(new Error("The lesson's day is required. (ex: day = 1)"));
      else if (request.query.day <= 0 || request.query.day >= 6)
        done(new Error("The lesson's day have to be between 1 and 5."));
      else done(undefined);
    },
  },
  orarioHandler,
);

fastify.get<{ Params: OrarioParams; Querystring: OrarioQuery }>(
  "/orari_classi",
  (request, reply) => {
    
  },
);

fastify.get<{ Params: OrarioParams; Querystring: OrarioQuery }>(
  "/orari_docenti",
  (request, reply) => {
    
  },
);

fastify.listen({ port }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(0);
  }
  console.log(`Server listening at ${address}`);
});
