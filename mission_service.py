from mission_evaluator import MissionEvaluator
from mission_simulator import MissionSimulator
from mission_state import MissionState


class MissionService:

    def __init__(self):
        self.simulator = MissionSimulator()
        self.evaluator = MissionEvaluator()
        self.state = None

    def start_mission(self):
        self.state = MissionState()
        self.state.status = "ACTIVE"
        return self.state.to_dict()

    def get_mission_state(self):
        if self.state is None:
            return {
                "status": "NOT_STARTED",
                "resources": {},
                "message": "Start a mission first."
            }

        return self.state.to_dict()

    def perform_action(self, action):
        if self.state is None:
            return {"error": "Start a mission first."}, 400

        if self.state.status != "ACTIVE":
            return {"error": "Mission is not active."}, 400

        success, message = self.simulator.perform_action(
            self.state, action
        )

        if not success:
            return {
                "error": message,
                "state": self.state.to_dict()
            }, 400

        self.evaluator.evaluate(self.state)
        self.state.record_resources()

        return {
            "message": message,
            "state": self.state.to_dict()
        }, 200

    def advance_mission(self):
        if self.state is None:
            return {"error": "No active mission."}, 400

        if self.state.status != "ACTIVE":
            return {"error": "Mission has ended."}, 400

        self.simulator.advance_day(self.state)
        self.evaluator.evaluate(self.state)

        if self.state.status == "ACTIVE":
            self.state.current_day += 1

        self.state.record_resources()

        return {"state": self.state.to_dict()}, 200

    def get_mission_report(self):
        if self.state is None or self.state.status == "ACTIVE":
            return {"error": "Mission is not complete."}, 400

        return self.evaluator.create_report(self.state), 200