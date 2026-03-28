from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import date, time


class ResourceBase(BaseModel):
    name: str
    type: str = "classroom"
    building: str = "Main Building"
    floor: int = 1
    capacity: int = 40
    status: str = "available"
    features: Dict[str, Any] = {}
    department: str = "Computer Science"


class ResourceCreate(ResourceBase):
    pass


class ResourceUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    building: Optional[str] = None
    floor: Optional[int] = None
    capacity: Optional[int] = None
    status: Optional[str] = None
    features: Optional[Dict[str, Any]] = None
    department: Optional[str] = None


class ResourceResponse(ResourceBase):
    id: int
    os_concept_note: str = "Each resource is analogous to a hardware device in an OS - managed by the resource allocator (kernel) and accessed through system calls."

    class Config:
        from_attributes = True


class ResourceAvailability(BaseModel):
    resource_id: int
    resource_name: str
    resource_type: str
    available_slots: List[Dict[str, str]]
    os_concept_note: str = "Checking resource availability mirrors the OS checking device status registers before granting access to a process."


class ResourcePoolState(BaseModel):
    resource_type: str
    total: int
    allocated: int
    free: int
    bitmap: List[int]
    allocation_map: Dict[str, str]
    fragmentation_ratio: float
    os_concept_note: str = "Resource pool management uses bitmap allocation similar to how OS tracks free/used memory blocks. Fragmentation occurs when free resources are scattered non-contiguously."
