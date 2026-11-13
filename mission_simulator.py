from typing import Any, ClassVar

from mission_events import MissionEventManager


class MissionSimulator:

    ACTIONS: ClassVar[dict[str, dict[str, Any]]] = {

        "conserve_energy": {

            "title": "Conserve Energy",

            "effects": {
                "power": 8
            },

            "feedback":
                "You saved electricity by reducing non-essential equipment use."

        },

        "repair_solar_panels": {

            "title": "Repair Solar Panels",

            "effects": {
                "power": -5
            },

            "feedback":
                "The repair used power, but solar generation will improve."

        },

        "recycle_water": {

            "title": "Recycle Water",

            "effects": {
                "water": 12,
                "power": -4
            },

            "feedback":
                "Water was recovered, but the recycling system consumed electricity."

        },

        "grow_food": {

            "title": "Grow Food",

            "effects": {
                "water": -7,
                "power": -5
            },

            "feedback":
                "The greenhouse is growing food for future days."

        },

        "inspect_equipment": {

            "title": "Inspect Equipment",

            "effects": {
                "power": -2,
                "oxygen": 5
            },

            "feedback":
                "Equipment inspection improved the life-support system."

        },

        "improve_shielding": {

            "title": "Improve Radiation Shielding",

            "effects": {
                "power": -6
            },

            "feedback":
                "The crew improved the simulated radiation shelter."

        }

    }


    def __init__(self):

        self.event_manager = MissionEventManager()


    def perform_action(self, state, action):

        if action not in self.ACTIONS:

            return False, "Invalid action."


        if state.status != "ACTIVE":

            return False, "Mission has ended."


        requirements = {

            "repair_solar_panels": {
                "power": 5
            },

            "recycle_water": {
                "power": 4
            },

            "grow_food": {
                "power": 5,
                "water": 7
            },

            "inspect_equipment": {
                "power": 2
            },

            "improve_shielding": {
                "power": 6
            }

        }


        for resource, amount in requirements.get(action, {}).items():

            if getattr(state.resources, resource) < amount:

                return False, f"Not enough {resource}."


        config = self.ACTIONS[action]

        state.resources.apply_changes(
            config["effects"]
        )


        if action == "conserve_energy":

            state.energy_conservation = True

        elif action == "repair_solar_panels":

            state.solar_repair_bonus = True

        elif action == "grow_food":

            state.greenhouse_bonus = True


        state.action_history.append({

            "day": state.current_day,

            "action": action,

            "title": config["title"],

            "effects": config["effects"]

        })


        state.feedback = config["feedback"]

        return True, state.feedback


    def apply_daily_changes(self, state):

        power_use = (
            7 if state.energy_conservation else 11
        )

        changes = {

            "power": -power_use,

            "oxygen": -8,

            "water": -7,

            "food": -9

        }


        if state.solar_repair_bonus:

            changes["power"] += 5


        if state.greenhouse_bonus:

            changes["food"] += 11


        state.resources.apply_changes(changes)


        # Reset daily bonuses

        state.energy_conservation = False


        # Generate weather

        weather = self.event_manager.generate_weather(state)

        self.event_manager.apply_weather(
            state,
            weather
        )


        # Generate random mission event

        event = self.event_manager.generate_event(state)


        if event:

            self.event_manager.apply_event(
                state,
                event
            )

            state.current_event = event

            state.feedback = event["explanation"]

        else:

            state.current_event = None

            weather_messages = {

                "clear": "Clear weather. Habitat systems are operating normally.",

                "light_dust": "Light dust is affecting solar generation.",

                "dust_storm": "A dust storm is reducing solar power generation.",

                "severe_storm": "WARNING! A severe Martian dust storm is approaching."

            }

            state.feedback = weather_messages[weather]


        return event


    def advance_day(self, state):

        self.apply_daily_changes(state)

        return state