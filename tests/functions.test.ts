import Instructor from "@/instructor"
import { describe, expect, test } from "bun:test"
import OpenAI from "openai"
import { z } from "zod"

async function extractUser() {
  const UserSchema = z.object({
    age: z.number(),
    name: z.string().refine(name => name.includes(" "), {
      message: "Name must contain a space"
    })
  })

  type User = z.infer<typeof UserSchema>

  const oai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY ?? undefined,
    organization: process.env.OPENAI_ORG_ID ?? undefined
  })

  const client = Instructor({
    client: oai,
    mode: "FUNCTIONS"
  })

  const user: User = await client.chat.completions.create({
    messages: [{ role: "user", content: "Jason Liu is 30 years old" }],
    model: "gpt-3.5-turbo",

    response_model: UserSchema,
    max_retries: 3
  })

  return user
}

describe("FunctionCall", () => {
  test("Should return extracted name and age based on schema", async () => {
    const user = await extractUser()

    expect(user.name).toEqual("Jason Liu")
    expect(user.age).toEqual(30)
  })
})
