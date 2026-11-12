from flask import Flask, jsonify, render_template, request

from mission_service import MissionService
from nasa_data_fetcher import NASADataFetcher

app = Flask(__name__)

mission = MissionService()

nasa = NASADataFetcher()


@app.route("/")
def home():

    return render_template("index.html")


@app.route("/api/mission/start", methods=["POST"])
def start_mission():

    return jsonify(
        mission.start_mission()
    )


@app.route("/api/mission/state", methods=["GET"])
def mission_state():

    return jsonify(
        mission.get_mission_state()
    )


@app.route("/api/mission/action", methods=["POST"])
def perform_action():

    data = request.get_json(silent=True) or {}

    action = data.get("action", "")

    result, status = mission.perform_action(action)

    return jsonify(result), status


@app.route("/api/mission/advance", methods=["POST"])
def advance_mission():

    result, status = mission.advance_mission()

    return jsonify(result), status


@app.route("/api/mission/report", methods=["GET"])
def mission_report():

    result, status = mission.get_mission_report()

    return jsonify(result), status


@app.route("/api/images/mars", methods=["GET"])
def mars_images():

    return jsonify(
        nasa.search_mars_images()
    )


@app.route("/api/health", methods=["GET"])
def health():

    return jsonify({
        "ok": True,
        "application": "Junior Astronaut Mission Trainer"
    })


if __name__ == "__main__":

    app.run(debug=True)