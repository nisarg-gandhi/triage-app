import asyncio

# Module-level registry: ticket_id -> list of asyncio.Queue instances (one per SSE connection).
# Defined here (instead of inside the tickets router) so that both crud.py and the tickets
# router can import it without creating a circular dependency.
ticket_subscribers: dict[int, list[asyncio.Queue]] = {}
