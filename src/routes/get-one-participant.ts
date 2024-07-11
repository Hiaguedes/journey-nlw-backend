import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";
import { ClientError } from "../errors/client-error";

export const getOneParticipant = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().get('/participants/:participantId', {
        schema: {
            params: z.object({
                participantId: z.string().uuid(),
            }),
        }
    }, async (request, reply) => {
        const { participantId } = request.params;

        const participant = await prisma.participant.findUnique({
            select: {
                id: true,
                name: true,
                is_confirmed: true,
                email: true,
            },
            where: {
                id: participantId,
            },
           })

        if(!participant) throw new ClientError('participant not found on get one participant route');

        
        return {
            participant
        }
    })
}