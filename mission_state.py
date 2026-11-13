from dataclasses import dataclass, field


@dataclass
class ResourceManager:

    power: int = 100
    oxygen: int = 100
    water: int = 100
    food: int = 100

    def apply_changes(self, changes):

        for resource, amount in changes.items():

            if hasattr(self, resource):

                current = getattr(self, resource)

                setattr(
                    self,
                    resource,
                    max(0, min(100, current + amount))
                )

    def get_resource_levels(self):

        return {
            "power": self.power,
            "oxygen": self.oxygen,
            "water": self.water,
            "food": self.food
        }


@dataclass
class MissionState:

    current_day: int = 1

    mission_duration: int = 7

    status: str = "NOT_STARTED"

    resources: ResourceManager = field(
        default_factory=ResourceManager
    )

    action_history: list = field(default_factory=list)

    event_history: list = field(default_factory=list)

    resource_history: list = field(default_factory=list)

    current_event: dict = field(default_factory=dict)

    feedback: str = ""

    weather: str = "clear"

    energy_conservation: bool = False

    solar_repair_bonus: int = 0

    greenhouse_bonus: int = 0

    def __post_init__(self):

        if not self.resource_history:

            self.record_resources()

    def record_resources(self):

        self.resource_history.append({

            "day": self.current_day,

            **self.resources.get_resource_levels()

        })

    def to_dict(self):

        return {

            "current_day": self.current_day,

            "mission_duration": self.mission_duration,

            "status": self.status,

            "resources": self.resources.get_resource_levels(),

            "action_history": self.action_history,

            "event_history": self.event_history,

            "resource_history": self.resource_history,

            "current_event": self.current_event,

            "feedback": self.feedback,

            "weather": self.weather,

            "energy_conservation": self.energy_conservation,

            "solar_repair_bonus": self.solar_repair_bonus,

            "greenhouse_bonus": self.greenhouse_bonus

        }