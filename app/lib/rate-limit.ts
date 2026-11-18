import { redis } from "@/app/lib/redis";

const rateLimitScript = `
  local current = redis.call("INCR", KEYS[1])

  if current == 1 then
    redis.call("EXPIRE", KEYS[1], ARGV[1])
  end

  local ttl = redis.call("TTL", KEYS[1])

  return { current, ttl }
`;

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetIn: number;
};

export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const result = (await redis.eval(rateLimitScript, {
    keys: [key],
    arguments: [String(windowSeconds)],
  })) as [number, number];

  const [current, ttl] = result;

  return {
    allowed: current <= limit,
    remaining: Math.max(0, limit - current),
    resetIn: ttl,
  };
}