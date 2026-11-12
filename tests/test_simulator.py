from mission_state import MissionState
from mission_simulator import MissionSimulator


class NoEvents:

    def generate_event(self, state):
        return None

    def apply_event(self, state, event):
        return event


def test_conserve_energy():

    state = MissionState()

    simulator = MissionSimulator()

    simulator.event_manager = NoEvents()

    success, message = simulator.perform_action(
        state,
        "conserve_energy"
    )

    assert success is True

    assert state.energy_conservation is True


def test_invalid_action():

    state = MissionState()

    simulator = MissionSimulator()

    success, message = simulator.perform_action(
        state,
        "invalid_action"
    )

    assert success is False


def test_daily_resource_consumption():

    state = MissionState()

    simulator = MissionSimulator()

    simulator.event_manager = NoEvents()

    simulator.advance_day(state)

    assert state.resources.oxygen == 92

    assert state.resources.water == 93

    assert state.resources.food == 91

    assert state.resources.power == 89