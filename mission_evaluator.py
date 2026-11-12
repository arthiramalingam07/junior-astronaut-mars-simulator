class MissionEvaluator:

    CRITICAL_RESOURCES = (
        "power",
        "oxygen",
        "water",
        "food"
    )

    def check_failure(self, state):

        for resource in self.CRITICAL_RESOURCES:

            value = getattr(state.resources, resource)

            if value <= 0:

                state.status = "FAILED"

                state.feedback = (
                    f"Mission failed! {resource.upper()} "
                    "has reached zero."
                )

                return True

        return False

    def check_success(self, state):

        if state.current_day >= state.mission_duration:

            state.status = "SUCCESS"

            state.feedback = (
                "Congratulations! Your crew survived "
                "the seven-day Mars mission!"
            )

            return True

        return False

    def evaluate(self, state):

        if self.check_failure(state):

            return "FAILED"

        self.check_success(state)

        return state.status

    def create_report(self, state):

        return {

            "status": state.status,

            "days_survived": min(
                state.current_day,
                state.mission_duration
            ),

            "mission_duration": state.mission_duration,

            "resources": state.resources.get_resource_levels(),

            "actions": state.action_history,

            "events": state.event_history,

            "lessons": [

                "Power supports important habitat systems.",

                "Water recycling helps conserve supplies.",

                "Food production requires time and resources.",

                "Equipment maintenance prevents failures."

            ]

        }