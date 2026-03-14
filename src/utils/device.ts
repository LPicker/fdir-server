import os from "os";

interface IpAddressOptions {
  internal?: boolean;
  family?: "IPv4" | "IPv6";
}

export function getIpAddress(
  options: IpAddressOptions = { internal: false, family: "IPv4" },
): string {
  const _internal = options.internal ?? false;
  const _family = options.family ?? "IPv4";
  const interfaces = os.networkInterfaces();
  for (const interfaceName of Object.keys(interfaces)) {
    const _interface = interfaces[interfaceName];
    if (!_interface) continue;

    for (const alias of _interface) {
      if (alias.internal === _internal && alias.family === _family) {
        return alias.address;
      }
    }
  }
  return "127.0.0.1";
}

getIpAddress();
