import type { LoaderArgs } from "@remix-run/cloudflare";
import logo from "../logo.svg";

async function postMessageToDiscord(webhookUrl: string, message: string) {
  try {
    await fetch(webhookUrl, {
      method: "post",
      body: JSON.stringify({
        content: message,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("Message sent to Discord channel");
  } catch (error) {
    console.error("Error sending message to Discord:", error);
  }
}

export const loader = async ({ context }: LoaderArgs) => {
  await postMessageToDiscord(
    context.env.WEBHOOK_URL,
    `Someone is at the door: ${new Date().toLocaleTimeString("en-US", {
      timeZone: "America/Chicago",
    })}`
  );
  return null;
};

export default function Index() {
  return (
    <div className="space-y-4 max-w-xl mx-auto">
      <img className="mx-auto max-w-xs" src={logo} alt="" />
      <h1 className="font-bold text-2xl">Austin JavaScript Meetup</h1>
      <p className="text-slate-700 text-sm">
        🛎️ We've been notified that you're at the door, someone will be right
        there to let you in! Join us on{" "}
        <a
          className="underline text-violet-500"
          href="https://discord.gg/4RZUtBwQ"
        >
          Discord
        </a>
        !
      </p>
      <p className="text-pink-500">
        You will need to sign in at the table on the right.
      </p>
    </div>
  );
}
