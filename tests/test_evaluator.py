from mission_state import MissionState

from mission_evaluator import MissionEvaluator


def test_mission_failure():

    state = MissionState()

    state.resources.oxygen = 0

    evaluator = MissionEvaluator()

    result = evaluator.evaluate(state)

    assert result == "FAILED"


def test_mission_success():

    state = MissionState(current_day=7)

    evaluator = MissionEvaluator()

    result = evaluator.evaluate(state)

    assert result == "SUCCESS"


def test_mission_report():

    state = MissionState(current_day=7)

    evaluator = MissionEvaluator()

    evaluator.evaluate(state)

    report = evaluator.create_report(state)

    assert report["status"] == "SUCCESS"

    assert "power" in report["resources"]