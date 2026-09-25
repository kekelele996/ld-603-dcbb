from typing import TypedDict


class RelocateDevicePayload(TypedDict, total=False):
    building_id: int
    floor: str
    location_desc: str
    operator_role: str


FireDevicePayload = dict
RelocateFireDevicePayload = RelocateDevicePayload
