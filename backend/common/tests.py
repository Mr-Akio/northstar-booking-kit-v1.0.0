
from pathlib import Path
from unittest.mock import patch

from django.test import Client
from django.test import SimpleTestCase


class DotenvLoadingTests(SimpleTestCase):
    def test_load_dotenv_file_reads_missing_values_only(self):
        from common.env import load_dotenv_file

        env_file = Path(__file__).resolve().parent.parent / ".env.test"
        env_file.write_text(
            "DATABASE_URL=postgresql://demo:demo@localhost:5432/demo\n"
            "DJANGO_SECRET_KEY=from-env-file\n"
            "EMPTY_VALUE=\n",
            encoding="utf-8",
        )

        self.addCleanup(lambda: env_file.unlink(missing_ok=True))

        current_environ = {}
        load_dotenv_file(env_file, current_environ)

        self.assertEqual(current_environ["DATABASE_URL"], "postgresql://demo:demo@localhost:5432/demo")
        self.assertEqual(current_environ["DJANGO_SECRET_KEY"], "from-env-file")
        self.assertEqual(current_environ["EMPTY_VALUE"], "")

    def test_load_dotenv_file_preserves_existing_values(self):
        from common.env import load_dotenv_file

        env_file = Path(__file__).resolve().parent.parent / ".env.test"
        env_file.write_text("DATABASE_URL=postgresql://demo:demo@localhost:5432/demo\n", encoding="utf-8")

        self.addCleanup(lambda: env_file.unlink(missing_ok=True))

        current_environ = {"DATABASE_URL": "postgresql://override:override@localhost:5432/override"}
        load_dotenv_file(env_file, current_environ)

        self.assertEqual(current_environ["DATABASE_URL"], "postgresql://override:override@localhost:5432/override")


class RuntimeStartupTests(SimpleTestCase):
    def test_build_gunicorn_command_uses_runtime_port(self):
        from common.runtime import build_gunicorn_command

        self.assertEqual(
            build_gunicorn_command("10000"),
            [
                "gunicorn",
                "config.wsgi:application",
                "--bind",
                "0.0.0.0:10000",
                "--workers",
                "3",
            ],
        )

    def test_run_startup_runs_migrate_before_gunicorn(self):
        from common.runtime import build_gunicorn_command, run_startup

        with (
            patch("common.runtime.subprocess.run") as mock_run,
            patch("common.runtime.subprocess.Popen") as mock_popen,
            self.assertRaises(SystemExit) as raised,
        ):
            mock_popen.return_value.wait.return_value = 0
            run_startup("10000")

        mock_run.assert_called_once_with(["python", "manage.py", "migrate"], check=True)
        mock_popen.assert_called_once_with(build_gunicorn_command("10000"))
        mock_popen.return_value.wait.assert_called_once_with()
        self.assertEqual(raised.exception.code, 0)

    def test_start_main_uses_port_environment_variable(self):
        with patch("start.run_startup") as mock_run_startup, patch.dict("os.environ", {"PORT": "10000"}, clear=False):
            from start import main

            main()

        mock_run_startup.assert_called_once_with(port="10000", workers=3, run_migrate=True)


class HealthCheckTests(SimpleTestCase):
    def test_health_check_returns_ok_payload(self):
        response = Client().get("/api/health/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok"})


class HostingTests(SimpleTestCase):
    def test_extend_allowed_hosts_adds_render_hostname_once(self):
        from common.hosting import extend_allowed_hosts

        self.assertEqual(
            extend_allowed_hosts(["localhost"], "northstar-booking-kit-v1-0-0.onrender.com"),
            ["localhost", "northstar-booking-kit-v1-0-0.onrender.com"],
        )

    def test_extend_allowed_hosts_ignores_blank_or_duplicate_values(self):
        from common.hosting import extend_allowed_hosts

        self.assertEqual(
            extend_allowed_hosts(["localhost", "northstar-booking-kit-v1-0-0.onrender.com"], "northstar-booking-kit-v1-0-0.onrender.com"),
            ["localhost", "northstar-booking-kit-v1-0-0.onrender.com"],
        )
        self.assertEqual(extend_allowed_hosts(["localhost"], ""), ["localhost"])
