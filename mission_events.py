import random


class MissionEventManager:

    EVENTS = (

        {
            "id": "dust_storm",

            "title": "Dust Storm",

            "description":
                "A powerful dust storm is approaching the habitat.",

            "effects": {
                "power": -14
            },

            "explanation":
                "Dust reduces sunlight reaching solar panels. "
                "Conserving electricity helps protect life-support systems."
        },

        {
            "id": "equipment_malfunction",

            "title": "Equipment Malfunction",

            "description":
                "A life-support filter is malfunctioning.",

            "effects": {
                "oxygen": -9,
                "power": -3
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
                "water": -12
            },

            "explanation":
                "Water recycling systems require regular maintenance."
        },

        {
            "id": "power_damage",

            "title": "Power System Damage",

            "description":
                "A damaged electrical connection reduces available power.",

            "effects": {
                "power": -10
            },

            "explanation":
                "Electrical maintenance is essential for habitat survival."
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

    def generate_event(self, state):

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

            "title": event["title"],

            "description": event["description"],

            "effects": event["effects"],

            "explanation": event["explanation"]

        })