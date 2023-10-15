import { json, type LoaderArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { KV_DATE_NAMESPACE } from "~/constants";
import { knockedCookie } from "~/utils/cookies";
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

export const loader = async ({ request, context }: LoaderArgs) => {
  const url = new URL(request.url);
  const eventId = url.searchParams.get("eventId");

  const expiryString = await context.env.KV.get(KV_DATE_NAMESPACE + eventId);

  console.log("getting", KV_DATE_NAMESPACE + eventId, expiryString);

  if (!expiryString)
    return json({
      type: "missingEventId",
    } as const);

  const expiry = new Date(expiryString);
  const now = new Date();

  if (expiry < now) {
    return json({
      type: "eventExpired",
    } as const);
  }

  const knockedRecently = await knockedCookie.parse(
    request.headers.get("Cookie"),
  );

  if (knockedRecently) {
    return json({
      type: "notification_sent",
    } as const);
  }

  const { timezone } = (request as any).cf;
  const message = `Someone is at the door: ${new Date().toLocaleTimeString(
    "en-US",
    {
      timeZone: timezone,
    },
  )} (${timezone})`;
  if (context.env.WEBHOOK_URL && !knockedRecently) {
    await postMessageToDiscord(context.env.WEBHOOK_URL, message);
  } else {
    console.log(
      "WEBHOOK_URL missing, would have sent the following message: \n" +
        message,
    );
  }

  return json(
    {
      type: "notification_sent",
    } as const,
    {
      headers: {
        "Set-Cookie": await knockedCookie.serialize(true),
      },
    },
  );
};

export default function Index() {
  const { type } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-4 max-w-xl mx-auto">
      <img className="mx-auto max-w-xs" src={logo} alt="" />
      <h1 className="font-bold text-2xl">Austin JavaScript Meetup</h1>
      {type === "eventExpired" && (
        <p className="text-sm">
          Dang, you missed us! Looks like this event has expired.
        </p>
      )}
      {type === "missingEventId" && (
        <p className="text-sm">Whoops, we can't find that event!</p>
      )}
      {type === "notification_sent" && (
        <>
          <p className="text-sm">
            🛎️ We've been notified that you're at the door, someone will be
            right there to let you in!
          </p>
          <p className="text-pink-700 dark:text-pink-400">
            You will need to sign in at the table on the right.
          </p>
        </>
      )}
      <p className="text-sm">
        Join us on{" "}
        <a
          className="underline text-violet-500"
          href="https://discord.gg/4RZUtBwQ"
        >
          Discord
        </a>
        !
      </p>
    </div>
  );
}
