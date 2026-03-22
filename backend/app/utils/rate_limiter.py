import time
from fastapi import Request, HTTPException
from app.utils.cache import cache

class RateLimiter:
    def __init__(self, requests_per_minute: int = 60):
        self.requests_per_minute = requests_per_minute

    async def __call__(self, request: Request):
        # Using IP as a simple identifier
        client_ip = request.client.host
        key = f"rate_limit:{client_ip}"
        
        current_time = int(time.time())
        window = current_time // 60
        
        redis_key = f"{key}:{window}"
        count = await cache.redis.incr(redis_key)
        
        if count == 1:
            await cache.redis.expire(redis_key, 60)
            
        if count > self.requests_per_minute:
            raise HTTPException(status_code=429, detail="Too many requests")

# Global limiters
default_limiter = RateLimiter(requests_per_minute=20)
ai_gen_limiter = RateLimiter(requests_per_minute=10)
