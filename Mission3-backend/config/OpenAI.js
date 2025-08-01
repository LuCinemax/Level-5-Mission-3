// This is a class for using OpenAI (ChatGPT)
class OpenAI {
  // When you create it, pass in the OpenAI object so it can use it later
  constructor(openai) {
    this.openai = openai;
  }

  // This function runs whenever a message is sent to this route
  async handle(req, res) {
    try {
      // Pull out the job title and the user's message
      const { jobTitle, userResponse } = req.body;

      // Check if jobTitle or userResponse is missing
      if (!jobTitle || !userResponse) {
        throw new Error("MISSING_FIELDS");
      }

      // Chat prompt instructions
      const messages = [
        {
          role: "system",
          content: `
              You are an AI interviewer for the job title: "${jobTitle}".
              Begin with: "Tell me about yourself."
              Then ask up to 6 more standard job interview questions.
              Wait for a user response before asking the next.
              If the user says "end interview", thank them and end the session.
              Keep your questions clear and concise.
          `.trim()
        },
        {
          role: "user",
          content: userResponse
        }
      ];

      // Send the message to ChatGPT and wait for a reply
      const chatResponse = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages
      });

      // Get the text of the reply
      const reply = chatResponse.choices[0].message.content;

      // Send that reply back to the person using the site
      res.json({ response: reply });

    } catch (error) {
      // Handle known missing field error
      if (error.message === "MISSING_FIELDS") {
        console.error("Error: 'jobTitle' or 'userResponse' is missing in the request body.");
        return res.status(400).json({ error: "Job title and user response are required." });
      }

      // Handle any other unexpected error
      console.error("ChatGPT error:", error);
      res.status(500).json({ error: "Failed to get ChatGPT response." });
    }
  }
}

// Make this class available to other files
module.exports = OpenAI;
