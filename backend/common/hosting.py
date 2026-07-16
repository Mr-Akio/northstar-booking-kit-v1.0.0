from __future__ import annotations


def extend_allowed_hosts(allowed_hosts: list[str], render_external_hostname: str) -> list[str]:
    hostname = render_external_hostname.strip()
    if not hostname or hostname in allowed_hosts:
        return allowed_hosts
    return [*allowed_hosts, hostname]
