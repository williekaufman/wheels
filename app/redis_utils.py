import redis as r
from typing import Optional, Any
from redis_lock import Lock
import json

redis = r.Redis(connection_pool=r.ConnectionPool(host='localhost', port=6379, db=11))

def rget(key: str, game_id: Optional[int]) -> Optional[str]:
    keys = f"wheels:{key}"
    if game_id is not None:
        key = f"{game_id}:{key}"
        raw_result = redis.get(key)
    else:
        raw_result = redis.get(key)
    return raw_result.decode('utf-8') if raw_result is not None else None


def can_be_inted(x):
    try:
        int(x)
        return True
    except:
        return False


def jsonKeys2int(x):
    if isinstance(x, dict):
        return {int(k) if can_be_inted(k) else k:v for k,v in x.items()}
    return x


def rget_json(key: str):
    raw_result = rget(key)
    return json.loads(raw_result, object_hook=jsonKeys2int) if raw_result is not None else None


def rset(key: str, value: Any, game_id: Optional[int]) -> None:
    key = f"wheels:{key}"
    if game_id is not None:
        key = f"{game_id}:{key}"
        redis.set(key, value, ex=60*60*24*7)
    else:
        redis.set(key, value)


def rset_json(key: str, value: Any, game_id: Optional[int]) -> None:
    rset(key, json.dumps(value), game_id)


def rlock(key: str):
    return Lock(redis, key)
