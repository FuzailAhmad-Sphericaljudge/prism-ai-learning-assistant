import uuid


def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["app"] == "PRISM API Test"
    assert data["team"] == "The Falcons"
    assert "firewall" in data


def test_health_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["app"] == "PRISM API Test"
    assert data["llm_provider"] == "mock"
    assert "uptime_seconds" in data
    assert "timestamp" in data
    assert data["timestamp"].endswith("Z")


def test_version_endpoint(client):
    response = client.get("/version")
    assert response.status_code == 200
    data = response.json()
    assert data["team"] == "The Falcons"
    assert data["firewall"] == "Temporal Evidence Firewall v1.0"


def test_request_id_middleware_generated(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert "X-Request-ID" in response.headers
    # Verify valid UUID
    req_id = response.headers["X-Request-ID"]
    parsed = uuid.UUID(req_id)
    assert str(parsed) == req_id


def test_request_id_middleware_preserved(client):
    custom_id = "prism-test-trace-12345"
    response = client.get("/health", headers={"X-Request-ID": custom_id})
    assert response.status_code == 200
    assert response.headers.get("X-Request-ID") == custom_id


def test_process_time_header(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert "X-Process-Time-Ms" in response.headers
    duration = float(response.headers["X-Process-Time-Ms"])
    assert duration >= 0.0
