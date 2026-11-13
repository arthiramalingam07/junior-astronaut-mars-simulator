import random
from typing import ClassVar


class MissionEventManager:

    WEATHER_TYPES: ClassVar[dict] = {

        "clear": {
            "power": 0,
            "description": "Clear Martian skies."
        },

        "light_dust": {
            "power": -2,
            "description": "Light dust is reducing sunlight."
        },

        "dust_storm": {
            "power": -6,
            "description": "A dust storm is blocking sunlight."
        },

        "severe_storm": {
            "power": -12,
            "description": "A severe dust storm is affecting the habitat."
        }

    }


    EVENTS = (

        {
            "id": "oxygen_leak",

            "title": "Oxygen Leak",

            "description":
                "A leak has been detected in the oxygen supply system.",

            "effects": {
                "oxygen": -18,
                "power": -3
            },

            "explanation":
                "The crew must inspect and repair the oxygen system."
        },

        {
            "id": "power_failure",

            "title": "Power Failure",

            "description":
                "The habitat electrical system has suffered a failure.",

            "effects": {
                "power": -20
            },

            "explanation":
                "Emergency power conservation is recommended."
        },

        {
            "id": "equipment_malfunction",

            "title": "Equipment Malfunction",

            "description":
                "The life-support filter is malfunctioning.",

            "effects": {
                "oxygen": -9,
                "power": -5
            },

            "explanation":
                "Equipment failures can affect multiple habitat systems."
        },

        {
            "id": "recycling_problem",

            "title": "Water Recycling Problem",

            "description":
                "The water recycling system is blocked.",

            "effects": {
                "water": -15
            },

            "explanation":
                "Water recycling systems require regular maintenance."
        },

        {
            "id": "maintenance_success",

            "title": "Successful Maintenance",

            "description":
                "Routine maintenance improves habitat performance.",

            "effects": {
                "power": 5,
                "oxygen": 3
            },

            "explanation":
                "Regular maintenance prevents small problems from becoming serious."
        }

    )


    def generate_weather(self, state):

        weather = random.choices(

            population=[
                "clear",
                "light_dust",
                "dust_storm",
                "severe_storm"
            ],

            weights=[
                50,
                25,
                18,
                7
            ],

            k=1

        )[0]

        return weather


    def apply_weather(self, state, weather):

        state.weather = weather

        weather_config = self.WEATHER_TYPES[weather]

        state.resources.apply_changes({

            "power": weather_config["power"]

        })


    def generate_event(self, state):

        # 45% chance of a random emergency or maintenance event

        if random.random() > 0.55:

            return None

        return random.choice(self.EVENTS)


    def apply_event(self, state, event):

        if not event:

            return

        state.resources.apply_changes(
            event["effects"]
        )

        state.event_history.append({

            "day": state.current_day,

            "id": event["id"],

            "title": event["title"],

            "description": event["description"],

            "effects": event["effects"],

            "explanation": event["explanation"]

        })