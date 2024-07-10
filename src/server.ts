import fastify from "fastify";
import { prisma } from './lib/prisma'
import { createTrips } from "./routes/create-trip";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { confirmTrip } from "./routes/confirm-trip";
import fastifyCors from "@fastify/cors";
import { confirmParticipant } from "./routes/confirm-participant";
import { createActivity } from "./routes/create-activity";
import { getActivities } from "./routes/get-activities";
import { createLink } from "./routes/create-link";
import { getLinks } from "./routes/get-links";
import { getParticipants } from "./routes/get-participants";
import { createInvite } from "./routes/create-invite";
import { updateTrip } from "./routes/update-trip";

const app = fastify();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(fastifyCors, {
    origin: 'http//localhost:4000'
})
app.register(createTrips)
app.register(confirmTrip)
app.register(confirmParticipant)
app.register(createActivity)
app.register(getActivities)
app.register(createLink)
app.register(getLinks)
app.register(getParticipants)
app.register(createInvite)
app.register(updateTrip)

app.get('/hello', () => {
    return {
        message: 'Hello!'
    }
})

app.get('/listar', async () => {
    const trips = await prisma.trip.findMany();

    return trips
})

app.get('/cadastrar', async () => {
    await prisma.trip.create({
        data: {
            destination: 'Rio de Janeiro',
            starts_at: new Date(),
            ends_at: new Date(),
        }
    })

    return {
        status: 200,
        message: 'Viagem cadastrada com sucesso!'
    }
})

app.listen({ port: 4000 }).then(() => {
    console.log('server running')
})