import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";

export const createLink = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().post('/trips/:tripId/links', {
        schema: {
            params: z.object({
                tripId: z.string().uuid(),
            }),
            body: z.object({
                title: z.string(),
                url: z.string(),
            })
        }
    }, async (request, reply) => {
        const { url, title } = request.body;
        const { tripId } = request.params;

        const link = await prisma.link.create({
            data: {
                title,
                url,
                trip_id: tripId
            }
        })

        return {
            message: `link created with id ${link.id}`,
        }
    })
}