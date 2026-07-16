
from pathlib import Path

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
