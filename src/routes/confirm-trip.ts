import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";
import { dayJsHelper } from "../lib/dayJsHelper";
import getMailClient from "../lib/mail";
import nodemailer from 'nodemailer'
import { ClientError } from "../errors/client-error";

export const confirmTrip = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().get('/trips/:tripId/confirm', { // tem que ser get pro usario receber o email
        schema: {
            params: z.object({
                tripId: z.string().uuid()
            })
        }
    }, async (request, reply) => {

        const { tripId } = request.params;

        const trip = await prisma.trip.findUnique({
            where: {
                id: tripId
            },
            include: {
                participants: {
                    where: {
                        is_owner: false
                    }
                }
            }
        })

        if (!trip) throw new ClientError('trip not found on confirm trip route');
        if (trip.is_confirmed) return reply.redirect(`http://localhost:4000/trips/${tripId}`);

        await prisma.trip.update({
            where: { id: tripId },
            data: { is_confirmed: true }
        })


        const formattedStartDate = dayJsHelper(trip.starts_at).format('D [de] MMMM [de] YYYY')
        const formattedEndDate = dayJsHelper(trip.ends_at).format('D [de] MMMM [de] YYYY')

        const mail = await getMailClient();

        await Promise.all(
            trip.participants.map(async (participant) => {
                const confirmationLink = `http://localhost:4000/participants/${participant.id}/confirm`

                const message = await mail.sendMail({
                    from: {
                        name: 'Equipe plann.er',
                        address: 'oi@plann.er'
                    },
                    to: participant.email,
                    subject: `Confirme sua viagem para ${trip.destination}.`,
                    html: `
                        <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
                            <p>Você foi convidado(a) para participar de uma viagem para <strong>${trip.destination}</strong> nas datas de <strong>${formattedStartDate}</strong> até <strong>${formattedEndDate}</strong>.</p>
                            <br />
                            <p>Para confirmar sua presença na viagem, clique no link abaixo:</p>
                            <br />
                            <p>
                                <a href="${confirmationLink}">Confirmar viagem</a>
                            </p>
                            <br />
                            <p>Caso você não saiba do que se trata esse e-mail, apenas ignore esse e-mail.</p>
                        </div>
                    `.trim()
                })

                console.log(nodemailer.getTestMessageUrl(message))
            })
        )


        return reply.redirect((`http://localhost:4000/trips/${tripId}`))
    })
}