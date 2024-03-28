import { FastifyInstance } from "fastify";
import { Server } from "socket.io";

export default interface CustomFastifyInstance extends FastifyInstance {
    io?: Server;
}