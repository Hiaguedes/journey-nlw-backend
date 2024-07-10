import fastify from "fastify";
import { prisma } from './lib/prisma'
import { createTrips } from "./routes/create-trip";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { confirmTrip } from "./routes/confirm-trip";
import fastifyCors from "@fastify/cors";
import { confirmParticipant } from "./routes/confirm-participant";

const app = fastify();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(fastifyCors, {
    origin: 'http//localhost:4000'
})
app.register(createTrips)
app.register(confirmTrip)
app.register(confirmParticipant)

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