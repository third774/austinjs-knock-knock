import { json, type LoaderArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { QRCodeSVG } from "qrcode.react";
import invariant from "tiny-invariant";
import { KV_DATE_NAMESPACE } from "~/constants";
import logo from "../logo.svg";

export const loader = async ({ context, request }: LoaderArgs) => {
  const url = new URL(request.url);

  const hours = Number(url.searchParams.get("hours") ?? 24);
  invariant(!isNaN(hours));
  const eventId = crypto.randomUUID();
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + hours);

  console.log("putting", KV_DATE_NAMESPACE + eventId, expiry.toISOString());

  await context.env.KV.put(KV_DATE_NAMESPACE + eventId, expiry.toISOString());

  const link = new URL(url.origin);
  link.pathname = "/knock-knock";
  link.searchParams.set("eventId", eventId);

  return json({ link });
};

export default function Index() {
  const { link } = useLoaderData<typeof loader>();

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="font-bold text-3xl">Austin JavaScript Meetup</h1>
      <p className="text-slate-700">
        👋 Hello! Scan the QR code to have us let you in!
      </p>
      <a className="block" href={link}>
        <QRCodeSVG
          width={undefined}
          height={undefined}
          value={link}
          level="Q"
          imageSettings={{
            src: logo,
            height: 32,
            width: 32,
            excavate: true,
          }}
        />
      </a>
    </div>
  );
}
