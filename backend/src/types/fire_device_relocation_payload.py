from typing import TypedDict, NotRequired


class FireDeviceRelocationPayload(TypedDict):
    building_id: int
    floor: str
    location_desc: str
    actor_id: NotRequired[int]
    actor_role: NotRequired[str]
    note: NotRequired[str]
