import { Extension, HDirection, HPacket } from "gnode-api";
import extensionInfo from "./package.json" assert { type: "json" };

process.on("uncaughtException", (error) => {
  console.error(error);
  process.exit(0);
});

const ext = new Extension(extensionInfo);

ext.run();

ext.interceptByNameOrHash(HDirection.TOSERVER, "Chat", onCommandSended);
ext.interceptByNameOrHash(HDirection.TOSERVER, "MoveAvatar", onAutoClick);

let extensionEnabled = false;
let interval;

function onCommandSended(hMessage) {
  const packet = hMessage.getPacket();
  const textMessage = packet.readString();

  if (textMessage === ":autoclick") {
    hMessage.blocked = true;
    extensionEnabled = !extensionEnabled;

    if (!extensionEnabled) {
      clearInterval(interval);
      interval = null;
    }

    const chatPacket = new HPacket(
      `{in:Whisper}{i:1}{s:"AutoClick has been ${
        extensionEnabled ? "activated" : "deactivated"
      }"}{i:0}{i:34}{i:0}{i:-1}`
    );
    ext.sendToClient(chatPacket);
  }
}

function onAutoClick(hMessage) {
  if (extensionEnabled && !interval) {
    const packet = hMessage.getPacket();
    interval = setInterval(() => {
      ext.sendToServer(packet);
    }, 500);
  }
}
