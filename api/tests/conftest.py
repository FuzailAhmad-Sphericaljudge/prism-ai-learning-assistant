import pytest
from fastapi.testclient import TestClient
from api.main import create_app
from api.config import Settings, get_settings


@pytest.fixture
def test_settings():
    return Settings(
        APP_NAME="PRISM API Test",
        APP_ENV="test",
        DEBUG=False,
        LLM_PROVIDER="mock",
    )


@pytest.fixture
def client(test_settings):
    app = create_app(settings=test_settings)
    app.dependency_overrides[get_settings] = lambda: test_settings
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
